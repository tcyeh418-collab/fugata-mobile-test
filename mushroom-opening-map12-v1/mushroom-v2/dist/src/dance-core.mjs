// Unmodified pure timing/judgement functions extracted from canonical Mushroom core.mjs.
// Only dependencies are the original 120 BPM constants; no legacy runtime or save imports.
const GAME_CONFIG={danceLeadInBeats:1,countdownBeats:4,resultDisplayBeats:1,beatDurationMs:500,danceInputWindowMs:220};
export const BEGINNER_STAGES=Object.freeze([
 {id:'A',sequence:['up','up','down','down']},
 {id:'B',sequence:['left','right','left','right']},
 {id:'C',sequence:['up','down','left','right']},
]);
export const DANCE_BPM=120;
export const BEAT_MS=500;
export const INPUT_WINDOW_MS=220;
export function getDanceRoundTiming(sequenceLength) {
  const leadInBeats = GAME_CONFIG.danceLeadInBeats;
  const demoStartBeat = leadInBeats;
  const countInStartBeat = demoStartBeat + sequenceLength;
  const playBeat = countInStartBeat + GAME_CONFIG.countdownBeats;
  const resultBeat = playBeat + sequenceLength;
  return {
    leadInBeats,
    demoStartBeat,
    countInStartBeat,
    playBeat,
    resultBeat,
    totalBeats: resultBeat + GAME_CONFIG.resultDisplayBeats,
  };
}

export function getDancePhaseAt(elapsedBeats, sequenceLength) {
  const timing = getDanceRoundTiming(sequenceLength);
  if (elapsedBeats < timing.demoStartBeat) {
    return {
      phase: "question",
      currentBeatIndex: Math.floor(elapsedBeats),
      demoIndex: -1,
      countInValue: null,
      inputIndex: -1,
    };
  }
  if (elapsedBeats < timing.countInStartBeat) {
    return {
      phase: "demonstrate",
      currentBeatIndex: Math.floor(elapsedBeats),
      demoIndex: Math.floor(elapsedBeats - timing.demoStartBeat),
      countInValue: null,
      inputIndex: -1,
    };
  }
  if (elapsedBeats < timing.playBeat) {
    const countInIndex = Math.floor(
      elapsedBeats - timing.countInStartBeat,
    );
    return {
      phase: "countdown",
      currentBeatIndex: Math.floor(elapsedBeats),
      demoIndex: -1,
      countInValue: GAME_CONFIG.countdownBeats - countInIndex,
      inputIndex: -1,
    };
  }
  if (elapsedBeats < timing.resultBeat) {
    return {
      phase: "input",
      currentBeatIndex: Math.floor(elapsedBeats),
      demoIndex: -1,
      countInValue: null,
      inputIndex: Math.floor(elapsedBeats - timing.playBeat),
    };
  }
  if (elapsedBeats < timing.totalBeats) {
    return {
      phase: "round-result",
      currentBeatIndex: Math.floor(elapsedBeats),
      demoIndex: -1,
      countInValue: null,
      inputIndex: sequenceLength,
    };
  }
  return {
    phase: "complete",
    currentBeatIndex: Math.floor(elapsedBeats),
    demoIndex: -1,
    countInValue: null,
    inputIndex: sequenceLength,
  };
}

export function resolveDanceInputBeat({
  inputTimeMs,
  roundStartAtMs,
  sequenceLength,
  beatDurationMs = GAME_CONFIG.beatDurationMs,
  inputWindowMs = GAME_CONFIG.danceInputWindowMs,
}) {
  const timing = getDanceRoundTiming(sequenceLength);
  const playAtMs = roundStartAtMs + timing.playBeat * beatDurationMs;
  const relativeBeats = (inputTimeMs - playAtMs) / beatDurationMs;
  const index = Math.round(relativeBeats);
  if (index < 0 || index >= sequenceLength) return null;
  const targetTimeMs = playAtMs + index * beatDurationMs;
  const offsetMs = inputTimeMs - targetTimeMs;
  if (Math.abs(offsetMs) > inputWindowMs) return null;
  return { index, offsetMs, targetTimeMs };
}

export function judgeDanceBeat({
  expectedDirection,
  receivedDirection,
  timingOffsetMs,
  inputWindowMs = GAME_CONFIG.danceInputWindowMs,
}) {
  if (
    receivedDirection == null ||
    timingOffsetMs == null ||
    Math.abs(timingOffsetMs) > inputWindowMs
  ) {
    return { result: "miss", points: 0 };
  }
  if (expectedDirection === receivedDirection) {
    return { result: "correct", points: 100 };
  }
  return { result: "wrong", points: 0 };
}

