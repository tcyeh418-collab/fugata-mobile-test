import {allowedTarget} from "./interaction-targets.js?v=room01-theme-replay-v1";
import { feedbackMessage, hintsEnabled } from './feedback-policy.js';
import { isNearDoor, isNearThemeReplayDevice, nearestPedestal } from "./door01.js?v=room01-theme-replay-v1";
import { nearestEchoTower, nearestSubjectTerminal } from "./door02.js";
import {
  door03PortById,
  nearDoor03PatchMonitor,
  nearestDoor03Module,
  nearestDoor03Port,
} from "./door03.js";
import { DOOR03_GUIDE_STEPS } from "./door03-guide.js";
import { DOOR03_SIGNAL_TYPES, VALID_DOOR03_EDGES } from "./door03-synth-data.js";
import {
  door04StageEntryCount,
  door04VoiceById,
  heldDoor04Voice,
  nearDoor04Reference,
  nearDoor04Test,
  nearestDoor04Pedestal,
  nearestDoor04Slot,
} from "./door04.js?v=room04-movement-fixes-v6";
import {
  door05Phase,
  door05ConfirmedAccents,
  door05SelectedAccents,
  isDoor05PhaseComplete,
  isDoor05PhaseUnlocked,
  nearDoor05Final,
  nearDoor05Test,
  nearestDoor05Node,
  nearestDoor05Terminal,
} from "./door05.js";
import {
  nearDoor06FinalReference,
  nearestDoor06Memory,
  nearestDoor06Relay,
} from "./door06.js";
import { roomCopy } from "./room-copy.js";
import { heldFragment } from "./state.js?v=room01-theme-replay-v1";
import { updateRoomCompletion } from "./completion-feedback.js";

const READY_NOTICE_DURATION = 2.7;
const NOTICE_FADE_DURATION = 0.7;

export function updateInteractionHint(state, deltaTime, interactionPerformed = false) {
  const hint = state.ui.contextHint;
  if (state.dialogue.active || state.tutorialOpen || !hintsEnabled(state)) {
    resetContextHint(hint);
    return;
  }
  const target = interactionTarget(state);
  if (!target) { resetContextHint(hint); return; }
  Object.assign(hint, { targetId: target.targetId, signature: target.signature,
    lines: target.lines, anchor: target.anchor, elapsed: 3, alpha: 0,
    visible: false, compactVisible: true });
}

export function setAudioNotice(state, status) {
  const notice = state.ui.audioNotice;
  if (notice.status === status) return;
  notice.status = status;
  notice.alpha = 1;
  notice.remaining = status === "Ready" ? READY_NOTICE_DURATION : Infinity;
}

export function updateTransientUi(state, deltaTime) {
  const notice = state.ui.audioNotice;
  if (notice.status === "Ready" && Number.isFinite(notice.remaining)) {
    notice.remaining = Math.max(0, notice.remaining - deltaTime);
    notice.alpha = notice.remaining <= NOTICE_FADE_DURATION
      ? notice.remaining / NOTICE_FADE_DURATION
      : 1;
  } else if (notice.status === "Loading" || notice.status === "Error") {
    notice.alpha = 1;
  } else {
    notice.alpha = 0;
  }
  const message = state.ui.message;
  if (message) {
    message.remaining = Math.max(0, message.remaining - deltaTime);
    message.alpha = message.fadeDuration > 0 && message.remaining <= message.fadeDuration
      ? message.remaining / message.fadeDuration
      : 1;
    if (message.remaining <= 1e-6) state.ui.message = null;
  }
  updateRoomCompletion(state, deltaTime);
}

export function createGameUi(elements) {
  const {
    statusRoom, statusDoors, statusCarrying, statusDoor,
    audioNotice, gameplayFeedback, roomControlsSummary,
    room01Hud, room01Objective, room01Carry,
    gameScreen, room03Hud, room03Objective, room03Device, room03StepCount, room03StepPips,
    completionMarker,
  } = elements;

  function render(state) {
    const carried = heldFragment(state);
    const room = state.gameProgress.currentRoom;
    statusRoom.textContent = room === 3
      ? "Room 3／共六室"
      : `${roomCopy(room).ordinal}／共六室`;
    statusDoors.textContent = `${state.gameProgress.doorsCompleted}／${state.gameProgress.totalDoors}`;
    const carriedVoice = heldDoor04Voice(state);
    statusCarrying.textContent = roomCarryingLabel(state, carried, carriedVoice);

    renderRoom01Hud(
      state,
      { room01Hud, room01Objective, room01Carry },
    );
    renderRoom03Hud(
      state,
      { gameScreen, room03Hud, room03Objective, room03Device, room03StepCount, room03StepPips },
    );
    renderCompletionMarker(state, completionMarker);
    if (room === 1) {
      statusDoor.textContent = `${roomCopy(1).action}｜${formatStatus(state.door01.status)}`;
    } else if (room === 2) {
      statusDoor.textContent = `${roomCopy(2).action}｜${formatStatus(state.door02.status)}`;
    } else if (room === 3) {
      const connectionCount = state.door03.connectedEdges.length;
      const patchState = state.door03.selectedOutputPortId ? " · 請選擇輸入端" : "";
      statusDoor.textContent = `${roomCopy(3).action}｜${formatStatus(state.door03.status)} · 接線進度 ${connectionCount}／6 · ${door03Goal(state.door03.currentStep)}${patchState}`;
    } else if (room === 4) {
      const required = door04StageEntryCount(state);
      const testProgress = state.door04.status === "testing"
        ? ` · 聲部測試 ${state.door04.activeEntryCount}／${state.door04.testEntryCount}`
        : "";
      statusDoor.textContent = `${roomCopy(4).action}｜${formatStatus(state.door04.status)} · ${door04StageLabel(state.door04.stage)} · 已確認 ${state.door04.confirmedEntryCount}／4 · 目前聲部 ${required || 0}${testProgress}`;
    } else if (room === 5) {
      const phase = door05Phase(state.door05.activePhaseId);
      const selected = door05SelectedAccents(state).length;
      const confirmed = door05ConfirmedAccents(state).length;
      const completed = state.door05.completedPhaseIds.length;
      const testProgress = state.door05.status === "testing"
        ? ` · 測試第 ${Math.max(1, state.door05.testStep)}／9 拍`
        : "";
      statusDoor.textContent = `${roomCopy(5).action}｜${formatStatus(state.door05.status)} · ${phase.displayName}階段 · 已選 ${selected}／3 · 已確認 ${confirmed}／3 · 完成 ${completed}／3${testProgress}`;
    } else {
      if (state.door06.status === "confirming") {
        statusDoor.textContent = "等待記憶確認";
      } else if (state.door06.stage === "relays" || state.door06.stage === "relay-transition") {
        statusDoor.textContent = `${roomCopy(6).action}｜步驟 1／3 · 核心訊號 ${state.door06.activatedRelayCount}／5 · 依序回復訊號`;
      } else if (state.door06.stage === "final-reference") {
        statusDoor.textContent = `${roomCopy(6).action}｜步驟 2／3 · 最終參考尚未完成 · 請聽到自然結束`;
      } else {
        statusDoor.textContent = `${roomCopy(6).action}｜步驟 3／3 · 最終參考已完成 · 找出回歸的主題`;
      }
    }

    renderAudioNotice(state, audioNotice);
    renderGameplayFeedback(state, gameplayFeedback);
    renderRoomSummary(state, roomControlsSummary);
  }

  return { render };
}

function renderRoom01Hud(state, elements) {
  const { room01Hud, room01Objective, room01Carry } = elements;
  const isRoom01 = state.gameProgress.currentRoom === 1;
  room01Hud.hidden = !isRoom01;
  if (!isRoom01) return;

  const carried = heldFragment(state);
  const playing = state.fragments.find((fragment) => fragment.isPlaying);
  const themePlaying = state.room01ThemeReplay.playing;
  const rejected = state.door01.rejectionFlashRemaining > 0 || state.door01.status === "rejected";
  const complete = state.gameProgress.flags.subjectIdentified;
  const visualState = complete
    ? "complete"
    : rejected ? "rejected" : (playing || themePlaying) ? "listening" : carried ? "carrying" : state.dialogue.active ? "dialogue" : "normal";
  room01Hud.dataset.state = visualState;

  room01Carry.textContent = carried ? carried.displayLabel : complete ? "已送入主題之門" : "未攜帶";
  if (complete) {
    room01Objective.textContent = "樂句主題已確認";
  } else if (rejected && state.ui.message?.lines?.[0]) {
    room01Objective.textContent = state.ui.message.lines[0];
  } else if (state.door01.status === "checking") {
    room01Objective.textContent = state.ui.message?.lines?.[0] ?? "正在檢查旋律片段……";
  } else if (playing) {
    room01Objective.textContent = `${playing.displayLabel} 播放中……`;
  } else if (themePlaying) {
    room01Objective.textContent = "Fugata 主題播放中；回到左側留聲機可自行停止。";
  } else if (carried) {
    room01Objective.textContent = "將攜帶的旋律片段帶到右側主題之門。";
  } else {
    room01Objective.textContent = "聆聽五段旋律，找出樂句主題。";
  }
}

function renderRoom03Hud(state, elements) {
  const { gameScreen, room03Hud, room03Objective, room03Device, room03StepCount, room03StepPips } = elements;
  const isRoom03 = state.gameProgress.currentRoom === 3;
  gameScreen.dataset.room = String(state.gameProgress.currentRoom);
  gameScreen.dataset.dialogue = String(state.dialogue.active);
  room03Hud.hidden = !isRoom03;
  if (!isRoom03) return;

  const selected = door03PortById(state, state.door03.selectedOutputPortId);
  const rejected = state.door03.rejectionRemaining > 0;
  const complete = Boolean(state.gameProgress.flags.patchCompleted);
  const visualState = complete
    ? "complete"
    : rejected ? "rejected" : selected ? "selected" : state.dialogue.active ? "dialogue" : "normal";
  gameScreen.dataset.door03State = visualState;
  room03Hud.dataset.state = visualState;

  const completedCount = state.door03.completedEdgeIds.length;
  const displayedStep = complete
    ? 6
    : state.door03.oscillatorDiscovered ? Math.max(1, Math.min(6, state.door03.currentStep)) : 0;
  room03StepCount.textContent = `${completedCount}／6`;
  [...room03StepPips.children].forEach((pip, index) => {
    pip.dataset.complete = String(index < completedCount);
  });

  if (complete) {
    room03Objective.textContent = "模組合成器接線完成";
  } else if (selected) {
    room03Objective.textContent = `步驟 ${displayedStep}／6：${DOOR03_GUIDE_STEPS[displayedStep]}`;
  } else {
    const step = state.door03.oscillatorDiscovered
      ? Math.max(1, Math.min(6, state.door03.currentStep))
      : 0;
    room03Objective.textContent = step > 0
      ? `步驟 ${step}／6：${DOOR03_GUIDE_STEPS[step]}`
      : DOOR03_GUIDE_STEPS[step];
  }
  if (room03Device) room03Device.textContent = room03DeviceSummary(state, selected, complete);
}

function room03DeviceSummary(state, selectedPort, complete) {
  if (complete) return "六條正式接線已鎖定，揚聲器與出口已啟動。";
  const nearby = nearestDoor03Module(state);
  const expected = VALID_DOOR03_EDGES[Math.max(0, state.door03.currentStep - 1)];
  const expectedPort = expected ? door03PortById(state, expected.fromPortId) : null;
  const module = state.door03Modules.find((item) => (
    item.id === (selectedPort?.moduleId ?? nearby?.id ?? expectedPort?.moduleId)
  ));
  if (!module) return "靠近器材後可查看功能與訊號類型。";
  const signals = [...new Set([...module.inputPorts, ...module.outputPorts]
    .map((port) => DOOR03_SIGNAL_TYPES[port.signalType]?.label).filter(Boolean))].join("／");
  const selection = selectedPort
    ? ` · 已選 ${selectedPort.type === "output" ? "OUT" : "IN"} ${selectedPort.label}`
    : "";
  return `${module.displayName}：${module.description.join("")} · ${signals}${selection}`;
}

function interactionTarget(state) {
  const room = state.gameProgress.currentRoom;
  if (room === 1) return door01Target(state);
  if (room === 2) return door02Target(state);
  if (room === 3) return door03Target(state);
  if (room === 4) return door04Target(state);
  if (room === 5) return door05Target(state);
  if (room === 6) return door06Target(state);
  return null;
}

function door06Target(state) {
  if (
    state.door06.endingTriggered
    || ["relay-playing", "relay-replay", "reference-playing", "stage-transition", "confirming", "checking", "rejected", "reconstructing", "opening"].includes(state.door06.status)
  ) return null;

  const relay = nearestDoor06Relay(state);
  if (relay) {
    const expected = state.door06Relays[state.door06.activeRelayIndex];
    const ready = relay.activated || relay.id === expected?.id;
    return {
      targetId: relay.id,
      signature: `${relay.id}:${relay.activated ? "replay" : "restore"}:${relay.playing ? "playing" : "idle"}`,
      lines: ready
        ? [`E — ${relay.activated ? "重播" : "回復"}${relay.displayName}`, relay.activated ? "僅供重聽" : "完整播放後即可確認"]
        : [`下一個：${expected?.displayName ?? "最終參考"}`, "這座繼電器仍未解鎖"],
      anchor: { x: relay.x, y: relay.y },
    };
  }

  if (nearDoor06FinalReference(state)) {
    const available = state.door06.finalReferenceUnlocked;
    return {
      targetId: state.door06FinalReferenceConsole.id,
      signature: `${state.door06FinalReferenceConsole.id}:${available ? "ready" : "locked"}:${state.door06.finalReferenceCompleted}`,
      lines: available
        ? ["E — 聆聽歌曲結尾", "請完整聽到自然結束"]
        : ["請先啟動五座核心繼電器", "最終參考仍未解鎖"],
      anchor: {
        x: state.door06FinalReferenceConsole.x,
        y: state.door06FinalReferenceConsole.y,
      },
    };
  }

  const memory = nearestDoor06Memory(state);
  if (!memory) return null;
  return {
    targetId: memory.id,
    signature: `${memory.id}:${state.door06.memoriesUnlocked ? "ready" : "locked"}:${memory.isPlaying ? "playing" : "idle"}`,
    lines: state.door06.memoriesUnlocked
      ? [`E — 聆聽${memory.displayLabel}`, `Enter — 選取${memory.displayLabel}，再按 Space 確認`]
      : state.door06.stage === "relays"
        ? ["先啟動五座核心繼電器", "記憶稜鏡仍在休眠"]
        : ["請先完整聆聽最終參考", "記憶稜鏡仍未解鎖"],
    anchor: { x: memory.x, y: memory.y },
  };
}

function door05Target(state) {
  if (
    state.door05.rejectionRemaining > 0
    || ["testing", "launching", "opening", "open"].includes(state.door05.status)
  ) return null;

  const terminal = nearestDoor05Terminal(state);
  if (terminal) {
    const phase = door05Phase(terminal.phaseId);
    const unlocked = isDoor05PhaseUnlocked(state, terminal.phaseId);
    const playing = state.audio.door05ReferencePlayingPhaseId === terminal.phaseId;
    return {
      targetId: terminal.id,
      signature: `${terminal.id}:${unlocked ? "unlocked" : "locked"}:${playing ? "replay" : "play"}`,
      lines: unlocked
        ? [`E — ${playing ? "重新播放" : "聆聽"}${phase.displayName}節奏`, "參考律動"]
        : ["請先完成前一階段", "完成後才會解鎖"],
      anchor: { x: terminal.x, y: terminal.y },
    };
  }

  const node = nearestDoor05Node(state);
  if (node) {
    const complete = isDoor05PhaseComplete(state, state.door05.activePhaseId);
    const selected = door05SelectedAccents(state).includes(node.stepNumber);
    const confirmed = door05ConfirmedAccents(state).includes(node.stepNumber);
    return {
      targetId: node.id,
      signature: `${node.id}:${complete ? "locked" : selected ? "selected" : "available"}`,
      lines: complete
        ? ["這個階段已完成", "節奏環已鎖定"]
        : confirmed
          ? [`第 ${node.stepNumber} 拍重音已確認`, "已確認並鎖定"]
        : [`Enter — ${selected ? "取消" : "選擇"}第 ${node.stepNumber} 拍重音`, `已選重音：${door05SelectedAccents(state).length}／3`],
      anchor: { x: node.x, y: node.y },
    };
  }

  if (nearDoor05Test(state)) {
    const ready = door05SelectedAccents(state).length === 3
      && !isDoor05PhaseComplete(state, state.door05.activePhaseId);
    return {
      targetId: state.door05TestConsole.id,
      signature: `${state.door05TestConsole.id}:${ready ? "ready" : "incomplete"}`,
      lines: ready
        ? ["Space — 測試目前節奏", "播放兩小節後判定"]
        : ["請選擇三個主要重音位置", "選滿三個位置才能測試"],
      anchor: { x: state.door05TestConsole.x, y: state.door05TestConsole.y },
    };
  }

  if (nearDoor05Final(state)) {
    return {
      targetId: state.door05FinalConsole.id,
      signature: `${state.door05FinalConsole.id}:${state.door05.finalLaunchReady ? "ready" : "locked"}`,
      lines: state.door05.finalLaunchReady
        ? ["Space — 發動節奏推進", "啟動最終節奏"]
        : ["需要完成三個節奏階段", "三個階段完成後才會解鎖"],
      anchor: { x: state.door05FinalConsole.x, y: state.door05FinalConsole.y },
    };
  }
  return null;
}

function door04Target(state) {
  if (["preparing", "testing", "rejected", "opening", "open"].includes(state.door04.status)) return null;
  if (nearDoor04Reference(state)) {
    return {
      targetId: state.door04ReferenceConsole.id,
      signature: `${state.door04ReferenceConsole.id}:${state.audio.door04ReferencePlaying ? "replay" : "play"}`,
      lines: [
        `E — ${state.audio.door04ReferencePlaying ? "暫停" : state.door04.referencePlaybackStatus === "paused" ? "繼續" : "播放"}參考混音`,
        "Space — 從頭重播；播放時也可排列",
      ],
      anchor: { x: state.door04ReferenceConsole.x, y: state.door04ReferenceConsole.y },
    };
  }

  const voice = nearestDoor04Pedestal(state);
  const held = heldDoor04Voice(state);
  if (held && allowedTarget(state,held,held.originalPosition) && Math.hypot(state.player.x - held.originalPosition.x, state.player.y - held.originalPosition.y) <= held.interactionRadius) {
    return { targetId: held.id, signature: `${held.id}:return`,
      lines: [`Enter — 放回${held.displayLabel}`, "Esc — 隨時歸還原本基座"], anchor: { ...held.originalPosition } };
  }
  if (voice) {
    if (voice.currentLocation === "held") {
      return {
        targetId: voice.id,
        signature: `${voice.id}:return`,
        lines: [`Enter — 放回${voice.displayLabel}`, "放回原本的基座"],
        anchor: { ...voice.originalPosition },
      };
    }
    return {
      targetId: voice.id,
      signature: `${voice.id}:pedestal:${held ? "blocked" : "take"}`,
      lines: held
        ? [`E — 聆聽${voice.displayLabel}`, "你已經攜帶一個聲部音匣"]
        : [`E — 聆聽${voice.displayLabel}`, `Enter — 拿起${voice.displayLabel}`],
      anchor: { ...voice.originalPosition },
    };
  }

  const slot = nearestDoor04Slot(state);
  if (slot) {
    const assigned = door04VoiceById(state, slot.assignedVoiceId);
    const entry = slot.index+1;
    let lines;
    let action;
    const required = door04StageEntryCount(state);
    if (slot.index >= required) {
      action = "locked";
      lines = [`位置 ${entry} 尚未解鎖`, "請先完成目前階段"];
    } else if (slot.index < state.door04.confirmedEntryCount) {
      action = "confirmed";
      lines = [`位置 ${entry} 已確認並鎖定`, assigned ? `E — 重聽${assigned.displayLabel}` : "已確認"];
    } else if (held && assigned) {
      action = "swap";
      lines = ["Enter — 交換聲部", `${held.displayLabel} → 位置 ${entry}`];
    } else if (held) {
      action = "place";
      lines = [`Enter — 將${held.displayLabel}放入位置 ${entry}`, "放置聲部音匣"];
    } else if (assigned) {
      action = "remove";
      lines = [`Enter — 取出${assigned.displayLabel}`, `從位置 ${entry} 取出`];
    } else {
      action = "empty";
      lines = [`位置 ${entry} 是空的`, "請先拿取一個聲部音匣"];
    }
    return {
      targetId: slot.id,
      signature: `${slot.id}:${action}:${assigned?.displayLabel ?? "none"}:${held?.displayLabel ?? "none"}`,
      lines,
      anchor: { x: slot.x, y: slot.y },
    };
  }

  if (nearDoor04Test(state)) {
    const required = door04StageEntryCount(state);
    const ready = state.door04.referenceCompleted && required > 0 && state.door04.slotAssignments.slice(0, required).every(Boolean);
    return {
      targetId: state.door04TestConsole.id,
      signature: `${state.door04TestConsole.id}:${ready ? "ready" : "incomplete"}`,
      lines: ready
        ? ["E — 測試聲部順序", "依排列逐段完整播放，結束後判定"]
        : [`請先完成目前的${door04StageLabel(state.door04.stage)}階段`, `填入前 ${required || 0} 個位置`],
      anchor: { x: state.door04TestConsole.x, y: state.door04TestConsole.y },
    };
  }
  return null;
}

function door01Target(state) {
  const carried = heldFragment(state);
  const door = state.door01;
  const replay = state.room01ThemeReplay;
  if (isNearThemeReplayDevice(state)) {
    return {
      targetId: replay.id,
      signature: `${replay.id}:${replay.playing ? "playing" : "idle"}`,
      lines: replay.playing
        ? ["E — 停止 Fugata 主題", "再次播放會從歌曲開頭開始"]
        : ["E — 從頭播放 Fugata 主題", "播放後由你決定何時停止"],
      anchor: { ...replay.interactionPoint },
    };
  }
  if (isNearDoor(state) && door.status !== "open") {
    if (door.status !== "locked") return null;
    const carriedLabel = carried?.displayLabel ?? "none";
    return {
      targetId: door.id,
      signature: `${door.id}:${door.status}:${carriedLabel}`,
      lines: carried
        ? [`E — 將${carried.displayLabel}放入訊號槽`, "插入門上的主題訊號槽"]
        : ["門上的主題訊號槽仍然是空的", "請先攜帶一個音樂碎片"],
      anchor: { x: 775, y: 238 },
    };
  }

  const fragment = nearestPedestal(state);
  if (!fragment) return null;
  const action = fragment.isHeld ? "return" : carried ? "swap" : "carry";
  return {
    targetId: fragment.id,
    signature: `${fragment.id}:${action}`,
    lines: fragment.isHeld
      ? [`Enter — 放回${fragment.displayLabel}`, "放回原本的基座"]
      : [`E — 聆聽${fragment.displayLabel}`, `Enter — ${carried ? "交換" : "攜帶"}${fragment.displayLabel}`],
    anchor: { x: fragment.x, y: fragment.y },
  };
}

function door02Target(state) {
  if (state.door02.status === "opening" || state.door02.status === "open") return null;
  const terminal = nearestSubjectTerminal(state);
  if (terminal) {
    return {
      targetId: terminal.id,
      signature: `${terminal.id}:listen`,
      lines: ["E — 重聽樂句主題", "重播已辨識的旋律"],
      anchor: { x: terminal.x, y: terminal.y },
    };
  }

  const tower = nearestEchoTower(state);
  if (!tower) return null;
  const selection = tower.isSelected ? "selected" : "available";
  return {
    targetId: tower.id,
    signature: `${tower.id}:${selection}:${state.door02.status}`,
    lines: [`E — 聆聽 ${tower.displayLabel}`, `Enter — 將 ${tower.displayLabel} 接入門鎖`],
    anchor: { x: tower.x, y: tower.y },
  };
}

function door03Target(state) {
  if (["opening", "open"].includes(state.door03.status)) return null;
  if (nearDoor03PatchMonitor(state)) {
    return {
      targetId: state.door03PatchMonitor.id,
      signature: `${state.door03PatchMonitor.id}:${state.door03.currentStageNumber}`,
      lines: state.door03.currentStageAudioKey
        ? ["E — 重聽目前接線階段", `接線階段 ${state.door03.currentStageNumber}`]
        : ["接線監聽器休眠中", "先找到振盪器／VCO"],
      anchor: { x: state.door03PatchMonitor.x, y: state.door03PatchMonitor.y },
    };
  }
  const port = nearestDoor03Port(state);
  if (port && !port.fixed) {
    const selected = Boolean(state.door03.selectedOutputPortId);
    if (port.type === "output") {
      return {
        targetId: port.id,
        signature: `${port.id}:output:${selected ? "switch" : "select"}`,
        lines: [
          `Enter — ${selected ? "切換至" : "選擇"} ${port.label}`,
          selected ? "切換暫時接線的來源" : `${port.signalType} · 開始接線`,
        ],
        anchor: { x: port.x, y: port.y },
      };
    }
    return {
      targetId: port.id,
      signature: `${port.id}:input:${selected ? "connect" : "waiting"}:${state.door03.connectedEdges.length}`,
      lines: selected
        ? [`Enter — 連接至 ${port.label}`, "完成目前接線"]
        : [`${port.label}`, "請先選擇一個輸出端"],
      anchor: { x: port.x, y: port.y },
    };
  }

  const module = nearestDoor03Module(state);
  if (!module) return null;
  return {
    targetId: module.id,
    signature: `${module.id}:inspect:${module.visualState}`,
    lines: [`E — 檢查 ${module.displayName}`, module.description[0]],
    anchor: { x: module.x, y: module.y },
  };
}

function resetContextHint(hint) {
  hint.targetId = null;
  hint.signature = null;
  hint.lines = [];
  hint.anchor = null;
  hint.elapsed = 0;
  hint.alpha = 0;
  hint.visible = false;
  hint.compactVisible = false;
}

function renderAudioNotice(state, element) {
  const notice = state.ui.audioNotice;
  const shouldShow = false; // Essential audio errors share the single feedback region.
  element.hidden = !shouldShow;
  element.textContent = {
    Loading: "音訊載入中",
    Ready: "音訊已就緒",
    Error: "音訊載入失敗",
  }[notice.status] ?? "";
  element.dataset.status = notice.status.toLowerCase();
  element.style.opacity = shouldShow ? notice.alpha.toFixed(3) : "0";
}

function renderGameplayFeedback(state, element) {
  const message = feedbackMessage(state);
  element.hidden = !message;
  element.textContent = message?.lines.join("  ·  ") ?? "";
  element.dataset.kind = message?.kind ?? "status";
  element.style.opacity = message ? String(message.alpha ?? 1) : "0";
}

function renderCompletionMarker(state, element) {
  if (!element) return;
  const marker = state.ui.completionMarker;
  element.hidden = !marker || !hintsEnabled(state);
  if (!marker || !hintsEnabled(state)) return;
  element.querySelector("small").textContent = marker.progress;
  element.querySelector("strong").textContent = marker.title;
  element.style.opacity = String(marker.alpha);
}

function renderRoomSummary(state, element) {
  const remaining = state.ui.controlsHintRemaining;
  const room = state.gameProgress.currentRoom;
  const supportedRoom = room >= 1 && room <= 6;
  element.hidden = !(
    hintsEnabled(state) && remaining > 0
    && supportedRoom
    && !state.dialogue.active
  );
  if (room === 1) element.textContent = "Room 1：E — 播放／停止主題、聆聽片段　 Enter — 拿取旋律片段";
  else if (room === 2) element.textContent = "Room 2：E — 聆聽　 Enter — 將回應塔接入門鎖";
  else if (room === 3) element.textContent = `組建模組合成器 · 步驟 ${state.door03.currentStep}／6 · ${door03Goal(state.door03.currentStep)}　E — 檢查／重聽　Enter — 輸出端 → 輸入端　Esc — 取消`;
  else if (room === 4) element.textContent = "Room 4：E — 聆聽／測試　Enter — 拿放　Esc — 歸還　Space — 參考從頭重播";
  else if (room === 5) element.textContent = "選出定義律動的三個重音；幽靈音符不列入答案。　E — 聆聽　 Enter — 切換重音　 Space — 測試";
  else if (state.door06.stage === "relays" || state.door06.stage === "relay-transition") {
    element.textContent = `步驟 1／3 · 樂句主題 → 主題答句 → 合成器接線 → 聲部編排 → 節奏驅動 · ${state.door06.activatedRelayCount}／5`;
  } else if (state.door06.stage === "final-reference") {
    element.textContent = "步驟 2／3 · 將最終參考完整播放到自然結束";
  } else {
    element.textContent = state.door06.completed ? "核心重構完成：你確認的記憶與最終參考相符。請走向右側出口。" : state.door06.status === "confirming" ? "Space — 確認送回核心　Esc — 取消選取" : "步驟 3／3 · E — 聆聽 · Enter — 選取 · Space — 確認";
  }
  element.style.opacity = remaining > 1 ? "1" : Math.max(0, remaining).toFixed(3);
}

function roomCarryingLabel(state, fragment, voice) {
  if (state.gameProgress.currentRoom === 4) return voice?.displayLabel ?? "無";
  if (state.gameProgress.currentRoom === 5) {
    const phase = door05Phase(state.door05.activePhaseId);
    return `${phase.displayName} · ${door05SelectedAccents(state).length}／3`;
  }
  if (state.gameProgress.currentRoom === 6) return "無";
  return fragment?.displayLabel ?? "無";
}

function formatStatus(status) {
  return {
    locked: "等待解鎖",
    listening: "聆聽中",
    testing: "測試中",
    rejected: "尚未正確",
    ready: "可以操作",
    active: "進行中",
    "patching": "接線中",
    "reference-ready": "可播放參考",
    "reference-playing": "播放參考中",
    arranging: "編排中",
    preparing: "準備整串音訊中",
    launching: "啟動中",
    opening: "開門中",
    open: "已開啟",
    complete: "已完成",
  }[status] ?? "進行中";
}

function door03Goal(step) {
  return [
    "找到振盪器／VCO",
    "將音高控制訊號接入振盪器",
    "將聲音訊號接入濾波器",
    "將聲音訊號接入效果器",
    "將處理後的聲音接入 VCA",
    "用閘門訊號觸發包絡",
    "將包絡控制訊號接入 VCA",
  ][step] ?? "接線完成";
}

function door04StageLabel(stage) {
  return {
    reference: "參考聆聽",
    pair: "雙聲部",
    trio: "三聲部",
    quartet: "四聲部",
    complete: "完成",
  }[stage] ?? "聲部編排";
}
