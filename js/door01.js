import { allowedTarget } from "./interaction-targets.js?v=room01-theme-replay-v1";
import { distanceBetween, pointInRect } from "./collision.js";
import { COMPLETION_DIALOGUE, WRONG_HINTS, advanceDialogue, startDialogue } from "./dialogue.js";
import { heldFragment, setMessage } from "./state.js?v=room01-theme-replay-v1";

const CHECK_DURATION = 0.45;
const REJECT_DURATION = 1;

export function isNearDoor(state) {
  return allowedTarget(state,{id:state.door01.id,x:state.player.x,y:state.player.y}) && pointInRect(state.player, state.door01.interactionZone);
}

export function nearestPedestal(state) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const fragment of state.fragments) {
    if(!allowedTarget(state,fragment,fragment.originalPosition))continue;
    const distance = distanceBetween(state.player, fragment.originalPosition);
    if (distance <= fragment.interactionRadius && distance < nearestDistance) {
      nearest = fragment;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function isNearThemeReplayDevice(state) {
  const device = state.room01ThemeReplay;
  return Boolean(
    device
    && allowedTarget(state, device, device.interactionPoint)
    && distanceBetween(state.player, device.interactionPoint) <= device.interactionRadius
  );
}

export function handleEnter(state) {
  if (state.dialogue.active) {
    advanceDialogue(state);
    return true;
  }
  if (isNearDoor(state)) return false;
  const fragment = nearestPedestal(state);
  if (!fragment) return false;

  const currentlyHeld = heldFragment(state);
  if (currentlyHeld?.id === fragment.id) {
    currentlyHeld.isHeld = false;
    state.gameProgress.heldFragmentId = null;
    state.gameProgress.inventory = [];
    setMessage(state, [`已放回 ${fragment.displayLabel}`], 1.6, "carry");
    return true;
  }

  if (currentlyHeld) currentlyHeld.isHeld = false;
  fragment.isHeld = true;
  state.gameProgress.heldFragmentId = fragment.id;
  state.gameProgress.inventory = [fragment.id];
  setMessage(state, [`攜帶中：${fragment.displayLabel}`], 1.8, "carry");
  return true;
}

export function handleListenOrSubmit(state, audio) {
  if (state.dialogue.active) return false;
  if (isNearThemeReplayDevice(state)) return toggleThemeReplay(state, audio);
  if (state.room01ThemeReplay.playing) {
    setMessage(
      state,
      ["Fugata 主題仍在播放。", "請先回到左側留聲機停止，再試聽或提交旋律。"],
      2.8,
      "audio",
    );
    return true;
  }
  if (isNearDoor(state)) return submitAtDoor(state);

  const fragment = nearestPedestal(state);
  if (!fragment || fragment.isHeld) return false;
  const played = audio.playFragment(fragment.audioKey, fragment.id);
  if (played) setMessage(state, [`${fragment.displayLabel} 播放中……`], 1.5, "preview");
  else if (state.audio.fragmentAssetsStatus !== "Ready") {
    setMessage(state, ["旋律片段音訊仍在載入。"], 1.5, "audio");
  }
  return true;
}

function toggleThemeReplay(state, audio) {
  const device = state.room01ThemeReplay;
  if (device.playing) {
    audio.stopRoom01Theme?.();
    device.playing = false;
    setMessage(state, ["Fugata 主題已停止。", "再次播放會從頭開始。"], 2, "audio");
    return true;
  }

  audio.stopPreview?.();
  const started = audio.playRoom01Theme?.();
  if (!started) {
    setMessage(state, ["完整 Fugata 音訊尚未能播放。"], 2, "audio");
    return true;
  }
  device.playing = true;
  setMessage(state, ["Fugata 主題從頭播放中……", "回到留聲機按 E 可自行停止。"], 2.8, "audio");
  return true;
}

function submitAtDoor(state) {
  const door = state.door01;
  if (["checking", "rejected", "opening", "open"].includes(door.status)) return false;
  const fragment = heldFragment(state);
  if (!fragment) {
    setMessage(state, ["門上的樂句主題訊號槽仍然是空的。", "請攜帶一個旋律片段。"], 2, "door");
    return true;
  }
  door.status = "checking";
  door.stateTimer = CHECK_DURATION;
  door.insertedFragmentId = fragment.id;
  setMessage(state, [`正在檢查 ${fragment.displayLabel}……`], 1.2, "door");
  return true;
}

export function updateDoor01(state, deltaTime, audio) {
  const door = state.door01;
  if (
    state.room01ThemeReplay.playing
    && typeof audio.isRoom01ThemePlaying === "function"
    && !audio.isRoom01ThemePlaying()
  ) state.room01ThemeReplay.playing = false;
  door.rejectionFlashRemaining = Math.max(0, door.rejectionFlashRemaining - deltaTime);

  if (door.status === "checking") {
    door.stateTimer = Math.max(0, door.stateTimer - deltaTime);
    if (door.stateTimer <= 0) resolveSubmission(state, audio);
    return;
  }

  if (door.status === "rejected") {
    door.stateTimer = Math.max(0, door.stateTimer - deltaTime);
    if (door.stateTimer <= 0) {
      door.status = "locked";
      door.insertedFragmentId = null;
    }
    return;
  }

  if (door.status !== "opening") return;
  door.openingProgress = Math.min(1, door.openingProgress + deltaTime / door.openingDuration);
  if (door.openingProgress < 1) return;

  door.status = "open";
  if (!state.dialogue.active) startDialogue(state, "completion", COMPLETION_DIALOGUE);
}

function resolveSubmission(state, audio) {
  const door = state.door01;
  const fragment = state.fragments.find((item) => item.id === door.insertedFragmentId);
  if (!fragment) {
    door.status = "locked";
    door.insertedFragmentId = null;
    return;
  }

  if (!fragment.isCorrect) {
    door.wrongAttempts += 1;
    door.status = "rejected";
    door.stateTimer = REJECT_DURATION;
    door.rejectionFlashRemaining = REJECT_DURATION;
    audio.playRejectedCue();
    setMessage(state, ["這不是門所記得的樂句主題。"], 2.4, "rejected");
    const hint = WRONG_HINTS[Math.min(3, door.wrongAttempts)];
    if (hint) startDialogue(state, `wrong-${door.wrongAttempts}`, hint);
    return;
  }

  audio.stopPreview();
  audio.playFragment(fragment.audioKey, fragment.id);
  fragment.isHeld = false;
  state.gameProgress.heldFragmentId = null;
  state.gameProgress.inventory = [];
  state.gameProgress.flags.subjectIdentified = true;
  state.gameProgress.doorsCompleted = 1;
  door.completed = true;
  door.status = "opening";
  door.openingProgress = 0;
  setMessage(state, ["樂句主題已確認"], 2.4, "success");
}
