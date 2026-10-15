import { allowedTarget } from "./interaction-targets.js?v=room04-low-desk-v2";
import { updateNpcAnimation } from "./character/npc-v3.js";
import { distanceBetween } from "./collision.js";
import {
  DOOR03_COMPLETION,
  DOOR03_EDUCATION,
  startDialogue,
} from "./dialogue.js";
import {
  DOOR03_PATCH_MONITOR,
  DOOR03_SIGNAL_TYPES,
  DOOR03_STAGE_AUDIO,
  VALID_DOOR03_EDGES,
  allDoor03Ports,
} from "./door03-synth-data.js";
import { setMessage } from "./state.js?v=room04-low-desk-v2";
import { roomCompletionActive, showRoomCompletion } from "./completion-feedback.js";
import { ROOM03_CHARACTER_SPOTS as room03CharacterSpots } from "./room03-layout.js?v=room03-side-gate-v1";

const REJECT_DURATION = 0.8;

export function nearestDoor03Module(state) {
  return nearestWithin(state, state.door03Modules);
}

export function nearestDoor03Port(state) {
  return nearestWithin(state, allDoor03Ports(state.door03Modules));
}

export function nearDoor03PatchMonitor(state) {
  return allowedTarget(state,state.door03PatchMonitor ?? DOOR03_PATCH_MONITOR) && distanceBetween(state.player, state.door03PatchMonitor ?? DOOR03_PATCH_MONITOR)
    <= (state.door03PatchMonitor ?? DOOR03_PATCH_MONITOR).interactionRadius;
}

export function door03PortById(state, portId) {
  return allDoor03Ports(state.door03Modules).find((port) => port.id === portId) ?? null;
}

export function handleDoor03Inspect(state, audio) {
  const door = state.door03;
  if (state.dialogue.active || ["opening", "open", "learning-complete"].includes(door.status)) return false;

  if (nearDoor03PatchMonitor(state)) {
    if (!door.currentStageAudioKey) {
      setMessage(state, ["接線監聽器尚未取得聲音。", "請先找到振盪器。"], 2.2, "inspection");
      return true;
    }
    playDoor03Stage(
      state,
      audio,
      door.currentStageAudioKey,
      state.door03PatchMonitor.id,
      { restart: true },
    );
    const stageLabel = door.currentStageNumber === 5
      ? "包絡產生器／ADSR 動作示範"
      : `接線階段 ${door.currentStageNumber}`;
    setMessage(state, [`重聽 ${stageLabel}`, door.currentLearningSummary], 3, "preview");
    return true;
  }

  const module = nearestDoor03Module(state);
  if (!module) return false;
  module.inspectionRemaining = 2.5;
  module.isInspecting = true;

  if (door.currentStep === 0 && module.id === "oscillator-vco") {
    door.oscillatorDiscovered = true;
    door.currentStep = 1;
    door.status = "patching";
    door.currentStageNumber = 1;
    door.currentStageAudioKey = DOOR03_STAGE_AUDIO[1];
    door.currentLearningSummary = "振盪器：原始鋸齒波";
    playDoor03Stage(state, audio, door.currentStageAudioKey, module.id);
    startDialogue(state, "door03-education-0", DOOR03_EDUCATION[0]);
    return true;
  }

  if (door.currentStep === 0) {
    setMessage(
      state,
      [`${module.displayName}：${module.description[0]}`, "請先找到聲音來源。"],
      3,
      "inspection",
    );
    return true;
  }

  setMessage(state, [`${module.displayName}：${module.description[0]}`, module.description[1]], 3, "inspection");
  return true;
}

export function handleDoor03Enter(state, audio) {
  const door = state.door03;
  if (state.dialogue.active || ["opening", "open", "learning-complete"].includes(door.status)) return false;
  if (!door.oscillatorDiscovered) {
    const nearby = nearestDoor03Port(state);
    if (!nearby) return false;
    setMessage(state, ["請先找到聲音來源：振盪器。", "靠近振盪器按 E 檢查。"], 2.4, "patch");
    return true;
  }

  const port = nearestDoor03Port(state);
  if (!port || port.fixed) return false;

  if (port.type === "output") {
    if (isPortConnected(state, port.id)) {
      setMessage(state, ["這個輸出端口已完成永久接線。", "已完成的接線不能更換。"], 2, "patch");
      return true;
    }
    door.selectedOutputPortId = port.id;
    door.temporaryCable = { fromPortId: port.id, signalType: port.signalType };
    door.status = "patching";
    const signal = DOOR03_SIGNAL_TYPES[port.signalType];
    setMessage(state, [`已選擇 ${port.label}`, `${signal.label} · 請選擇相容的輸入端口 · Esc 可取消`], 2.5, "patch");
    return true;
  }

  if (!door.selectedOutputPortId) {
    setMessage(state, ["輸入端口不能作為接線起點。", "請先選擇一個輸出端口。"], 2.2, "patch");
    return true;
  }

  const output = door03PortById(state, door.selectedOutputPortId);
  if (!output) {
    clearTemporaryCable(state);
    return false;
  }
  if (isPortConnected(state, port.id)) {
    setMessage(state, ["這個輸入端口已完成永久接線。", "已完成的接線不能覆寫。"], 2.2, "patch");
    clearTemporaryCable(state);
    return true;
  }

  const edgeForPorts = VALID_DOOR03_EDGES.find(
    (edge) => edge.fromPortId === output.id && edge.toPortId === port.id,
  );
  const expected = VALID_DOOR03_EDGES[door.currentStep - 1];
  if (!edgeForPorts || edgeForPorts.id !== expected?.id) {
    rejectConnection(state, audio, output, port, edgeForPorts);
    return true;
  }

  completeEdge(state, audio, edgeForPorts);
  return true;
}

export function cancelDoor03Patch(state) {
  if (!state.door03.selectedOutputPortId) return false;
  clearTemporaryCable(state);
  setMessage(state, ["已取消目前接線。", "已完成的接線保持不變。"], 1.8, "patch");
  return true;
}

export function updateDoor03(state, deltaTime, audio) {
  const door = state.door03;
  if (state.gameProgress.currentRoom === 3 && door.status === "open" && !door.completionDialogueShown && !state.dialogue.active && !roomCompletionActive(state, 3)) {
    door.completionDialogueShown = true;
    startDialogue(state, "door03-completion", DOOR03_COMPLETION);
  }
  if (
    state.ui.room3MessageShown
    && !state.dialogue.active
    && door.status === "locked"
    && !door.oscillatorDiscovered
  ) {
    door.status = "exploring";
  }
  for (const module of state.door03Modules) {
    module.inspectionRemaining = Math.max(0, module.inspectionRemaining - deltaTime);
    if (module.inspectionRemaining === 0 && !module.isActive) module.isInspecting = false;
  }
  door.rejectionRemaining = Math.max(0, door.rejectionRemaining - deltaTime);
  door.adsrAnimationElapsed = door.adsrVisible
    ? door.adsrAnimationElapsed + deltaTime
    : 0;
  if (door.candidateEdge?.phase === "rejected") {
    door.candidateEdge.remaining = Math.max(0, door.candidateEdge.remaining - deltaTime);
    if (door.candidateEdge.remaining === 0) door.candidateEdge = null;
  }
  updateModuleStates(state);
  updateDoor03Characters(state, deltaTime);

  if (door.status === "learning-complete" && !state.dialogue.active && !door.finalEducationAcknowledged) {
    door.finalEducationAcknowledged = true;
    completeDoor03(state, audio);
  }

  if (door.status !== "opening") return;
  door.openingProgress = Math.min(1, door.openingProgress + deltaTime / door.openingDuration);
  if (door.openingProgress < 1) return;
  door.status = "open";
}

function completeEdge(state, audio, edge) {
  const door = state.door03;
  door.connectedEdges.push({ ...edge, locked: true });
  door.completedEdgeIds.push(edge.id);
  clearTemporaryCable(state, false);
  const completedStep = door.currentStep;
  door.currentStep = Math.min(6, completedStep + 1);
  door.status = completedStep === 6 ? "learning-complete" : "patching";
  door.currentStageNumber = completedStep === 4
    ? 4
    : completedStep === 5 ? 5
      : completedStep === 6 ? 6 : completedStep + 1;
  door.currentStageAudioKey = DOOR03_STAGE_AUDIO[door.currentStageNumber];
  door.currentLearningSummary = learningSummary(completedStep);
  door.adsrVisible = completedStep >= 5;
  playDoor03Stage(state, audio, door.currentStageAudioKey, state.door03PatchMonitor.id);
  startDialogue(
    state,
    `door03-education-${completedStep}`,
    DOOR03_EDUCATION[completedStep],
  );
  if (completedStep === 6) {
    state.gameProgress.flags.patchCompleted = true;
    setMessage(state, ["六條接線已鎖定。", "完整合成器接線已建立。"], 3, "success");
  } else {
    setMessage(state, [`接線 ${completedStep}／6 已鎖定。`, door.currentLearningSummary], 2.8, "success");
  }
}

function rejectConnection(state, audio, output, input, validFutureEdge) {
  const door = state.door03;
  const step = door.currentStep;
  door.wrongAttemptsByStep[step] = (door.wrongAttemptsByStep[step] ?? 0) + 1;
  door.wrongAttempts += 1;
  door.rejectionRemaining = REJECT_DURATION;
  door.candidateEdge = {
    id: `rejected-${door.wrongAttempts}`,
    fromPortId: output.id,
    toPortId: input.id,
    signalType: output.signalType,
    phase: "rejected",
    remaining: REJECT_DURATION,
  };
  clearTemporaryCable(state, false);
  door.status = "patching";
  audio.playRejectedCue?.();
  const lines = [connectionError(output.signalType, input.signalType, validFutureEdge)];
  const attempt = door.wrongAttemptsByStep[step];
  if (attempt === 2) lines.push(stepFunctionHint(step));
  if (attempt >= 3) lines.push(stepPortHint(step));
  setMessage(state, lines, 3.6, "rejected");
}

function connectionError(outputType, inputType, validFutureEdge) {
  if (outputType === inputType && validFutureEdge) {
    return "這條線稍後會用到。先完成眼前這一段訊號路徑。";
  }
  const errors = {
    "audio:pitch-cv": "這裡需要音高指令，不是聲音本身。確認你拿的是音高控制電壓。",
    "pitch-cv:audio": "音高控制電壓只告訴模組要演奏哪個音，它不能代替音訊訊號。",
    "gate:audio": "觸發訊號只說「現在開始」，它本身不是可以聽見的聲音。",
    "audio:gate": "包絡產生器正在等待觸發時刻，連續的音訊訊號無法代替觸發訊號。",
    "envelope-cv:audio": "包絡控制電壓描繪聲音的形狀，請把它送到接受控制電壓的端口。",
    "audio:envelope-cv": "這個端口控制放大器的開合，需要的是控制電壓。",
  };
  return errors[`${outputType}:${inputType}`]
    ?? `${DOOR03_SIGNAL_TYPES[outputType]?.label ?? "輸出訊號"} 與 ${DOOR03_SIGNAL_TYPES[inputType]?.label ?? "輸入訊號"} 的類型不相容。`;
}

function stepFunctionHint(step) {
  return [
    "",
    "找出能安排音高順序的模組。",
    "找出能削減或強調頻率的模組。",
    "找出能加入重複與空間的模組。",
    "將處理完成的聲音送入控制音量的模組。",
    "包絡產生器需要音序器的觸發時刻。",
    "電壓控制放大器需要隨時間變化的音量控制曲線。",
  ][step] ?? "";
}

function stepPortHint(step) {
  return [
    "",
    "使用音高控制輸出與振盪器音高輸入。",
    "將振盪器的音訊輸出送入濾波器音訊輸入。",
    "將濾波器的音訊輸出送入效果器音訊輸入。",
    "將效果器的音訊輸出送入放大器音訊輸入。",
    "使用觸發訊號輸出與包絡產生器觸發輸入。",
    "使用包絡控制電壓輸出與放大器音量控制輸入。",
  ][step] ?? "";
}

function playDoor03Stage(state, audio, audioKey, entityId, options = {}) {
  audio.stopDoor03Success?.(0.08);
  const played = audio.playDoor03StageLoop?.(audioKey, entityId, options) ?? false;
  state.door03.status = state.door03.status === "learning-complete" ? "learning-complete" : "previewing";
  if (!played) {
    audio.stopDoor03Loop?.(0);
    state.audio.door03AssetsStatus = "Error";
    setMessage(state, ["音訊錯誤：目前階段的聲音無法播放。", "操作仍可繼續。"], 2.8, "audio");
  }
  if (state.door03.status === "previewing") state.door03.status = "patching";
  return played;
}

function completeDoor03(state, audio) {
  const door = state.door03;
  if (door.completed) return;
  audio.stopPreview?.();
  door.completed = true;
  door.status = "opening";
  door.openingProgress = 0;
  door.speakerActive = true;
  state.gameProgress.flags.patchCompleted = true;
  state.gameProgress.doorsCompleted = 3;
  showRoomCompletion(state, 3);
  if (!door.successAudioPlayed) {
    door.successAudioPlayed = true;
    const played = audio.playDoor03Success?.() ?? false;
    if (!played) {
      audio.stopDoor03Loop?.(0);
      setMessage(state, ["完整合成器接線已建立，但成功音訊無法播放。", "第三室仍可開啟。"], 3, "audio");
    }
    else setMessage(state, ["完整合成器接線已建立。", "揚聲器已啟動。"], 3.2, "success");
  }
}

function updateModuleStates(state) {
  const activeModuleIds = new Set();
  for (const edge of state.door03.connectedEdges) {
    const from = door03PortById(state, edge.fromPortId);
    const to = door03PortById(state, edge.toPortId);
    if (from) activeModuleIds.add(from.moduleId);
    if (to) activeModuleIds.add(to.moduleId);
  }
  if (state.door03.oscillatorDiscovered) activeModuleIds.add("oscillator-vco");
  for (const module of state.door03Modules) {
    module.isActive = activeModuleIds.has(module.id);
    module.visualState = module.isActive ? "connected" : module.isInspecting ? "inspecting" : "idle";
  }
}

function updateDoor03Characters(state, deltaTime) {
  if (state.gameProgress.currentRoom !== 3 || !state.room03Characters) return;
  const sceneKey = state.gameProgress.flags.patchCompleted ? "complete" : state.door03.currentStep;
  const spots = room03CharacterSpots[sceneKey] ?? room03CharacterSpots[0];
  const response = 1 - Math.exp(-deltaTime * (state.dialogue.active ? 3.2 : 2.15));

  for (const [key, character] of Object.entries(state.room03Characters)) {
    const spot = spots[key];
    if (!spot) continue;
    const previousX = character.x, previousY = character.y;
    character.targetX = spot.x;
    character.targetY = spot.y;
    character.x += (character.targetX - character.x) * response;
    character.y += (character.targetY - character.y) * response;
    character.idleElapsed += deltaTime;
    // The exponential approach otherwise never arrives. Snap only the final subpixel.
    if (Math.hypot(character.targetX - character.x, character.targetY - character.y) < 0.25) {
      character.x = character.targetX;
      character.y = character.targetY;
    }
    updateNpcAnimation(character, previousX, previousY, deltaTime, state.player.x);
  }
}

function learningSummary(completedStep) {
  return {
    1: "音高控制電壓開始選擇音高。",
    2: "高通濾波器讓音色變得明亮。",
    3: "延遲效果加入重複與空間感。",
    4: "音訊已抵達放大器，仍缺少控制訊號。",
    5: "觸發訊號喚醒了 ADSR 控制曲線。",
    6: "包絡控制電壓開始控制音量輪廓。",
  }[completedStep] ?? "";
}

function isPortConnected(state, portId) {
  return state.door03.connectedEdges.some(
    (edge) => edge.fromPortId === portId || edge.toPortId === portId,
  );
}

function clearTemporaryCable(state, clearCandidate = true) {
  state.door03.selectedOutputPortId = null;
  state.door03.temporaryCable = null;
  if (clearCandidate) state.door03.candidateEdge = null;
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
