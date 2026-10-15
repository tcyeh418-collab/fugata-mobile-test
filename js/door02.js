import { allowedTarget } from "./interaction-targets.js?v=room04-low-desk-v2";
import { distanceBetween } from "./collision.js";
import { DOOR02_COMPLETION, DOOR02_WRONG_HINTS, startDialogue } from "./dialogue.js";
import { setMessage } from "./state.js?v=room04-low-desk-v2";
import { roomCompletionActive, showRoomCompletion } from "./completion-feedback.js";

const CHECK_DURATION = 0.45;
const REJECT_DURATION = 1;

export function nearestSubjectTerminal(state) {
  const terminal = state.subjectTerminal;
  return allowedTarget(state,terminal) && distanceBetween(state.player, terminal) <= terminal.interactionRadius ? terminal : null;
}

export function nearestEchoTower(state) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const tower of state.echoTowers) {
    if(!allowedTarget(state,tower))continue;
    const distance = distanceBetween(state.player, tower);
    if (distance <= tower.interactionRadius && distance < nearestDistance) {
      nearest = tower;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function handleDoor02Listen(state, audio) {
  if (state.dialogue.active || state.door02.status === "opening" || state.door02.status === "open") return false;
  const terminal = nearestSubjectTerminal(state);
  if (terminal) {
    const played = audio.playPreview("door01FragmentA", terminal.id, "subject");
    if (played) setMessage(state, ["樂句主題播放中……"], 1.7, "preview");
    else setMessage(state, ["樂句主題音訊仍在載入。"], 1.6, "audio");
    return true;
  }
  const tower = nearestEchoTower(state);
  if (!tower) return false;
  const played = audio.playPreview(tower.audioKey, tower.id, "echo");
  if (played) setMessage(state, [`${tower.displayLabel} 播放中……`, "聆聽是否有聲部回應樂句主題。"], 1.7, "preview");
  else setMessage(state, ["主題答句音訊仍在載入。"], 1.6, "audio");
  return true;
}

export function handleDoor02Enter(state) {
  const tower = nearestEchoTower(state);
  if (!tower || state.door02.status === "opening" || state.door02.status === "open") return false;

  for (const item of state.echoTowers) item.isSelected = false;
  tower.isSelected = true;
  const door = state.door02;
  door.selectedTowerId = tower.id;
  door.connectedTowerId = null;
  door.status = "checking";
  door.cableState = "checking";
  door.stateTimer = CHECK_DURATION;
  door.rejectionFlashRemaining = 0;
  setMessage(state, [`正在連接 ${tower.displayLabel}……`, "將訊號送往第二室出口。"], 1.2, "door");
  return true;
}

export function updateDoor02(state, deltaTime, audio) {
  const door = state.door02;
  door.rejectionFlashRemaining = Math.max(0, door.rejectionFlashRemaining - deltaTime);

  if (door.status === "open") {
    if (state.gameProgress.currentRoom === 2 && !state.dialogue.active && !door.completionDialogueShown && !roomCompletionActive(state, 2)) {
      door.completionDialogueShown = true;
      startDialogue(state, "door02-completion", DOOR02_COMPLETION);
    }
    return;
  }

  if (door.status === "checking") {
    door.stateTimer = Math.max(0, door.stateTimer - deltaTime);
    if (door.stateTimer <= 0) resolveSelection(state, audio);
    return;
  }
  if (door.status === "rejected") {
    door.stateTimer = Math.max(0, door.stateTimer - deltaTime);
    if (door.stateTimer <= 0) {
      door.status = "locked";
      door.cableState = "none";
      door.selectedTowerId = null;
      for (const tower of state.echoTowers) tower.isSelected = false;
    }
    return;
  }
  if (door.status !== "opening") return;
  door.openingProgress = Math.min(1, door.openingProgress + deltaTime / door.openingDuration);
  if (door.openingProgress < 1) return;
  door.status = "open";
}

function resolveSelection(state, audio) {
  const door = state.door02;
  const tower = state.echoTowers.find((item) => item.id === door.selectedTowerId);
  if (!tower) { door.status = "locked"; door.cableState = "none"; return; }

  if (!tower.isCorrect) {
    door.wrongAttempts += 1;
    door.status = "rejected";
    door.cableState = "rejected";
    door.stateTimer = REJECT_DURATION;
    door.rejectionFlashRemaining = REJECT_DURATION;
    audio.playRejectedCue();
    setMessage(state, ["聲部無法同步。", "請再次比較兩段樂句。"], 2.3, "rejected");
    const hint = DOOR02_WRONG_HINTS[Math.min(3, door.wrongAttempts)];
    if (hint) startDialogue(state, `door02-wrong-${door.wrongAttempts}`, hint);
    return;
  }

  audio.stopPreview();
  door.connectedTowerId = tower.id;
  door.cableState = "connected";
  door.completed = true;
  door.status = "opening";
  door.openingProgress = 0;
  tower.isConnected = true;
  state.gameProgress.flags.answerIdentified = true;
  state.gameProgress.doorsCompleted = 2;
  audio.startSuccessLoops();
  showRoomCompletion(state, 2);
  setMessage(state, ["主題答句已確認", "兩個聲部已在時間中同步。"], 2.5, "success");
}
