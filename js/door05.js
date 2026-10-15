import { allowedTarget } from "./interaction-targets.js?v=room04-low-desk-v2";
import { ROOM05_LANDMARKS, room05RingPoint } from "./room05-art.js?v=room05-audible-clock-v1";
import { distanceBetween } from "./collision.js";
import {
  DOOR05_COMPLETION,
  DOOR05_PHASE_COMPLETION,
  DOOR05_WRONG_HINTS,
  startDialogue,
} from "./dialogue.js";
import { setMessage } from "./state.js?v=room04-low-desk-v2";
import { roomCompletionActive, showRoomCompletion } from "./completion-feedback.js";

export const DOOR05_EIGHTH_NOTE_SECONDS = 0.3;
export const DOOR05_BAR_DURATION_SECONDS = 2.7;
export const DOOR05_TEST_BAR_COUNT = 2;
export const DOOR05_TEST_DURATION_SECONDS =
  DOOR05_BAR_DURATION_SECONDS * DOOR05_TEST_BAR_COUNT;
export const DOOR05_FINAL_STEP_HOLD_SECONDS = 0.12;
export const DOOR05_COMPLETION_SPIN_LAPS = 3;
export const DOOR05_COMPLETION_SPIN_DURATION = 3;
export const DOOR05_COMPLETION_SPIN_HOLD_SECONDS = 0.3;
export const DOOR05_STEP_ONE_ANGLE = 0;
const TWO_PI = Math.PI * 2;

export function door05CompletionSpinAngle(
  startAngle,
  targetAngle,
  startedAt,
  now,
  duration = DOOR05_COMPLETION_SPIN_DURATION,
) {
  const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
  const eased = 1 - (1 - progress) ** 3;
  return {
    progress,
    angle: startAngle + (targetAngle - startAngle) * eased,
  };
}

export function door05VisualPosition(elapsed, duration = DOOR05_TEST_DURATION_SECONDS) {
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    return { barIndex: 0, stepIndex: 0, step: 0 };
  }
  const visualElapsed = Math.max(0, Math.min(duration - 0.000001, elapsed));
  const barIndex = Math.min(
    DOOR05_TEST_BAR_COUNT - 1,
    Math.floor(visualElapsed / DOOR05_BAR_DURATION_SECONDS),
  );
  const stepIndex = Math.max(
    0,
    Math.min(
      8,
      Math.floor(
        (visualElapsed % DOOR05_BAR_DURATION_SECONDS)
        / DOOR05_EIGHTH_NOTE_SECONDS,
      ),
    ),
  );
  return { barIndex, stepIndex, step: stepIndex + 1 };
}

export const DOOR05_PHASES = Object.freeze({
  foundation: Object.freeze({
    id: "foundation",
    displayName: "基礎",
    audioKey: "door05Foundation",
    correctAccents: Object.freeze([1, 4, 9]),
    requiredAccentCount: 3,
  }),
  drive: Object.freeze({
    id: "drive",
    displayName: "推進",
    audioKey: "door05Drive",
    correctAccents: Object.freeze([1, 3, 7]),
    requiredAccentCount: 3,
  }),
  sprint: Object.freeze({
    id: "sprint",
    displayName: "衝刺",
    audioKey: "door05Sprint",
    correctAccents: Object.freeze([1, 4, 7]),
    requiredAccentCount: 3,
  }),
});

export const DOOR05_PHASE_ORDER = Object.freeze(["foundation", "drive", "sprint"]);

export const DOOR05_TERMINALS = Object.freeze([
  { id: "door05-terminal-foundation", phaseId: "foundation", ...ROOM05_LANDMARKS.terminals[0], interactionRadius: 42 },
  { id: "door05-terminal-drive", phaseId: "drive", ...ROOM05_LANDMARKS.terminals[1], interactionRadius: 42 },
  { id: "door05-terminal-sprint", phaseId: "sprint", ...ROOM05_LANDMARKS.terminals[2], interactionRadius: 42 },
]);

export const DOOR05_TEST_CONSOLE = Object.freeze({
  id: "door05-test-console",
  ...ROOM05_LANDMARKS.test,
  interactionRadius: 58,
});

export const DOOR05_FINAL_CONSOLE = Object.freeze({
  id: "door05-final-console",
  ...ROOM05_LANDMARKS.final,
  interactionRadius: 62,
});

export const DOOR05_RELAYS = Object.freeze([
  { id: "door05-relay-foundation", phaseId: "foundation", ...ROOM05_LANDMARKS.relays[0] },
  { id: "door05-relay-drive", phaseId: "drive", ...ROOM05_LANDMARKS.relays[1] },
  { id: "door05-relay-sprint", phaseId: "sprint", ...ROOM05_LANDMARKS.relays[2] },
]);

export function createDoor05Nodes() {
  return Array.from({ length: 9 }, (_, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / 9);
    return {
      id: `door05-rhythm-node-${index + 1}`,
      stepNumber: index + 1,
      angle,
      ...room05RingPoint(angle),
      radius: 18,
      interactionRadius: 27,
      visualState: "inactive",
      isSelected: false,
      isConfirmed: false,
      isLocked: false,
      isTesting: false,
      pulseLevel: 0,
    };
  });
}

export function door05Phase(phaseId) {
  return DOOR05_PHASES[phaseId] ?? null;
}

export function door05SelectedAccents(state, phaseId = state.door05.activePhaseId) {
  return state.door05.selectedAccentsByPhase[phaseId] ?? [];
}

export function door05ConfirmedAccents(state, phaseId = state.door05.activePhaseId) {
  return state.door05.confirmedAccentsByPhase[phaseId] ?? [];
}

export function nearestDoor05Terminal(state) {
  return nearestWithin(state, state.door05Terminals);
}

export function nearestDoor05Node(state) {
  return nearestWithin(state, state.door05Nodes);
}

export function nearDoor05Test(state) {
  return allowedTarget(state,state.door05TestConsole) && distanceBetween(state.player, state.door05TestConsole)
    <= state.door05TestConsole.interactionRadius;
}

export function nearDoor05Final(state) {
  return allowedTarget(state,state.door05FinalConsole) && distanceBetween(state.player, state.door05FinalConsole)
    <= state.door05FinalConsole.interactionRadius;
}

export function isDoor05PhaseUnlocked(state, phaseId) {
  return state.door05.unlockedPhaseIds.includes(phaseId);
}

export function isDoor05PhaseComplete(state, phaseId) {
  return state.door05.completedPhaseIds.includes(phaseId);
}

export function handleDoor05Enter(state) {
  if (isDoor05InputLocked(state)) return false;
  const node = nearestDoor05Node(state);
  if (!node) return false;

  const phaseId = state.door05.activePhaseId;
  if (isDoor05PhaseComplete(state, phaseId)) {
    setMessage(state, ["這個階段已完成並鎖定。", "已完成的階段不能修改。"], 2, "door");
    return true;
  }

  const selected = door05SelectedAccents(state, phaseId);
  const confirmed = door05ConfirmedAccents(state, phaseId);
  if (confirmed.includes(node.stepNumber)) {
    setMessage(
      state,
      [`重音 ${node.stepNumber} 已確認並鎖定。`, "已確認的重音不能移除。"],
      2,
      "success",
    );
    return true;
  }
  const selectedIndex = selected.indexOf(node.stepNumber);
  if (selectedIndex >= 0) {
    selected.splice(selectedIndex, 1);
    syncDoor05NodeSelection(state);
    setMessage(state, [`已取消重音 ${node.stepNumber}`, `已選重音：${selected.length}／3`], 1.6, "slot");
    return true;
  }

  if (selected.length >= 3) {
    setMessage(
      state,
      ["已選滿三個位置。", "請先取消一個重音，再選擇新的位置。"],
      2.6,
      "carry",
    );
    return true;
  }

  selected.push(node.stepNumber);
  syncDoor05NodeSelection(state);
  state.door05.status = "configuring";
  setMessage(state, [`已選擇重音 ${node.stepNumber}`, `已選重音：${selected.length}／3`], 1.6, "slot");
  return true;
}

export function handleDoor05Listen(state, audio) {
  if (isDoor05InputLocked(state)) return false;
  const terminal = nearestDoor05Terminal(state);
  if (!terminal) return false;

  if (!isDoor05PhaseUnlocked(state, terminal.phaseId)) {
    setMessage(state, ["請先完成前一階段。"], 2, "door");
    return true;
  }

  const phase = door05Phase(terminal.phaseId);
  const complete = isDoor05PhaseComplete(state, terminal.phaseId);
  if (!complete) {
    state.door05.activePhaseId = terminal.phaseId;
    syncDoor05NodeSelection(state);
  }

  const playback = audio.playDoor05Reference?.(phase.audioKey, phase.id);
  if (!playback) {
    setDoor05AudioError(state, phase.displayName);
    return true;
  }
  state.door05.referencePlayingPhaseId = phase.id;
  state.door05.referenceStep = 1;
  setMessage(state, [`${phase.displayName} 播放中……`], 2, "preview");
  return true;
}

export function handleDoor05Space(state, audio) {
  if (isDoor05InputLocked(state)) return false;
  if (nearDoor05Test(state)) return beginDoor05Test(state, audio);
  if (nearDoor05Final(state)) return beginDoor05Launch(state, audio);
  return false;
}

export function beginDoor05Test(state, audio) {
  const phase = door05Phase(state.door05.activePhaseId);
  const selected = door05SelectedAccents(state);
  if (!phase || isDoor05PhaseComplete(state, phase.id)) return false;
  if (selected.length !== phase.requiredAccentCount) {
    setMessage(
      state,
      ["請選擇三個主要重音位置。"],
      2.2,
      "door",
    );
    return true;
  }

  const readiness = audio.getDoor05TestReadiness?.(phase.audioKey);
  if (readiness && !readiness.ready) {
    state.door05.status = "configuring";
    state.door05.testStatus = "idle";
    setMessage(
      state,
      readiness.bufferReady
        ? ["音訊正在恢復；請再按一次節奏測試。"]
        : ["音檔仍在載入與解碼，請稍候。"],
      2.2,
      "audio",
    );
    return true;
  }

  const transport = audio.startDoor05Test?.(
    phase.audioKey,
    DOOR05_TEST_DURATION_SECONDS,
  );
  if (transport?.error === "buffer-too-short") {
    state.door05.status = "configuring";
    state.door05.testStatus = "idle";
    state.audio.door05TestPlaying = false;
    setMessage(
      state,
      [
        `音訊錯誤：素材長度 ${transport.bufferDuration.toFixed(3)} 秒，短於一小節 2.700 秒。`,
        "測試已取消，這次不會判定答案。",
      ],
      4,
      "audio",
    );
    return true;
  }
  if (!transport) {
    setDoor05AudioError(state, "節奏測試");
    state.door05.status = "configuring";
    state.door05.testStatus = "idle";
    return true;
  }

  state.door05.status = "testing";
  state.door05.testStatus = "preparing";
  state.door05.testElapsed = 0;
  state.door05.testStartAt = transport.startAt;
  state.door05.audibleContextTime = null;
  state.door05.testClockSource = "waiting";
  state.door05.testLeadIn = transport.leadIn ?? 0.15;
  state.door05.testDuration = DOOR05_TEST_DURATION_SECONDS;
  state.door05.testEvaluationAt = DOOR05_TEST_DURATION_SECONDS + DOOR05_FINAL_STEP_HOLD_SECONDS;
  state.door05.testBufferDuration = transport.bufferDuration ?? null;
  state.door05.testLooped = Boolean(transport.looped);
  state.door05.testBarIndex = 0;
  state.door05.testStepIndex = 0;
  state.door05.lastRenderedStep = 0;
  state.door05.testStep = 0;
  state.audio.door05TestPlaying = true;
  syncDoor05NodeSelection(state);
  setMessage(
    state,
    [`正在測試「${phase.displayName}」……`],
    state.door05.testLeadIn + state.door05.testDuration,
    "testing",
  );
  return true;
}

export function beginDoor05Launch(state, audio, now = door05NowSeconds()) {
  const door = state.door05;
  if (door.completionSpinActive || door.completionSpinCompleted || door.finalLaunchTriggered) {
    return true;
  }
  if (!door.finalLaunchReady) {
    setMessage(state, ["需要完成三個節奏階段。"], 2, "door");
    return true;
  }

  beginDoor05CompletionSpin(state, now);
  return true;
}

export function beginDoor05CompletionSpin(state, now = door05NowSeconds()) {
  const door = state.door05;
  if (
    door.completionSpinActive
    || door.completionSpinCompleted
    || door.finalLaunchTriggered
  ) {
    return false;
  }

  const normalizedStart = ((door.wheelAngle % TWO_PI) + TWO_PI) % TWO_PI;
  const alignment = (DOOR05_STEP_ONE_ANGLE - normalizedStart + TWO_PI) % TWO_PI;
  door.completionSpinActive = true;
  door.completionSpinStartedAt = now;
  door.completionSpinStartAngle = door.wheelAngle;
  door.completionSpinTargetAngle = door.wheelAngle
    + DOOR05_COMPLETION_SPIN_LAPS * TWO_PI
    + alignment;
  door.completionSpinCompleted = false;
  door.completionSpinHoldUntil = null;
  door.status = "completion-spinning";
  setMessage(
    state,
    ["三組節奏已鎖定。", "節奏環正在收束……"],
    DOOR05_COMPLETION_SPIN_DURATION + DOOR05_COMPLETION_SPIN_HOLD_SECONDS,
    "success",
  );
  return true;
}

function startDoor05LaunchFlow(state, audio) {
  const door = state.door05;
  if (door.finalLaunchTriggered) return false;
  door.finalLaunchTriggered = true;
  door.finalLaunchReady = false;
  door.status = "launching";
  door.launchElapsed = 0;
  door.completed = true;
  state.gameProgress.flags.rhythmActivated = true;
  state.gameProgress.doorsCompleted = 5;
  showRoomCompletion(state, 5);
  const played = audio.playDoor05Success?.() ?? false;
  if (!played) setDoor05AudioError(state, "節奏完成音訊");
  setMessage(
    state,
    ["節奏已推動整個結構。"],
    3,
    "success",
  );
  return true;
}

export function updateDoor05(state, deltaTime, audio, now = door05NowSeconds()) {
  const door = state.door05;

  if (door.status === "open") {
    if (state.gameProgress.currentRoom === 5 && !state.dialogue.active && !door.completionDialogueShown && !roomCompletionActive(state, 5)) {
      door.completionDialogueShown = true;
      startDialogue(state, "door05-completion", DOOR05_COMPLETION);
    }
    return;
  }

  if (door.referencePlayingPhaseId) {
    const referenceTime = audio.getDoor05ReferenceTime?.();
    if (Number.isFinite(referenceTime) && referenceTime >= 0) {
      door.referenceStep = 1 + Math.floor(
        (referenceTime % DOOR05_BAR_DURATION_SECONDS) / DOOR05_EIGHTH_NOTE_SECONDS,
      );
    }
  }

  if (door.status === "testing") {
    const clock = audio.getDoor05TestClock?.();
    const transportTime = clock?.elapsed ?? audio.getDoor05TestTime?.();
    if (!Number.isFinite(transportTime)) {
      door.testStatus = "preparing";
      door.testStep = 0;
      for (const node of state.door05Nodes) node.isTesting = false;
      return;
    }
    const elapsed = transportTime;
    door.testElapsed = elapsed;
    door.audibleContextTime = clock?.audibleContextTime ?? null;
    door.testClockSource = clock?.source ?? "audio-transport";
    door.testStatus = elapsed < 0
      ? "preparing"
      : elapsed >= door.testDuration ? "holding-final-step" : "playing";
    const visual = door05VisualPosition(elapsed, door.testDuration);
    door.testBarIndex = visual.barIndex;
    door.testStepIndex = visual.stepIndex;
    door.testStep = visual.step;
    if (door.testStep > 0) door.lastRenderedStep = door.testStep;
    for (const node of state.door05Nodes) {
      node.isTesting = node.stepNumber === door.testStep;
      node.visualState = node.isTesting
        ? "test-pulse"
        : node.isConfirmed ? "confirmed"
          : node.isSelected ? "selected" : "inactive";
    }
    if (elapsed >= door.testEvaluationAt) {
      door.evaluationElapsed = elapsed;
      finishDoor05Test(state, audio, now);
    }
    return;
  }

  if (door.rejectionRemaining > 0) {
    door.rejectionRemaining = Math.max(0, door.rejectionRemaining - deltaTime);
    for (const node of state.door05Nodes) node.visualState = "rejected";
    if (door.rejectionRemaining <= 0) {
      door.testStatus = "idle";
      syncDoor05NodeSelection(state);
    }
    return;
  }

  if (door.status === "completion-spinning") {
    const spin = door05CompletionSpinAngle(
      door.completionSpinStartAngle,
      door.completionSpinTargetAngle,
      door.completionSpinStartedAt,
      now,
    );
    door.wheelAngle = spin.angle;
    if (spin.progress < 1) return;
    door.wheelAngle = door.completionSpinTargetAngle;
    door.completionSpinActive = false;
    door.completionSpinCompleted = true;
    door.completionSpinHoldUntil = door.completionSpinStartedAt
      + DOOR05_COMPLETION_SPIN_DURATION
      + DOOR05_COMPLETION_SPIN_HOLD_SECONDS;
    door.status = "completion-hold";
  }

  if (door.status === "completion-hold") {
    if (now < door.completionSpinHoldUntil) return;
    startDoor05LaunchFlow(state, audio);
    return;
  }

  if (door.status === "launching") {
    door.launchElapsed += deltaTime;
    if (door.launchElapsed >= 2.4) {
      door.status = "opening";
      door.openingProgress = 0;
    }
    return;
  }

  if (door.status !== "opening") return;
  door.openingProgress = Math.min(1, door.openingProgress + deltaTime / door.openingDuration);
  if (door.openingProgress < 1) return;
  door.status = "open";
}

export function syncDoor05NodeSelection(state) {
  const selected = door05SelectedAccents(state);
  const confirmed = door05ConfirmedAccents(state);
  const phaseComplete = isDoor05PhaseComplete(state, state.door05.activePhaseId);
  for (const node of state.door05Nodes) {
    node.isConfirmed = confirmed.includes(node.stepNumber);
    node.isSelected = selected.includes(node.stepNumber);
    node.isLocked = phaseComplete || node.isConfirmed;
    node.isTesting = false;
    node.visualState = phaseComplete
      ? "phase-locked"
      : node.isConfirmed ? "confirmed"
        : node.isSelected ? "selected" : "inactive";
  }
}

function finishDoor05Test(state, audio, now) {
  const door = state.door05;
  const phase = door05Phase(door.activePhaseId);
  audio.stopDoor05Test?.();
  state.audio.door05TestPlaying = false;
  door.testStatus = "evaluating";
  door.testStep = 0;

  const selected = [...door05SelectedAccents(state)].sort((a, b) => a - b);
  const correct = [...phase.correctAccents].sort((a, b) => a - b);
  const correctPositionCount = selected.filter((step) => correct.includes(step)).length;
  const confirmed = door05ConfirmedAccents(state, phase.id);
  for (const step of selected) {
    if (correct.includes(step) && !confirmed.includes(step)) confirmed.push(step);
  }
  confirmed.sort((a, b) => a - b);
  const isMatch = selected.length === correct.length
    && selected.every((step, index) => step === correct[index]);

  if (isMatch) {
    completeDoor05Phase(state, phase, now);
    return;
  }

  door.wrongAttemptsByPhase[phase.id] += 1;
  door.status = "configuring";
  door.rejectionRemaining = 1;
  for (const node of state.door05Nodes) node.visualState = "rejected";
  const attempts = door.wrongAttemptsByPhase[phase.id];
  const lines = ["重音位置與原始律動仍有差異。"];
  if (correctPositionCount > 0) lines.push("新的重音位置已鎖定");
  if (confirmed.length === 0) {
    lines.push("尚未確認任何重音；請重新比較強拍位置。");
  } else if (confirmed.length === 1) {
    lines.push(`已確認重音 ${confirmed[0]}；它會保持鎖定。`);
  } else {
    lines.push(`已確認重音 ${confirmed.join("、")}；只剩最後一個位置。`);
  }
  lines.push(`本次有 ${correctPositionCount}／3 個重音位置正確。`);
  setMessage(state, lines, 3, "rejected");
  const feedbackLevel = Math.min(3, confirmed.length + 1);
  const hint = DOOR05_WRONG_HINTS[feedbackLevel];
  if (hint) startDialogue(state, `door05-wrong-${phase.id}-${attempts}`, hint);
}

function completeDoor05Phase(state, phase, now) {
  const door = state.door05;
  door.confirmedAccentsByPhase[phase.id] = [...phase.correctAccents];
  if (!door.completedPhaseIds.includes(phase.id)) door.completedPhaseIds.push(phase.id);
  door.testStatus = "idle";
  door.rejectionRemaining = 0;

  const phaseIndex = DOOR05_PHASE_ORDER.indexOf(phase.id);
  const nextPhaseId = DOOR05_PHASE_ORDER[phaseIndex + 1];
  if (nextPhaseId) {
    if (!door.unlockedPhaseIds.includes(nextPhaseId)) door.unlockedPhaseIds.push(nextPhaseId);
    door.activePhaseId = nextPhaseId;
    door.status = "configuring";
    const phaseMessage = phase.id === "foundation"
      ? ["基礎重音已確認"]
      : ["推進重音已確認"];
    setMessage(state, phaseMessage, 2.4, "success");
    startDialogue(
      state,
      `door05-${phase.id}-completion`,
      DOOR05_PHASE_COMPLETION[phase.id],
    );
    syncDoor05NodeSelection(state);
    return;
  }

  door.finalLaunchReady = true;
  syncDoor05NodeSelection(state);
  startDialogue(
    state,
    `door05-${phase.id}-completion`,
    DOOR05_PHASE_COMPLETION[phase.id],
  );
  beginDoor05CompletionSpin(state, now);
}

function setDoor05AudioError(state, label) {
  state.audio.door05AssetsStatus = "Error";
  setMessage(state, [`音訊錯誤：${label} 無法播放。`], 2.5, "audio");
}

function isDoor05InputLocked(state) {
  return state.door05.rejectionRemaining > 0
    || [
      "testing",
      "completion-spinning",
      "completion-hold",
      "launching",
      "opening",
      "open",
    ].includes(state.door05.status);
}

function door05NowSeconds() {
  return performance.now() / 1000;
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
