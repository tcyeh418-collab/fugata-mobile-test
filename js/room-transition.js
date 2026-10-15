import { placeCompanions } from "./companions.js";
import { ROOM05_LANDMARKS, ROOM05_EXIT_TRIGGER } from "./room05-art.js";
import { ROOM06_LANDMARKS } from "./room06-art.js";
import { ROOM02_DOORWAY } from "./room02-layout.js?v=room02-perspective-exit-v1";
import { ROOM01_DOORWAY } from "./room01-layout.js?v=room01-theme-replay-v1";
import { ROOM03_DOORWAY } from "./room03-layout.js?v=room03-side-gate-v1";
import { ROOM04_DOORWAY } from "./room04-layout.js?v=room04-movement-fixes-v6";
import { roomCopy, roomTransitionTitle } from "./room-copy.js";

export const ROOM_TRANSITION_TIMING = Object.freeze({
  fadeOut: 0.5,
  hold: 0.3,
  fadeIn: 0.7,
});

export const ROOM_TRANSITION_TRIGGERS = Object.freeze([
  { fromRoom: 1, toRoom: 2, ...ROOM01_DOORWAY.trigger, doorKey: "door01", entryX: ROOM02_DOORWAY.entry.x, entryY: ROOM02_DOORWAY.entry.y, title: roomTransitionTitle(2) },
  {
    fromRoom: 2,
    toRoom: 3,
    ...ROOM02_DOORWAY.trigger,
    perspective: ROOM02_DOORWAY.perspective,
    doorKey: "door02",
    entryX: ROOM03_DOORWAY.entrance.arrival.x,
    entryY: ROOM03_DOORWAY.entrance.arrival.y,
    title: roomTransitionTitle(3),
  },
  { fromRoom: 3, toRoom: 4, x: ROOM03_DOORWAY.exit.trigger.x, minY: ROOM03_DOORWAY.exit.trigger.minY, maxY: ROOM03_DOORWAY.exit.trigger.maxY, doorKey: "door03", entryX: ROOM04_DOORWAY.entrance.arrival.x, entryY: ROOM04_DOORWAY.entrance.arrival.y, title: roomTransitionTitle(4) },
  { fromRoom: 4, toRoom: 5, x: ROOM04_DOORWAY.exit.trigger.x, minY: ROOM04_DOORWAY.exit.trigger.minY, maxY: ROOM04_DOORWAY.exit.trigger.maxY, doorKey: "door04", entryX: ROOM04_DOORWAY.exit.room05Arrival.x, entryY: ROOM04_DOORWAY.exit.room05Arrival.y, title: roomTransitionTitle(5) },
  { fromRoom: 5, toRoom: 6, ...ROOM05_EXIT_TRIGGER, doorKey: "door05", entryX: ROOM06_LANDMARKS.entry.x, entryY: ROOM06_LANDMARKS.entry.y, title: roomTransitionTitle(6) },
]);

export function maybeStartRoomTransition(state, audio) {
  const transition = state.roomTransition;
  if (transition.active) return false;
  const trigger = ROOM_TRANSITION_TRIGGERS.find(
    (item) => item.fromRoom === state.gameProgress.currentRoom,
  );
  const minY = trigger?.minY ?? 270;
  const maxY = trigger?.maxY ?? 390;
  const minX = trigger?.minX ?? trigger?.x;
  const maxX = trigger?.maxX ?? Number.POSITIVE_INFINITY;
  if (
    !trigger
    || (trigger.fromRoom !== 4 && transition.completedFromRooms.includes(trigger.fromRoom))
    || state[trigger.doorKey]?.status !== "open"
    || state.player.x < minX
    || state.player.x > maxX
    || state.player.y < minY
    || state.player.y > maxY
  ) return false;

  const perspective = trigger.perspective ?? null;
  Object.assign(transition, {
    active: true,
    phase: perspective ? "door-perspective" : "fade-out",
    fromRoom: trigger.fromRoom,
    toRoom: trigger.toRoom,
    opacity: 0,
    timer: 0,
    roomChanged: false,
    title: trigger.title,
    entryX: trigger.entryX,
    entryY: trigger.entryY,
    perspectiveProgress: 0,
    playerScale: 1,
    playerOpacity: 1,
    perspectiveStartX: state.player.x,
    perspectiveStartY: state.player.y,
    perspectiveTargetX: perspective?.vanishingPoint.x ?? state.player.x,
    perspectiveTargetY: perspective?.vanishingPoint.y ?? state.player.y,
    perspectiveDuration: perspective?.duration ?? 0,
    perspectiveMinScale: perspective?.minScale ?? 1,
    perspectiveFadeStart: perspective?.fadeStart ?? 1,
  });
  if (perspective) {
    state.player.facing = "back";
    state.player.moving = true;
  }
  if (trigger.fromRoom === 1 && state.room01ThemeReplay) {
    state.room01ThemeReplay.playing = false;
  }
  stopRoomAudio(audio);
  return true;
}

export function updateRoomTransition(state, deltaTime) {
  const transition = state.roomTransition;
  if (!transition.active) return false;
  transition.timer += deltaTime;
  if (transition.phase === "door-perspective") {
    const duration = Math.max(0.01, transition.perspectiveDuration);
    const progress = Math.min(1, transition.timer / duration);
    const eased = progress * progress * (3 - 2 * progress);
    const fadeStart = Math.min(0.99, transition.perspectiveFadeStart);
    transition.perspectiveProgress = progress;
    transition.playerScale = mix(1, transition.perspectiveMinScale, eased);
    transition.playerOpacity = progress <= fadeStart
      ? 1
      : 1 - (progress - fadeStart) / (1 - fadeStart);
    state.player.x = mix(transition.perspectiveStartX, transition.perspectiveTargetX, eased);
    state.player.y = mix(transition.perspectiveStartY, transition.perspectiveTargetY, eased);
    state.player.walkTime += deltaTime;
    state.player.moving = true;
    state.player.facing = "back";
    if (progress >= 1) {
      transition.phase = "fade-out";
      transition.timer = 0;
      transition.opacity = 0;
      transition.playerOpacity = 0;
      state.player.moving = false;
    }
  } else if (transition.phase === "fade-out") {
    transition.opacity = Math.min(1, transition.timer / ROOM_TRANSITION_TIMING.fadeOut);
    if (transition.timer >= ROOM_TRANSITION_TIMING.fadeOut) {
      transition.phase = "hold";
      transition.timer = 0;
      transition.opacity = 1;
      transition.roomChanged = true;
      state.gameProgress.currentRoom = transition.toRoom;
      state.gameProgress.currentDoor = transition.toRoom;
      state.player.x = transition.entryX;
      state.player.y = transition.entryY ?? 320;
      placeCompanions(state);
    }
  } else if (transition.phase === "hold") {
    transition.opacity = 1;
    if (transition.timer >= ROOM_TRANSITION_TIMING.hold) {
      transition.phase = "fade-in";
      transition.timer = 0;
    }
  } else if (transition.phase === "fade-in") {
    transition.opacity = Math.max(0, 1 - transition.timer / ROOM_TRANSITION_TIMING.fadeIn);
    if (transition.timer >= ROOM_TRANSITION_TIMING.fadeIn) {
      transition.opacity = 0;
      transition.active = false;
      transition.phase = "idle";
      transition.perspectiveProgress = 0;
      transition.playerScale = 1;
      transition.playerOpacity = 1;
      if (!transition.completedFromRooms.includes(transition.fromRoom)) {
        transition.completedFromRooms.push(transition.fromRoom);
      }
    }
  }
  return true;
}

function mix(start, end, progress) {
  return start + (end - start) * progress;
}

export function roomTransitionView(state) {
  const transition = state.roomTransition;
  return {
    active: transition.active,
    opacity: transition.opacity,
    showTitle: transition.active && transition.roomChanged,
    eyebrow: transition.toRoom ? `${roomCopy(transition.toRoom).ordinal}／06` : "",
    title: transition.title ?? "",
  };
}

function stopRoomAudio(audio) {
  audio.stopRoom01Theme?.();
  audio.stopPreview?.();
  audio.stopSuccessLoops?.(0.2);
  audio.stopDoor03Loop?.(0.12);
  audio.stopDoor03Success?.(0.2);
  audio.stopDoor04Audio?.();
  audio.stopDoor05Audio?.();
  audio.stopDoor06Audio?.();
}
