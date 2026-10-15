const DISPLAY_DURATION = 2.2;
const FADE_DURATION = 0.4;

export const ROOM_COMPLETION_COPY = Object.freeze({
  2: "主題答句確認",
  3: "模組合成器接線完成",
  4: "四聲部編織完成",
  5: "節奏驅動完成",
  6: "FUGATA 核心重構完成",
});

export function showRoomCompletion(state, room) {
  const title = ROOM_COMPLETION_COPY[room];
  if (!title || state.ui.completionMarker?.room === room) return false;
  state.ui.completionMarker = {
    room,
    title,
    progress: `FUGATA RECONSTRUCTION ${room} / 6`,
    remaining: DISPLAY_DURATION,
    duration: DISPLAY_DURATION,
    fadeDuration: FADE_DURATION,
    alpha: 1,
  };
  return true;
}

export function updateRoomCompletion(state, deltaTime) {
  const marker = state.ui.completionMarker;
  if (!marker) return;
  marker.remaining = Math.max(0, marker.remaining - deltaTime);
  marker.alpha = marker.remaining <= marker.fadeDuration
    ? marker.remaining / marker.fadeDuration
    : 1;
  if (marker.remaining <= 1e-6) state.ui.completionMarker = null;
}

export function roomCompletionActive(state, room) {
  return state.ui.completionMarker?.room === room;
}
