import { allowedTarget } from "./interaction-targets.js?v=room04-low-desk-v2";
import { ROOM06_LANDMARKS, ROOM06_ENERGY_PATHS } from "./room06-art.js";
import { distanceBetween } from "./collision.js";
import {
  DOOR06_COMPLETION, DOOR06_STAGE_TRANSITION, DOOR06_WRONG_HINTS,
  startDialogue,
} from "./dialogue.js";
import { setMessage } from "./state.js?v=room04-low-desk-v2";
import { roomCompletionActive, showRoomCompletion } from "./completion-feedback.js";

export const DOOR06_RELAY_ORDER = Object.freeze(["subject", "answer", "patch", "voices", "rhythm"]);
export const DOOR06_CORE = Object.freeze({
  id: "door06-fugata-core", ...ROOM06_LANDMARKS.core, interactionRadius: 72,
});
export const DOOR06_FINAL_REFERENCE_CONSOLE = Object.freeze({
  id: "door06-final-reference", ...ROOM06_LANDMARKS.final, interactionRadius: 64,
});
export const DOOR06_RELAY_LAYOUT = Object.freeze([
  { id: "door06-relay-subject", relayId: "subject", displayName: "樂句主題繼電器", audioKey: "door01FragmentA", ...ROOM06_LANDMARKS.relays[0] },
  { id: "door06-relay-answer", relayId: "answer", displayName: "主題答句繼電器", audioKey: "door02AnswerA", ...ROOM06_LANDMARKS.relays[1] },
  { id: "door06-relay-patch", relayId: "patch", displayName: "合成器接線繼電器", audioKey: "door03PatchComplete", ...ROOM06_LANDMARKS.relays[2] },
  { id: "door06-relay-voices", relayId: "voices", displayName: "聲部繼電器", audioKey: "door04ReferenceMix", ...ROOM06_LANDMARKS.relays[3] },
  { id: "door06-relay-rhythm", relayId: "rhythm", displayName: "節奏繼電器", audioKey: "door05RhythmComplete", ...ROOM06_LANDMARKS.relays[4] },
]);
export const DOOR06_MEMORY_LAYOUT = Object.freeze([
  { prismId: "door06-prism-01", ...ROOM06_LANDMARKS.memories[0] },
  { prismId: "door06-prism-02", ...ROOM06_LANDMARKS.memories[1] },
  { prismId: "door06-prism-03", ...ROOM06_LANDMARKS.memories[2] },
]);
const MEMORY_DEFINITIONS = Object.freeze([
  { id: "door06-memory-a", audioKey: "door06MemoryA", isCorrect: true },
  { id: "door06-memory-b", audioKey: "door06MemoryB", isCorrect: false },
  { id: "door06-memory-c", audioKey: "door06MemoryC", isCorrect: false },
]);

export function createDoor06Relays() {
  return DOOR06_RELAY_LAYOUT.map((relay, index) => ({
    ...relay,
    interactionRadius: 58,
    activated: false,
    playing: false,
    energyLevel: 0,
    cablePath: ROOM06_ENERGY_PATHS[index].map(point => ({ ...point })),
  }));
}
export function createDoor06Memories(random = Math.random) {
  const shuffled = MEMORY_DEFINITIONS.map((memory) => ({ ...memory }));
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.map((memory, index) => ({
    ...memory, ...DOOR06_MEMORY_LAYOUT[index],
    displayLabel: `記憶片段 ${["I", "II", "III"][index]}`,
    interactionRadius: 76, isPlaying: false, isSelected: false, visualState: "dormant",
  }));
}
export function nearestDoor06Relay(state) { return nearestWithin(state, state.door06Relays); }
export function nearestDoor06Memory(state) { return nearestWithin(state, state.door06Memories); }
export function nearDoor06FinalReference(state) {
  return allowedTarget(state,state.door06FinalReferenceConsole) && distanceBetween(state.player, state.door06FinalReferenceConsole)
    <= state.door06FinalReferenceConsole.interactionRadius;
}
export function activeDoor06Relay(state) {
  const relayId = DOOR06_RELAY_ORDER[state.door06.activeRelayIndex];
  return state.door06Relays.find((relay) => relay.relayId === relayId) ?? null;
}

export function handleDoor06Listen(state, audio) {
  const door = state.door06;
  if (isDoor06InputLocked(state)) return false;
  const relay = nearestDoor06Relay(state);
  if (relay) {
    if (door.stage !== "relays") {
      setMessage(state, ["繼電器順序已完成。", "請前往最終參考段落。"], 2, "door");
      return true;
    }
    const expected = activeDoor06Relay(state);
    if (!relay.activated && relay.relayId !== expected?.relayId) {
      setMessage(
        state,
        [`下一個訊號是 ${expected?.displayName ?? "最終參考段落"}。`, "請依序沿著發光路徑前進。"],
        2.5,
        "blocked",
      );
      return true;
    }
    const replay = relay.activated;
    const played = audio.playDoor06Preview?.(relay.audioKey, relay.id, "relay") ?? false;
    if (!played) {
      setDoor06AudioError(state, relay.displayName);
      return true;
    }
    door.playingRelayId = relay.relayId;
    door.relayPlaybackStatus = replay ? "replay" : "progress";
    door.status = replay ? "relay-replay" : "relay-playing";
    resetIdleHint(door);
    setMessage(
      state,
      [
        `${replay ? "重聽" : "正在回復"} ${relay.displayName}……`,
        replay ? "這次只重聽，不會重複增加進度。" : "完整播放後才會確認這個繼電器。",
      ],
      3,
      "preview",
    );
    return true;
  }
  if (nearDoor06FinalReference(state)) {
    if (!door.finalReferenceUnlocked || !["final-reference", "memories"].includes(door.stage)) {
      setMessage(state, ["請先依序完成五個核心繼電器。", "最終參考段落仍然鎖定。"], 2.4, "blocked");
      return true;
    }
    const played = audio.playDoor06Preview?.(
      "door06FinalReference", state.door06FinalReferenceConsole.id, "reference",
    ) ?? false;
    if (played) {
      door.status = "reference-playing";
      setMessage(state, ["最終參考段落播放中……", "請完整聆聽至自然結束。"], 3, "preview");
    } else {
      setDoor06AudioError(state, "最終參考段落");
      door.status = "reference-ready";
    }
    return true;
  }
  const memory = nearestDoor06Memory(state);
  if (!memory) return false;
  if (!door06ReadyForAnswer(state)) {
    setMessage(state, ["請先完整聆聽最終參考段落。", "記憶片段會在播放自然結束後解鎖。"], 2.6, "blocked");
    return true;
  }
  const played = audio.playDoor06Preview?.(memory.audioKey, memory.id, "memory") ?? false;
  if (played) {
    door.status = "memory-ready";
    setMessage(state, [`${memory.displayLabel} 播放中……`, "E — 試聽 · Enter — 選取"], 2.4, "preview");
  } else setDoor06AudioError(state, memory.displayLabel);
  return true;
}

export function handleDoor06Enter(state, audio) {
  const door = state.door06;
  if (isDoor06InputLocked(state)) return false;
  const memory = nearestDoor06Memory(state);
  if (!memory) return false;
  if (!door06ReadyForAnswer(state)) {
    setMessage(state, ["記憶片段尚未解鎖。", "請先完成繼電器順序與最終參考段落。"], 2.5, "blocked");
    return true;
  }
  audio.stopDoor06Preview?.();
  door.selectedMemoryId = memory.id;
  door.status = "confirming";
  for (const item of state.door06Memories) item.isSelected = item.id === memory.id;
  memory.visualState = "selected";
  state.ui.message = null; // One HTML confirmation owns selection feedback.
  return true;
}

export function handleDoor06PreviewState(state, next) {
  const door = state.door06;
  door.finalReferencePlaying = next.playing && next.kind === "reference";
  if (next.kind === "relay" && !next.playing) {
    if (door.stage !== "relays" || !["relay-playing", "relay-replay"].includes(door.status)
      || !state.door06Relays.some(item => item.id === next.entityId && item.relayId === door.playingRelayId)) return;
    const relay = state.door06Relays.find((item) => item.id === next.entityId);
    const wasProgress = door.relayPlaybackStatus === "progress"
      && relay?.relayId === DOOR06_RELAY_ORDER[door.activeRelayIndex];
    door.relayPlaybackStatus = "idle";
    door.playingRelayId = null;
    if (next.completed && wasProgress && relay) {
      relay.activated = true;
      door.relays[relay.relayId] = true;
      door.completedRelayIds.push(relay.relayId);
      door.activatedRelayCount += 1;
      door.activeRelayIndex += 1;
      if (door.activeRelayIndex >= DOOR06_RELAY_ORDER.length) beginStageTransition(state);
      else {
        door.status = "restoring";
        const upcoming = activeDoor06Relay(state);
        setMessage(state, [`${relay.displayName} 已回復。`, `下一個：${upcoming.displayName}`], 2.8, "success");
      }
    } else if (door.stage === "relays") {
      door.status = "restoring";
    }
    return;
  }
  if (next.kind === "reference" && !next.playing) {
    if (door.status !== "reference-playing" || next.entityId !== state.door06FinalReferenceConsole.id) return;
    if (next.completed && door.finalReferenceUnlocked) {
      door.finalReferenceCompleted = true;
      door.memoriesUnlocked = true;
      door.stage = "memories";
      door.status = "memory-ready";
      for (const memory of state.door06Memories) memory.visualState = "available";
      setMessage(state, ["最終參考段落已完整播放", "三段記憶片段已啟動。E 試聽，Enter 選取，再按 Space 確認。"], 4, "success");
    } else if (door.finalReferenceUnlocked && !door.finalReferenceCompleted) {
      door.status = "reference-ready";
    }
  }
}

export function updateDoor06(state, deltaTime, audio) {
  const door = state.door06;
  if (state.gameProgress.currentRoom === 6 && door.status === "open" && !state.dialogue.active && !door.completionDialogueShown && !roomCompletionActive(state, 6)) {
    door.completionDialogueShown = true;
    startDialogue(state, "door06-completion", DOOR06_COMPLETION);
  }
  if (door.stage === "relay-transition" && !state.dialogue.active && door.transitionDialogueShown) {
    door.stage = "final-reference";
    door.status = "reference-ready";
    door.idleElapsed = 0;
  }
  if (door.status === "checking") {
    door.checkingRemaining = Math.max(0, door.checkingRemaining - deltaTime);
    if (door.checkingRemaining <= 0) resolveDoor06Memory(state, audio);
    return;
  }
  if (door.status === "rejected") {
    door.rejectionRemaining = Math.max(0, door.rejectionRemaining - deltaTime);
    if (door.rejectionRemaining <= 0) {
      door.status = "memory-ready";
      door.selectedMemoryId = null;
      for (const memory of state.door06Memories) {
        memory.isSelected = false;
        memory.visualState = "available";
      }
    }
    return;
  }
  if (door.status === "reconstructing") {
    door.reconstructElapsed += deltaTime;
    if (door.reconstructElapsed >= door.reconstructDuration) {
      door.status = "opening";
      door.openingProgress = 0;
    }
    return;
  }
  if (door.status === "opening") {
    door.openingProgress = Math.min(1, door.openingProgress + deltaTime / door.openingDuration);
    if (door.openingProgress < 1) return;
    door.status = "open";
    door.exitOpen = true;
    return;
  }
  if (door.endingTriggered && !door.endingTransitionReady) {
    door.endingTransitionElapsed += deltaTime;
    if (door.endingTransitionElapsed >= 0.85) door.endingTransitionReady = true;
  }
}

export function beginDoor06Ending(state, audio) {
  if (state.door06.endingTriggered || !state.door06.exitOpen) return false;
  state.door06.endingTriggered = true;
  state.door06.endingTransitionElapsed = 0;
  state.door06.endingTransitionReady = false;
  audio.stopDoor06Preview?.();
  audio.stopDoor06Success?.(0.55);
  return true;
}

function beginStageTransition(state) {
  const door = state.door06;
  door.coreUnlocked = true;
  door.finalReferenceUnlocked = true;
  door.stage = "relay-transition";
  door.status = "stage-transition";
  door.transitionDialogueShown = true;
  for (const memory of state.door06Memories) memory.visualState = "dormant";
  startDialogue(state, "door06-stage-transition", DOOR06_STAGE_TRANSITION);
}

function resolveDoor06Memory(state, audio) {
  const door = state.door06;
  const selected = state.door06Memories.find((memory) => memory.id === door.selectedMemoryId);
  if (!selected || !door06ReadyForAnswer(state)) { door.status = "confirming"; cancelDoor06Selection(state); return; }
  if (!selected.isCorrect) {
    door.wrongAttempts += 1;
    door.status = "rejected";
    door.rejectionRemaining = 1;
    for (const memory of state.door06Memories) {
      memory.visualState = memory.id === selected.id ? "rejected" : "available";
    }
    setMessage(state, ["這段記憶並不是最後回歸的樂句主題。"], 2.8, "rejected");
    const hint = DOOR06_WRONG_HINTS[Math.min(3, door.wrongAttempts)];
    if (hint) startDialogue(state, `door06-wrong-${door.wrongAttempts}`, hint);
    return;
  }
  audio.stopDoor06Preview?.();
  state.gameProgress.flags.reconstructionCompleted = true;
  state.gameProgress.doorsCompleted = 6;
  door.completed = true;
  door.status = "reconstructing";
  door.reconstructElapsed = 0;
  showRoomCompletion(state, 6);
  for (const memory of state.door06Memories) {
    memory.visualState = memory.id === selected.id ? "correct-locked" : "dormant";
  }
  const successPlayed = audio.playDoor06Success?.() ?? false;
  door.escapeAudioPlayed = successPlayed;
  if (!successPlayed) {
    state.audio.door06SuccessStatus = "Error";
    state.audio.door06AssetsStatus = "Error";
    state.ui.audioNotice.status = "Error";
    state.ui.audioNotice.alpha = 1;
    state.ui.audioNotice.remaining = Infinity;
  }
  setMessage(state, [
    `你確認的「${selected.displayLabel}」與最終參考相符。`,
    "最初的樂句主題已經回歸，重構後請走向右側出口。",
    successPlayed ? "《Fugata》重構完成" : "音訊錯誤：完成音訊無法播放。",
  ], 4, "success");
}

function resetIdleHint(door) { door.idleElapsed = 0; }
function setDoor06AudioError(state, label) {
  state.audio.door06AssetsStatus = "Error";
  setMessage(state, [`音訊錯誤：${label} 無法播放。`], 2.5, "audio");
}
function isDoor06InputLocked(state) {
  return [
    "relay-playing", "relay-replay", "reference-playing", "stage-transition",
    "confirming", "checking", "rejected", "reconstructing", "opening", "open",
  ].includes(state.door06.status) || state.door06.endingTriggered;
}
function nearestWithin(state, entities) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const entity of entities) {
    if(!allowedTarget(state,entity,typeof position==="function"?position(entity):entity))continue;
    const distance = distanceBetween(state.player, entity);
    if (distance <= entity.interactionRadius && distance < nearestDistance) {
      nearest = entity;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function door06ReadyForAnswer(state) {
  const door = state.door06;
  return door.stage === "memories" && door.memoriesUnlocked && door.finalReferenceCompleted
    && door.activatedRelayCount === 5 && door.activeRelayIndex === 5
    && DOOR06_RELAY_ORDER.every((id, index) => door.completedRelayIds[index] === id
      && door.relays[id] && state.door06Relays.find(relay => relay.relayId === id)?.activated);
}
export function confirmDoor06Selection(state, audio) {
  const door = state.door06;
  if (door.status !== "confirming" || !door06ReadyForAnswer(state) || !door.selectedMemoryId) return false;
  const selected = state.door06Memories.find(memory => memory.id === door.selectedMemoryId);
  if (!selected) return false;
  audio.stopDoor06Preview?.();
  door.status = "checking";
  door.checkingRemaining = 0.72;
  selected.visualState = "checking";
  setMessage(state, [`已確認送出 ${selected.displayLabel}，核心比對中……`], 2, "door");
  return true;
}
export function cancelDoor06Selection(state) {
  if (state.door06.status !== "confirming") return false;
  state.door06.selectedMemoryId = null;
  state.door06.status = "memory-ready";
  for (const memory of state.door06Memories) { memory.isSelected = false; memory.visualState = "available"; }
  setMessage(state, ["已取消選取，可以繼續比較記憶片段。"], 2, "door");
  return true;
}
