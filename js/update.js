import {syncSelection,targets,reachable} from "./interaction-targets.js?v=room01-theme-replay-v1";
import {setMessage} from "./state.js?v=room01-theme-replay-v1";
import { recoverPlayer, castFor, constrainCast } from "./space.js?v=room01-theme-replay-v1";
import { updateCompanions } from "./companions.js";
import { updateNpcAnimation } from "./character/npc-v3.js";
import { handleEnter, handleListenOrSubmit, updateDoor01 } from "./door01.js?v=room01-theme-replay-v1";
import { handleDoor02Enter, handleDoor02Listen, updateDoor02 } from "./door02.js";
import {
  cancelDoor03Patch,
  handleDoor03Enter,
  handleDoor03Inspect,
  updateDoor03,
} from "./door03.js";
import {
  cancelDoor04Carry, controlDoor04Reference, nearDoor04Reference,
  handleDoor04Enter,
  handleDoor04ListenOrTest,
  updateDoor04,
} from "./door04.js?v=room04-movement-fixes-v6";
import {
  handleDoor05Enter,
  handleDoor05Listen,
  handleDoor05Space,
  updateDoor05,
} from "./door05.js";
import {
  cancelDoor06Selection, confirmDoor06Selection,
  beginDoor06Ending,
  handleDoor06Enter,
  handleDoor06Listen,
  updateDoor06,
} from "./door06.js";
import { advanceDialogue } from "./dialogue.js";
import { updatePlayer } from "./player.js";
import { activeWalls, endingTrigger, updateCurrentRoom } from "./rooms.js?v=room01-theme-replay-v1";
import { maybeStartRoomTransition, updateRoomTransition } from "./room-transition.js?v=room01-theme-replay-v1";
import { updateInteractionHint, updateTransientUi } from "./ui.js?v=room01-theme-replay-v1";
import { ROOM04_CHARACTER_SPOTS } from "./room04-layout.js?v=room04-movement-fixes-v6";

export function updateGame(state, input, audio, deltaTime) {
  state.elapsedTime += deltaTime;
  if (state.phase !== "game") return;
  if (state.tutorialOpen){input.reset();return;}

  recoverPlayer(state,activeWalls(state));
  const oldCast=structuredClone(castFor(state)??{});
  syncSelection(state);
  const action=input.consumeAction?.();
  const target=action?targets(state).find(t=>t.id===action.targetId):null;
  const validAction=action && !state.dialogue.active && !state.tutorialOpen && target?.actions.some(a=>a.code===action.code) && reachable(state,target);
  if(action&&!validAction)setMessage(state,['請靠近','沿走道靠近已選取的裝置，再執行操作。'],2.5,'interaction');
  if(validAction)state.interaction.selectedId=target.id;
  state.interaction.executingId=state.interaction.selectedId;
  const enterRequested = input.consumeEnter() || (validAction && action.code==='Enter');
  const listenRequested = input.consumeListen() || (validAction && action.code==='KeyE');
  const spaceRequested = input.consumeSpace() || (validAction && action.code==='Space');
  const cancelRequested = input.consumeCancel();
  let interactionPerformed = false;

  if (state.roomTransition.active) {
    input.direction();
    updateRoomTransition(state, deltaTime);
    updatePreviewVisuals(state, audio, deltaTime);
    updateTransientUi(state, deltaTime);
  updateCompanions(state, deltaTime);
    return;
  }

  if (state.dialogue.active) {
    const finalDialogueEntry = state.dialogue.index === state.dialogue.entries.length - 1;
    if (enterRequested || (cancelRequested && finalDialogueEntry)) {
      advanceDialogue(state);
    }
  } else if (state.gameProgress.currentRoom === 1) {
    if (enterRequested) interactionPerformed = handleEnter(state);
    if (listenRequested && !enterRequested) interactionPerformed = handleListenOrSubmit(state, audio);
  } else if (state.gameProgress.currentRoom === 2) {
    if (enterRequested) interactionPerformed = handleDoor02Enter(state);
    if (listenRequested && !enterRequested) interactionPerformed = handleDoor02Listen(state, audio);
  } else if (state.gameProgress.currentRoom === 3) {
    if (cancelRequested) interactionPerformed = cancelDoor03Patch(state);
    else if (enterRequested) interactionPerformed = handleDoor03Enter(state, audio);
    else if (listenRequested) interactionPerformed = handleDoor03Inspect(state, audio);
  } else if (state.gameProgress.currentRoom === 4) {
    if (cancelRequested) interactionPerformed = cancelDoor04Carry(state);
    else if (enterRequested) interactionPerformed = handleDoor04Enter(state);
    else if (spaceRequested && nearDoor04Reference(state)) interactionPerformed = controlDoor04Reference(state, audio, true);
    else if (listenRequested) {
      interactionPerformed = handleDoor04ListenOrTest(state, audio);
    }
  } else if (state.gameProgress.currentRoom === 5) {
    if (enterRequested) interactionPerformed = handleDoor05Enter(state);
    else if (listenRequested) interactionPerformed = handleDoor05Listen(state, audio);
    else if (spaceRequested) interactionPerformed = handleDoor05Space(state, audio);
  } else if (state.gameProgress.currentRoom === 6) {
    if (cancelRequested) interactionPerformed = cancelDoor06Selection(state);
    else if (enterRequested) interactionPerformed = handleDoor06Enter(state, audio);
    else if (spaceRequested && !listenRequested) interactionPerformed = confirmDoor06Selection(state, audio);
    else if (listenRequested) interactionPerformed = handleDoor06Listen(state, audio);
  }

  state.interaction.executingId=null;
  const door04MovementLocked = state.gameProgress.currentRoom === 4
    && ["rejected"].includes(state.door04.status);
  const door05MovementLocked = state.gameProgress.currentRoom === 5
    && (
      state.door05.rejectionRemaining > 0
      || [
        "testing",
        "completion-spinning",
        "completion-hold",
        "launching",
        "opening",
      ].includes(state.door05.status)
    );
  const door06MovementLocked = state.gameProgress.currentRoom === 6
    && (
      state.door06.endingTriggered
      || ["relay-playing", "relay-replay", "reference-playing", "stage-transition", "confirming", "checking", "rejected", "reconstructing", "opening"].includes(state.door06.status)
    );
  if (
    !state.dialogue.active
    && !door04MovementLocked
    && !door05MovementLocked
    && !door06MovementLocked
  ) {
    updatePlayer(state, input.direction(), deltaTime, activeWalls(state));
  }
  else input.direction();

  updateDoor01(state, deltaTime, audio);
  updateRoom01Characters(state, deltaTime);
  updateDoor02(state, deltaTime, audio);
  updateRoom02Characters(state, deltaTime);
  updateDoor03(state, deltaTime, audio);
  updateDoor04(state, deltaTime, audio);
  updateRoom04Characters(state, deltaTime);
  updateDoor05(state, deltaTime, audio);
  updateDoor06(state, deltaTime, audio);
  maybeStartRoomTransition(state, audio);
  if (state.roomTransition.active) updateRoomTransition(state, deltaTime);
  else updateCurrentRoom(state);
  updatePreviewVisuals(state, audio, deltaTime);
  updateInteractionHint(state, deltaTime, interactionPerformed);
  updateTransientUi(state, deltaTime);
  updateCompanions(state, deltaTime);
  constrainCast(state,activeWalls(state),oldCast,deltaTime);

  if (!state.roomTransition.active && state.gameProgress.currentRoom === 2 && !state.ui.room2Entered) {
    state.ui.room2Entered = true;
    audio.stopPreview();
  }
  if (!state.roomTransition.active && state.gameProgress.currentRoom === 3 && !state.ui.room3MessageShown) {
    state.ui.room3MessageShown = true;
    state.door03.introDialogueShown = true;
    audio.stopPreview();
    audio.stopSuccessLoops();
  }
  if (!state.roomTransition.active && state.gameProgress.currentRoom === 4 && !state.ui.room4MessageShown) {
    state.ui.room4MessageShown = true;
    state.door04.introDialogueShown = true;
    audio.stopPreview();
    audio.stopDoor03Loop?.(0.08);
    audio.stopDoor03Success();
    audio.stopDoor04Audio?.();
  }
  if (!state.roomTransition.active && state.gameProgress.currentRoom === 5 && !state.ui.room5MessageShown) {
    state.ui.room5MessageShown = true;
    state.door05.introDialogueShown = true;
    audio.stopPreview();
    audio.stopDoor04Audio?.();
    audio.stopDoor05Audio?.();
  }
  if (!state.roomTransition.active && state.gameProgress.currentRoom === 6 && !state.ui.room6MessageShown) {
    state.ui.room6MessageShown = true;
    state.door06.introDialogueShown = true;
    audio.stopPreview();
    audio.stopDoor05Audio?.();
    audio.stopDoor06Audio?.();
  }

  if (
    state.gameProgress.currentRoom === 6
    && state.door06.exitOpen
    && !state.dialogue.active
    && state.player.x >= endingTrigger.x
    && state.player.y >= endingTrigger.y
    && state.player.y <= endingTrigger.y + endingTrigger.height
  ) {
    beginDoor06Ending(state, audio);
  }

  state.ui.controlsHintRemaining = Math.max(0, state.ui.controlsHintRemaining - deltaTime);
}

function updateRoom01Characters(state, deltaTime) {
  if (state.gameProgress.currentRoom !== 1 || !state.room01Characters) return;
  const introActive = state.dialogue.active && state.dialogue.sequenceId === "intro";
  const settledSpots = {
    leroy: { x: 102, y: 540 },
    pinxin: { x: 598, y: 540 },
  };
  const activeFragment = state.fragments.find((fragment) => fragment.isPlaying);
  const doorFocused = ["checking", "rejected", "opening", "open"].includes(state.door01.status)
    || (state.gameProgress.heldFragmentId && state.player.x > 545);
  const focusX = doorFocused ? 775 : activeFragment?.x ?? state.player.x;

  for (const [key, character] of Object.entries(state.room01Characters)) {
    character.idleElapsed += deltaTime;
    if (!introActive) {
      const spot = settledSpots[key];
      // Reach the lower aisle around station 5, then cross to the waiting spot.
      // Moving straight down from the intro placed Pinxin against its solid base.
      const laneX = key === "pinxin" ? 190 : 92;
      if (character.y < 510 && Math.abs(character.x - laneX) > 1) {
        character.targetX = laneX;
        character.targetY = character.y;
      } else if (character.y < spot.y - 1) {
        character.targetX = laneX;
        character.targetY = spot.y;
      } else {
        character.targetX = spot.x;
        character.targetY = spot.y;
      }
    }
    const speed = 92;
    const previousX = character.x, previousY = character.y;
    character.x = approach(character.x, character.targetX, speed * deltaTime);
    character.y = approach(character.y, character.targetY, speed * deltaTime);
    updateNpcAnimation(character, previousX, previousY, deltaTime, focusX);
  }
}

export function updateRoom02Characters(state, deltaTime) {
  if (state.gameProgress.currentRoom !== 2 || !state.room02Characters) return;
  const { leroy, pinxin } = state.room02Characters;
  const selectedTower = state.echoTowers.find(
    (tower) => tower.id === (state.door02.selectedTowerId ?? state.door02.connectedTowerId),
  );
  const listeningTower = state.echoTowers.find((tower) => tower.isPlaying);
  const focusedTower = listeningTower ?? selectedTower;
  let focus = state.player;
  let leroyTarget;
  let pinxinTarget;

  if (state.subjectTerminal.isPlaying) {
    focus = state.subjectTerminal;
    leroyTarget = { x: 950, y: 500 };
    pinxinTarget = { x: 1030, y: 510 };
  } else if (focusedTower) {
    focus = focusedTower;
    const observationY = Math.min(505, Math.max(455, focusedTower.y + 118));
    const observationCenter = Math.min(1410, Math.max(970, focusedTower.x));
    leroyTarget = { x: observationCenter - 76, y: observationY };
    pinxinTarget = { x: observationCenter + 76, y: observationY + 8 };
  } else if (["opening", "open"].includes(state.door02.status)) {
    focus = { x: 1510, y: 320 };
    leroyTarget = { x: 1325, y: 500 };
    pinxinTarget = { x: 1410, y: 510 };
  } else {
    const observationCenter = Math.min(1370, Math.max(980, state.player.x));
    leroyTarget = { x: observationCenter - 70, y: 500 };
    pinxinTarget = { x: observationCenter + 70, y: 510 };
  }

  leroy.targetX = leroyTarget.x;
  leroy.targetY = leroyTarget.y;
  pinxin.targetX = pinxinTarget.x;
  pinxin.targetY = pinxinTarget.y;

  for (const character of [leroy, pinxin]) {
    character.idleElapsed += deltaTime;
    const speed = 88;
    const previousX = character.x, previousY = character.y;
    character.x = approach(character.x, character.targetX, speed * deltaTime);
    character.y = approach(character.y, character.targetY, speed * deltaTime);
    updateNpcAnimation(character, previousX, previousY, deltaTime, focus.x);
  }
}

export function updateRoom04Characters(state, deltaTime) {
  if (state.gameProgress.currentRoom !== 4 || !state.room04Characters) return;
  const presentation = state.room04Presentation ??= {carryActor: "player", playerForm: "avatar", placementRemaining: 0};
  presentation.placementRemaining = Math.max(0, presentation.placementRemaining - deltaTime);
  const holding = state.door04.heldVoiceId && presentation.carryActor === "leroy";
  state.room04Characters.leroy.pose = holding ? (state.door04Capsules.some(v => v.isPlaying && v.isHeld) ? "showing"
      : state.door04Slots.some(slot => Math.hypot(state.player.x-slot.x,state.player.y-slot.y)<slot.interactionRadius) ? "placing" : "holding") : "idle";
  state.room04Characters.pinxin.pose = state.audio.door04ReferencePlaying || state.door04.status === "testing"
    || state.door04Capsules.some(v => v.isPlaying) ? "listening"
    : ["opening", "open"].includes(state.door04.status) ? "confirming"
    : state.door04.heldVoiceId || presentation.placementRemaining > 0 ? "pointing" : "idle";
  const listeningVoice = state.door04Capsules.find((voice) => voice.isPlaying);
  let focus = state.player;
  let spots = ROOM04_CHARACTER_SPOTS.idle;
  if (state.audio.door04ReferencePlaying) {
    focus = state.door04ReferenceConsole;
    spots = ROOM04_CHARACTER_SPOTS.reference;
  } else if (state.door04.status === "testing") {
    focus = state.door04Slots[Math.max(0, state.door04.activeEntryCount - 1)];
    spots = ROOM04_CHARACTER_SPOTS.loom;
  } else if (["opening", "open"].includes(state.door04.status)) {
    focus = state.door04TestConsole;
    spots = ROOM04_CHARACTER_SPOTS.exit;
  } else if (listeningVoice) {
    focus = listeningVoice.originalPosition;
    spots = ROOM04_CHARACTER_SPOTS.loom;
  }

  if (holding && state.room04Characters.leroy.pose === "placing") {
    const slot=state.door04Slots.reduce((best,item)=>Math.hypot(state.player.x-item.x,state.player.y-item.y)<Math.hypot(state.player.x-best.x,state.player.y-best.y)?item:best);
    spots={...spots,leroy:{x:slot.x+60,y:slot.y+65}};
  }

  for (const [key, character] of Object.entries(state.room04Characters)) {
    const target = spots[key];
    character.targetX = target.x;
    character.targetY = target.y;
    character.idleElapsed += deltaTime;
    const previousX = character.x, previousY = character.y;
    character.x = approach(character.x, character.targetX, 88 * deltaTime);
    character.y = approach(character.y, character.targetY, 88 * deltaTime);
    updateNpcAnimation(character, previousX, previousY, deltaTime, focus.x);
  }
}

function approach(value, target, maximumDelta) {
  if (Math.abs(target - value) <= maximumDelta) return target;
  return value + Math.sign(target - value) * maximumDelta;
}

function updatePreviewVisuals(state, audio, deltaTime) {
  const measured = audio.getPreviewLevel?.() ?? 0;
  state.audio.previewLevel += (measured - state.audio.previewLevel) * Math.min(1, deltaTime * 14);
  const decay = Math.max(0, 1 - deltaTime * 5);
  state.subjectTerminal.visualLevel *= decay;
  for (const tower of state.echoTowers) tower.visualLevel *= decay;
  if (state.audio.activePreviewKind === "subject") state.subjectTerminal.visualLevel = state.audio.previewLevel;
  if (state.audio.activePreviewKind === "echo") {
    const tower = state.echoTowers.find((item) => item.id === state.audio.activePreviewId);
    if (tower) tower.visualLevel = state.audio.previewLevel;
  }
  const successMeasured = audio.getDoor03SuccessLevel?.() ?? 0;
  state.audio.door03SuccessLevel += (
    successMeasured - state.audio.door03SuccessLevel
  ) * Math.min(1, deltaTime * 10);
  const stemLevels = audio.getDoor04StemLevels?.() ?? [];
  state.audio.door04StemLevels = [0, 1, 2, 3].map((index) => stemLevels[index] ?? 0);
  for (const voice of state.door04Capsules) {
    voice.visualLevel *= decay;
    if (voice.isPlaying) voice.visualLevel = Math.max(0.3, state.audio.previewLevel);
    if (voice.slotIndex !== null && state.audio.door04TestPlaying) {
      voice.visualLevel = state.audio.door04StemLevels[voice.slotIndex] ?? 0;
    }
  }
  const door05ReferenceLevel = audio.getDoor05ReferenceLevel?.() ?? 0;
  state.audio.door05ReferenceLevel += (
    door05ReferenceLevel - state.audio.door05ReferenceLevel
  ) * Math.min(1, deltaTime * 12);
  const door05SuccessLevel = audio.getDoor05SuccessLevel?.() ?? 0;
  state.audio.door05SuccessLevel += (
    door05SuccessLevel - state.audio.door05SuccessLevel
  ) * Math.min(1, deltaTime * 12);
  const door06PreviewLevel = audio.getDoor06PreviewLevel?.() ?? 0;
  state.audio.door06PreviewLevel += (
    door06PreviewLevel - state.audio.door06PreviewLevel
  ) * Math.min(1, deltaTime * 12);
  const door06SuccessLevel = audio.getDoor06SuccessLevel?.() ?? 0;
  state.audio.door06SuccessLevel += (
    door06SuccessLevel - state.audio.door06SuccessLevel
  ) * Math.min(1, deltaTime * 12);
  for (const relay of state.door06Relays) {
    relay.energyLevel *= decay;
    if (relay.playing) relay.energyLevel = Math.max(0.28, state.audio.door06PreviewLevel);
  }
}
