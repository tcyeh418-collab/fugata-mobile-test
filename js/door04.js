import { allowedTarget } from "./interaction-targets.js?v=room04-movement-fixes-v6";
import { distanceBetween } from "./collision.js";
import {
  DOOR04_COMPLETION,
  DOOR04_REFERENCE_COMPLETION,
  DOOR04_STAGE_COMPLETION,
  DOOR04_WRONG_HINTS,
  startDialogue,
} from "./dialogue.js";
import { setMessage } from "./state.js?v=room04-movement-fixes-v6";
import { roomCompletionActive, showRoomCompletion } from "./completion-feedback.js";
import {
  ROOM04_DEVICE_GEOMETRY,
  ROOM04_PLACEMENTS,
} from "./room04-layout.js?v=room04-movement-fixes-v6";

export const DOOR04_PREVIEW_MAX_DURATION = 15;
export const DOOR04_CORRECT_ORDER = Object.freeze([
  "door04-voice-a", "door04-voice-b", "door04-voice-c", "door04-voice-d",
]);
export const DOOR04_STAGE_COUNTS = Object.freeze({ reference: 2, pair: 2, trio: 3, quartet: 4 });
export const DOOR04_PEDESTALS = ROOM04_PLACEMENTS.voicePedestals;
const VOICE_DEFINITIONS = Object.freeze([
  { id: "door04-voice-a", audioKey: "door04VoiceA" },
  { id: "door04-voice-b", audioKey: "door04VoiceB" },
  { id: "door04-voice-c", audioKey: "door04VoiceC" },
  { id: "door04-voice-d", audioKey: "door04VoiceD" },
]);
export const DOOR04_REFERENCE_CONSOLE = Object.freeze({
  id: "door04-reference-console",
  ...ROOM04_PLACEMENTS.referenceConsole,
  interactionRadius: ROOM04_DEVICE_GEOMETRY.referenceInteractionRadius,
});
export const DOOR04_TEST_CONSOLE = Object.freeze({
  id: "door04-test-console",
  ...ROOM04_PLACEMENTS.testConsole,
  interactionRadius: ROOM04_DEVICE_GEOMETRY.testInteractionRadius,
});
export const DOOR04_SLOT_LAYOUT = ROOM04_PLACEMENTS.voiceSlots;

export function createDoor04Capsules(random = Math.random) {
  const shuffled = VOICE_DEFINITIONS.map((voice) => ({ ...voice }));
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.map((voice, index) => {
    const pedestal = DOOR04_PEDESTALS[index];
    return {
      ...voice,
      displayLabel: `音匣 ${["甲","乙","丙","丁"][index]}`,
      pedestalId: pedestal.id,
      x: pedestal.x,
      y: pedestal.y,
      interactionRadius: ROOM04_DEVICE_GEOMETRY.voiceInteractionRadius,
      originalPosition: { x: pedestal.x, y: pedestal.y },
      currentLocation: "pedestal",
      isHeld: false,
      isPlaced: false,
      slotIndex: null,
      isPlaying: false,
      visualLevel: 0,
    };
  });
}

export function createDoor04Slots() {
  return DOOR04_SLOT_LAYOUT.map((slot) => ({
    ...slot,
    width: ROOM04_DEVICE_GEOMETRY.slotWidth,
    height: ROOM04_DEVICE_GEOMETRY.slotHeight,
    assignedVoiceId: null,
    interactionRadius: ROOM04_DEVICE_GEOMETRY.slotInteractionRadius,
    visualState: "empty",
  }));
}

export function heldDoor04Voice(state) {
  return state.door04Capsules.find((voice) => voice.id === state.door04.heldVoiceId) ?? null;
}
export function door04VoiceById(state, voiceId) {
  return state.door04Capsules.find((voice) => voice.id === voiceId) ?? null;
}
export function nearestDoor04Pedestal(state) {
  return nearestVoice(state, (voice) => voice.currentLocation === "pedestal");
}
export function nearestDoor04Slot(state) {
  return nearestWithin(state, state.door04Slots);
}
export function nearDoor04Reference(state) {
  return allowedTarget(state,state.door04ReferenceConsole) && distanceBetween(state.player, state.door04ReferenceConsole)
    <= state.door04ReferenceConsole.interactionRadius;
}
export function nearDoor04Test(state) {
  return allowedTarget(state,state.door04TestConsole) && distanceBetween(state.player, state.door04TestConsole)
    <= state.door04TestConsole.interactionRadius;
}
export function door04PlacedCount(state) {
  return state.door04.slotAssignments.filter(Boolean).length;
}
export function door04StageEntryCount(state) {
  return DOOR04_STAGE_COUNTS[state.door04.stage] ?? 0;
}

export function door04TestConsoleLabel(testEntryCount) {
  return {
    2: "測試位置 1–2",
    3: "測試位置 1–3",
    4: "測試位置 1–4",
  }[testEntryCount] ?? "測試終端";
}

export function handleDoor04Enter(state) {
  if (isDoor04InputLocked(state)) { if(["preparing","testing"].includes(state.door04.status))setMessage(state,["請先停止序列，再拿放或試聽音匣。"],2.5,"testing"); return false; }
  const carried = heldDoor04Voice(state);
  if (
    carried
    && allowedTarget(state,carried,carried.originalPosition)
    && distanceBetween(state.player, carried.originalPosition) <= carried.interactionRadius
  ) {
    return cancelDoor04Carry(state);
  }
  const pedestalVoice = nearestDoor04Pedestal(state);
  if (pedestalVoice) return handlePedestalEnter(state, pedestalVoice);
  const slot = nearestDoor04Slot(state);
  if (slot) return handleSlotEnter(state, slot);
  return false;
}

export function handleDoor04ListenOrTest(state, audio) {
  if (isDoor04InputLocked(state)) { if(["preparing","testing"].includes(state.door04.status))setMessage(state,["請先停止序列，再拿放或試聽音匣。"],2.5,"testing"); return false; }
  if (nearDoor04Reference(state)) return controlDoor04Reference(state, audio);
  const held = heldDoor04Voice(state);
  if (held && allowedTarget(state,held,state.player)) return previewVoice(state, audio, held);
  const pedestalVoice = nearestDoor04Pedestal(state);
  if (pedestalVoice) return previewVoice(state, audio, pedestalVoice);
  const slot = nearestDoor04Slot(state);
  const slottedVoice = slot ? door04VoiceById(state, slot.assignedVoiceId) : null;
  if (slottedVoice) return previewVoice(state, audio, slottedVoice);
  if (!nearDoor04Test(state)) return false;
  if (!state.door04.referenceCompleted) {
    setMessage(state, ["請先完整聽完參考混音，再測試排列。", "現在可以拿放、試聽音匣；參考混音可暫停與繼續。"], 3, "door");
    return true;
  }
  const required = door04StageEntryCount(state);
  const ready = state.door04.slotAssignments
    .slice(0, required).every(Boolean);
  if (!required || !ready) {
    setMessage(state, [`請先完成目前的「${stageLabel(state.door04.stage)}」。`, `測試前請填滿位置 1–${roman(required - 1)}。`], 2.5, "door");
    return true;
  }
  return beginDoor04Test(state, audio);
}

export function handleDoor04PreviewState(state, next) {
  const door = state.door04;
  if (next.kind !== "reference" || next.playing) return;
  if (next.completed) {
    door.referenceCompleted = true;
    door.referencePlaybackStatus = "completed";
    if (door.stage === "reference") {
      door.stage = "pair";
      door.testEntryCount = 2;
      door.status = "arranging";
      setMessage(state, ["參考混音播放完成", "聲部排列測試已解鎖"], 3.2, "success");
      startDialogue(state, "door04-reference-completion", DOOR04_REFERENCE_COMPLETION);
    } else if (!["preparing", "testing", "opening", "open"].includes(door.status)) {
      door.status = "arranging";
    }
  } else {
    door.referencePlaybackStatus = next.reason === "paused" ? "paused" : door.referenceCompleted ? "completed" : "idle";
    if (!["preparing", "testing", "opening", "open"].includes(door.status)) {
      door.status = door.referenceCompleted ? "arranging" : "reference-ready";
    }
  }
}

export function stopDoor04Sequence(state,audio) {
  state.door04.sequenceRequest=(state.door04.sequenceRequest||0)+1;
  audio.stopDoor04Test?.();
  Object.assign(state.door04,{status:state.door04.referenceCompleted?'arranging':'reference-ready',testStatus:'idle',testElapsed:0,activeEntryCount:0,testProgress:0});
  state.audio.door04TestPlaying=false;door04RestoreSlotStates(state);
}
export function beginDoor04Test(state, audio, restart=false) {
  const door=state.door04,count=door04StageEntryCount(state);
  if (['preparing','testing'].includes(door.status) && !restart)return false;
  if (state.dialogue.active || state.tutorialOpen || ['rejected','opening','open'].includes(door.status) || !door.referenceCompleted || !count)return false;
  const voiceIds=door.slotAssignments.slice(0,count);
  if(voiceIds.length!==count || !voiceIds.every(Boolean)){setMessage(state,['請先填滿本階段已解鎖的位置。'],3,'door');return false;}
  // Resolve the player's slots to stable asset keys; never reorder by label or answer.
  const audioKeys=voiceIds.map(id=>door04VoiceById(state,id)?.audioKey);
  if(audioKeys.some(key=>!key)){setDoor04AudioError(state,'音匣對應資料');return false;}
  stopDoor04Sequence(state,audio);
  const request=door.sequenceRequest;
  Object.assign(door,{status:'preparing',testStatus:'preparing',testEntryCount:count,sequenceVoiceIds:[...voiceIds],testError:null,testProgress:0});
  setMessage(state,['正在備妥整串音訊……','準備完成後依位置順序，逐段完整播放。'],4,'testing');
  Promise.resolve(audio.startDoor04Test(audioKeys)).then(transport=>{
    if(request!==door.sequenceRequest || state.gameProgress.currentRoom!==4 || state.phase!=='game')return;
    if(!transport){Object.assign(door,{status:'arranging',testStatus:'idle'});return;}
    Object.assign(door,{status:'testing',testStatus:'playing',testDuration:transport.duration,testElapsed:0});
    state.audio.door04TestPlaying=true;
  }).catch(error=>{
    if(request!==door.sequenceRequest)return;
    Object.assign(door,{status:'arranging',testStatus:'error',testError:error.message||'無法準備整串音訊，請重試。'});
    state.audio.door04TestPlaying=false;door04RestoreSlotStates(state);
    setMessage(state,[door.testError,'按「從頭播放／重試」重新準備。'],8,'audio');
  });
  return true;
}

export function updateDoor04(state, deltaTime, audio) {
  const door = state.door04;
  if (door.status === "open") {
    if (state.gameProgress.currentRoom === 4 && !state.dialogue.active && !door.completionDialogueShown && !roomCompletionActive(state, 4)) {
      door.completionDialogueShown = true;
      startDialogue(state, "door04-completion", DOOR04_COMPLETION);
    }
    return;
  }
  if (door.status === 'preparing') return; // Async audio preparation has no transport yet.
  if (door.status === 'testing') {
    const transport=audio.getDoor04TestProgress?.();
    if(!transport){Object.assign(door,{status:'arranging',testStatus:'idle',activeEntryCount:0});state.audio.door04TestPlaying=false;return;}
    door.testElapsed=transport.elapsed;door.testProgress=transport.progress;door.activeEntryCount=transport.index;
    for(const slot of state.door04Slots)slot.visualState=slot.index===transport.index-1?'testing':slot.index<door.confirmedEntryCount?'correct-locked':slot.assignedVoiceId?'occupied':'empty';
    if(transport.completed)finishDoor04Test(state,audio);
    return;
  }
  if (door.status === "rejected") {
    door.rejectionRemaining = Math.max(0, door.rejectionRemaining - deltaTime);
    if (door.rejectionRemaining <= 0) {
      door.status = "arranging";
      door.testStatus = "idle";
      door04RestoreSlotStates(state);
    }
    return;
  }
  if (door.status !== "opening") return;
  door.openingProgress = Math.min(1, door.openingProgress + deltaTime / door.openingDuration);
  if (door.openingProgress < 1) return;
  door.status = "open";
}

function handlePedestalEnter(state, voice) {
  const held = heldDoor04Voice(state);
  if (held) {
    setMessage(state, ["你已經攜帶一個聲部音匣。", "請先把它放入目前的進場格。"], 2, "carry");
    return true;
  }
  voice.currentLocation = "held";
  voice.isHeld = true;
  state.door04.heldVoiceId = voice.id;
  setMessage(state, [`攜帶中：${voice.displayLabel}`], 1.8, "carry");
  return true;
}

function handleSlotEnter(state, slot) {
  const door = state.door04;
  const required = door04StageEntryCount(state);
  if (slot.index >= required) {
    setMessage(state, [`位置 ${roman(slot.index)} 尚未解鎖。`, `請先完成「${stageLabel(door.stage)}」。`], 2.2, "door");
    return true;
  }
  if (slot.index < door.confirmedEntryCount) {
    setMessage(state, [`位置 ${roman(slot.index)} 已確認並鎖定。`, "已確認的位置不能更改。"], 2.2, "success");
    return true;
  }
  const held = heldDoor04Voice(state);
  const assigned = door04VoiceById(state, slot.assignedVoiceId);
  if (held && !assigned) {
    assignVoiceToSlot(state, held, slot);
    door.heldVoiceId = null;
    held.isHeld = false;
    return true;
  }
  if (!held && assigned) {
    unassignToHand(state, assigned, slot);
    return true;
  }
  if (held && assigned) {
    assignVoiceToSlot(state, held, slot);
    held.isHeld = false;
    assigned.currentLocation = "held";
    assigned.isPlaced = false;
    assigned.isHeld = true;
    assigned.slotIndex = null;
    door.heldVoiceId = assigned.id;
    setMessage(state, ["已交換聲部。", `攜帶中：${assigned.displayLabel}`], 1.8, "slot");
    return true;
  }
  return false;
}

function assignVoiceToSlot(state, voice, slot) {
  if (state.room04Presentation) state.room04Presentation.placementRemaining = 1.2;
  slot.assignedVoiceId = voice.id;
  state.door04.slotAssignments[slot.index] = voice.id;
  slot.visualState = "occupied";
  voice.currentLocation = "slot";
  voice.isPlaced = true;
  voice.slotIndex = slot.index;
  setMessage(state, [`${voice.displayLabel} 已放入位置 ${roman(slot.index)}`], 1.8, "slot");
}

function unassignToHand(state, voice, slot) {
  slot.assignedVoiceId = null;
  state.door04.slotAssignments[slot.index] = null;
  slot.visualState = "empty";
  voice.currentLocation = "held";
  voice.isPlaced = false;
  voice.isHeld = true;
  voice.slotIndex = null;
  state.door04.heldVoiceId = voice.id;
  setMessage(state, [`已取出 ${voice.displayLabel}`, `攜帶中：${voice.displayLabel}`], 1.8, "carry");
}

function previewVoice(state, audio, voice) {
  const played = audio.playDoor04Voice?.(voice.audioKey, voice.id, DOOR04_PREVIEW_MAX_DURATION) ?? false;
  if (played) setMessage(state, [`${voice.displayLabel} 播放中……`, voice.currentLocation === "slot" ? `位置 ${roman(voice.slotIndex)}` : "按 E 可重聽"], 2, "preview");
  else setDoor04AudioError(state, voice.displayLabel);
  return true;
}

function finishDoor04Test(state, audio) {
  const door = state.door04;
  audio.stopDoor04Test?.();
  state.audio.door04TestPlaying = false;
  const count = door.testEntryCount;
  const isMatch = (door.sequenceVoiceIds || state.door04.slotAssignments)
    .slice(0, count).every((voiceId, index) => voiceId === DOOR04_CORRECT_ORDER[index]);
  if (isMatch) {
    door.confirmedEntryCount = count;
    for (let index = 0; index < count; index += 1) state.door04Slots[index].visualState = "correct-locked";
    if (count < 4) {
      door.stage = count === 2 ? "trio" : "quartet";
      door.testEntryCount = count + 1;
      door.status = "arranging";
      door.testStatus = "idle";
      const completedStage = count === 2 ? "pair" : "trio";
      setMessage(state, [
        completedStage === "pair" ? "前兩個聲部已確認" : "第三個聲部已確認",
        `位置 ${roman(count)} 已解鎖。`,
      ], 2.8, "success");
      startDialogue(
        state,
        `door04-${completedStage}-completion`,
        DOOR04_STAGE_COMPLETION[completedStage],
      );
      return;
    }
    state.gameProgress.flags.voicesOrdered = true;
    state.gameProgress.doorsCompleted = 4;
    Object.assign(door, {
      completed: true, successTriggered: true, status: "opening",
      stage: "complete", testStatus: "completed", openingProgress: 0,
      activeEntryCount: 4, testEntryCount: 4,
    });
    audio.playDoor04Success?.();
    showRoomCompletion(state, 4);
    setMessage(state, ["四聲部編織完成"], 2.8, "success");
    return;
  }
  door.wrongAttempts += 1;
  door.status = "rejected";
  door.rejectionRemaining = 1;
  for (const slot of state.door04Slots) {
    slot.visualState = slot.index < door.confirmedEntryCount ? "correct-locked" : "rejected";
  }
  setMessage(state, [`「${stageLabel(door.stage)}」的進場順序仍與參考混音不同。`, "已確認的進場格保持鎖定；請調整其餘聲部。"], 3, "rejected");
  const hint = DOOR04_WRONG_HINTS[door.wrongAttempts];
  if (hint) startDialogue(state, `door04-wrong-${door.wrongAttempts}`, hint);
}

function door04RestoreSlotStates(state) {
  for (const slot of state.door04Slots) {
    slot.visualState = slot.index < state.door04.confirmedEntryCount
      ? "correct-locked" : slot.assignedVoiceId ? "occupied" : "empty";
  }
}
function stageLabel(stage) {
  return ({
    reference: "完整聆聽",
    pair: "確認前兩個聲部",
    trio: "加入第三個聲部",
    quartet: "完成四聲部編織",
    complete: "四聲部編織完成",
  })[stage] ?? "聲部階段";
}
function setDoor04AudioError(state, label) {
  state.audio.door04AssetsStatus = "Error";
  setMessage(state, [`音訊錯誤：${label} 無法播放。`], 2.5, "audio");
}
function isDoor04InputLocked(state) {
  return ["preparing", "testing", "rejected", "opening", "open"].includes(state.door04.status);
}
function nearestVoice(state, predicate) {
  return nearestWithin(state, state.door04Capsules.filter(predicate), (voice) => voice.originalPosition);
}
function nearestWithin(state, entities, position = (entity) => entity) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const entity of entities) {
    if(!allowedTarget(state,entity,typeof position==="function"?position(entity):entity))continue;
    const distance = distanceBetween(state.player, position(entity));
    if (distance <= entity.interactionRadius && distance < nearestDistance) {
      nearest = entity;
      nearestDistance = distance;
    }
  }
  return nearest;
}
function roman(index) { return String(index + 1); }

export function cancelDoor04Carry(state) {
  if(["preparing","testing"].includes(state.door04.status)){setMessage(state,["請先停止序列，再歸還音匣。"],2.5,"testing");return false;}
  const voice = heldDoor04Voice(state);
  if (!voice) return false;
  Object.assign(voice, { currentLocation: "pedestal", isHeld: false, isPlaced: false,
    slotIndex: null, x: voice.originalPosition.x, y: voice.originalPosition.y });
  state.door04.heldVoiceId = null;
  setMessage(state, [`已將 ${voice.displayLabel} 歸還原本基座。`], 2, "carry");
  return true;
}

export function controlDoor04Reference(state, audio, restart = false) {
  if (isDoor04InputLocked(state) || state.dialogue.active || state.tutorialOpen) return false;
  if (!restart && state.door04.referencePlaybackStatus === "playing") {
    audio.pauseDoor04Reference?.();
    return true;
  }
  const played = audio.playDoor04Reference?.(state.door04ReferenceConsole.id, { restart });
  if (!played) { setDoor04AudioError(state, "聲部參考混音"); return true; }
  state.door04.referenceStarted = true;
  state.door04.referencePlaybackStatus = "playing";
  state.door04.status = "reference-playing";
  setMessage(state, [restart ? "參考混音從頭重播。" : "參考混音播放中。", "可以移動與排列音匣；完整聽完後可測試答案。"], 3, "preview");
  return true;
}

// Restore ownership from the saved arrangement once, without re-shuffling any
// voice identities. Legacy or interrupted saves cannot draw a voice twice.
export function restoreDoor04Ownership(state) {
  const door=state.door04,ids=new Set(state.door04Capsules.map(v=>v.id)),used=new Set();
  const assigned=state.door04Slots.map((slot,index)=>{
    const id=door.slotAssignments[index] ?? slot.assignedVoiceId;
    const valid=ids.has(id)&&!used.has(id)?id:null;
    if(valid)used.add(valid);
    slot.assignedVoiceId=valid;
    slot.visualState=index<door.confirmedEntryCount?'correct-locked':valid?'occupied':'empty';
    return valid;
  });
  door.slotAssignments=assigned;
  if(!ids.has(door.heldVoiceId)||used.has(door.heldVoiceId))door.heldVoiceId=null;
  for(const voice of state.door04Capsules){
    const index=assigned.indexOf(voice.id),held=voice.id===door.heldVoiceId;
    Object.assign(voice,{slotIndex:index<0?null:index,isPlaced:index>=0,isHeld:held,currentLocation:index>=0?'slot':held?'held':'pedestal',isPlaying:false,visualLevel:0});
  }
  if(door.completed){
    Object.assign(door,{status:'open',openingProgress:1,stage:'complete'});
    state.gameProgress.flags.voicesOrdered=true;
  }
}
