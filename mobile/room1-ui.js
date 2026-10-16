import { currentDialogueEntry } from "../js/dialogue.js";
import { isNearDoor } from "../js/door01.js?v=room01-theme-replay-v1";
import { door03PortById } from "../js/door03.js";
import { door03GuideViewModel } from "../js/door03-guide.js";
import {
  door04StageEntryCount,
  door04VoiceById,
  heldDoor04Voice,
  nearDoor04Reference,
  nearDoor04Test,
  nearestDoor04Pedestal,
  nearestDoor04Slot,
} from "../js/door04.js?v=room04-movement-fixes-v6";
import {
  door05ConfirmedAccents,
  door05Phase,
  door05SelectedAccents,
  isDoor05PhaseComplete,
  isDoor05PhaseUnlocked,
  nearDoor05Final,
  nearDoor05Test,
  nearestDoor05Node,
  nearestDoor05Terminal,
} from "../js/door05.js";
import { heldFragment } from "../js/state.js?v=room04-movement-fixes-v6";
import { currentObjective } from "../js/room-help.js?v=room04-movement-fixes-v6";

const MOVEMENT_THRESHOLD = 10;
const DEAD_ZONE = 14;
const KNOB_TRAVEL = 30;

function element(tag, className, text = "") {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function pressCanvasKey(canvas, code) {
  canvas.focus({ preventScroll: true });
  window.dispatchEvent(new KeyboardEvent("keydown", { code, bubbles: true }));
  window.dispatchEvent(new KeyboardEvent("keyup", { code, bubbles: true }));
}

function installMobileMetadata() {
  if (!document.querySelector('link[rel="manifest"][data-mobile-room1]')) {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = new URL("./room1.webmanifest?v=8", import.meta.url).href;
    manifest.dataset.mobileRoom1 = "true";
    document.head.append(manifest);
  }

  const metas = [
    ["mobile-web-app-capable", "yes"],
    ["apple-mobile-web-app-capable", "yes"],
    ["apple-mobile-web-app-status-bar-style", "black-translucent"],
    ["apple-mobile-web-app-title", "Fugata Room 1–5"],
  ];
  for (const [name, content] of metas) {
    if (document.querySelector(`meta[name="${name}"]`)) continue;
    const meta = document.createElement("meta");
    meta.name = name;
    meta.content = content;
    meta.dataset.mobileRoom1 = "true";
    document.head.append(meta);
  }
}

function installFullscreenButton(button, status, canvas) {
  const root = document.documentElement;
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  const requestFullscreen = root.requestFullscreen || root.webkitRequestFullscreen;
  const fallback = "加入主畫面以獲得較完整畫面";

  function update() {
    const active = Boolean(fullscreenElement());
    button.textContent = active ? "離開全螢幕" : "全螢幕遊玩";
    button.setAttribute("aria-pressed", String(active));
  }

  if (!requestFullscreen) {
    button.hidden = true;
    status.hidden = false;
    status.textContent = fallback;
    status.dataset.fullscreenFallback = "unsupported";
    return;
  }

  button.addEventListener("click", async () => {
    status.hidden = true;
    try {
      if (!fullscreenElement()) {
        await requestFullscreen.call(root, { navigationUI: "hide" });
        try { await screen.orientation?.lock?.("landscape"); } catch { /* Unsupported locks fall back quietly. */ }
      } else {
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
        if (exitFullscreen) await exitFullscreen.call(document);
      }
      canvas.focus({ preventScroll: true });
    } catch {
      status.hidden = false;
      status.textContent = fallback;
      status.dataset.fullscreenFallback = "request-rejected";
    }
    update();
  });
  document.addEventListener("fullscreenchange", update);
  document.addEventListener("webkitfullscreenchange", update);
  update();
}

function installVirtualJoystick({ canvas, stage, zone, joystick, knob }) {
  let pointerId = null;
  let originX = 0;
  let originY = 0;
  let moved = false;
  let pressedCodes = new Set();

  function dispatchKey(code, type) {
    window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
  }

  function applyCodes(nextCodes) {
    for (const code of pressedCodes) if (!nextCodes.has(code)) dispatchKey(code, "keyup");
    for (const code of nextCodes) if (!pressedCodes.has(code)) dispatchKey(code, "keydown");
    pressedCodes = nextCodes;
  }

  function stopJoystick() {
    applyCodes(new Set());
    pointerId = null;
    moved = false;
    joystick.dataset.active = "false";
    joystick.dataset.direction = "none";
    knob.style.transform = "translate(-50%, -50%)";
  }

  function placeJoystick(event) {
    const stageRect = stage.getBoundingClientRect();
    const diameter = joystick.getBoundingClientRect().width || 104;
    const radius = diameter / 2;
    const x = Math.min(Math.max(event.clientX - stageRect.left, radius + 3), stageRect.width / 2 - radius - 3);
    const y = Math.min(Math.max(event.clientY - stageRect.top, radius + 3), stageRect.height - radius - 3);
    joystick.style.left = `${x}px`;
    joystick.style.top = `${y}px`;
  }

  function updateJoystick(event) {
    const dx = event.clientX - originX;
    const dy = event.clientY - originY;
    const distance = Math.hypot(dx, dy);
    if (distance > MOVEMENT_THRESHOLD) moved = true;

    const scale = distance > KNOB_TRAVEL ? KNOB_TRAVEL / distance : 1;
    knob.style.transform = `translate(calc(-50% + ${dx * scale}px), calc(-50% + ${dy * scale}px))`;

    if (distance < DEAD_ZONE) {
      applyCodes(new Set());
      joystick.dataset.direction = "dead-zone";
      return;
    }

    const nx = dx / distance;
    const ny = dy / distance;
    const nextCodes = new Set();
    if (nx > .38) nextCodes.add("ArrowRight");
    if (nx < -.38) nextCodes.add("ArrowLeft");
    if (ny > .38) nextCodes.add("ArrowDown");
    if (ny < -.38) nextCodes.add("ArrowUp");
    applyCodes(nextCodes);
    joystick.dataset.direction = [...nextCodes].join("+") || "none";
  }

  zone.addEventListener("pointerdown", (event) => {
    if (pointerId !== null || event.button > 0) return;
    event.preventDefault();
    pointerId = event.pointerId;
    originX = event.clientX;
    originY = event.clientY;
    moved = false;
    canvas.focus({ preventScroll: true });
    placeJoystick(event);
    joystick.dataset.active = "true";
    joystick.dataset.direction = "dead-zone";
    zone.setPointerCapture(event.pointerId);
  });

  zone.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    event.preventDefault();
    updateJoystick(event);
  });

  zone.addEventListener("pointerup", (event) => {
    if (event.pointerId !== pointerId) return;
    event.preventDefault();
    const wasTap = !moved && Math.hypot(event.clientX - originX, event.clientY - originY) <= MOVEMENT_THRESHOLD;
    const canvasRect = canvas.getBoundingClientRect();
    stopJoystick();
    if (wasTap && event.clientX >= canvasRect.left && event.clientX <= canvasRect.right
      && event.clientY >= canvasRect.top && event.clientY <= canvasRect.bottom) {
      canvas.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY,
      }));
    }
  });
  zone.addEventListener("pointercancel", stopJoystick);
  zone.addEventListener("lostpointercapture", stopJoystick);
  window.addEventListener("blur", stopJoystick);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopJoystick(); });

  return { stop: stopJoystick };
}

export function installMobileRoom1Ui({ canvas, gameScreen, getState }) {
  installMobileMetadata();
  const frame = canvas.closest(".canvas-frame");
  const characterScreen = document.querySelector("#character-screen");
  const touchControls = frame?.querySelector(".game-touch-controls");
  const interactionPanel = gameScreen.querySelector(".interaction-panel");
  if (!frame || !touchControls || !interactionPanel) throw new Error("Room 1 mobile controls are missing");

  const stage = element("section", "mobile-room1-stage");
  stage.setAttribute("aria-label", "Room 1–5 手機遊戲畫面");
  const scene = element("section", "mobile-scene-column");
  const actions = element("section", "mobile-action-diamond");
  actions.setAttribute("aria-label", "互動控制");

  const hud = element("header", "mobile-room1-hud");
  const identity = element("div", "mobile-room1-identity");
  const roomNumber = element("small", "", "ROOM 1");
  const roomName = element("strong", "", "找到旋律的種子");
  identity.append(roomNumber, roomName);
  const objective = element("button", "mobile-room1-objective");
  objective.type = "button";
  objective.setAttribute("aria-label", "目前任務，點擊展開或收合");
  objective.setAttribute("aria-expanded", "false");
  objective.addEventListener("click", () => {
    objective.setAttribute("aria-expanded", String(objective.getAttribute("aria-expanded") !== "true"));
  });
  const carry = element("p", "mobile-room1-carry");
  const toolbar = element("div", "mobile-room1-toolbar");
  const help = element("button", "mobile-room1-help", "說明");
  help.type = "button";
  help.addEventListener("click", () => {
    document.querySelector(".room-help-bar [data-room-help]")?.click();
    updateHelpCopy(getState());
  });
  const fullscreen = element("button", "mobile-room1-fullscreen", "全螢幕遊玩");
  fullscreen.type = "button";
  fullscreen.setAttribute("aria-pressed", "false");
  const fullscreenStatus = element("p", "mobile-room1-fullscreen-status");
  fullscreenStatus.hidden = true;
  fullscreenStatus.setAttribute("role", "status");
  toolbar.append(help, fullscreen);
  hud.append(identity, objective, carry, toolbar, fullscreenStatus);

  const feedback = element("p", "mobile-room1-feedback");
  feedback.setAttribute("aria-live", "polite");

  const dialogue = element("section", "mobile-room1-dialogue");
  dialogue.setAttribute("aria-live", "polite");
  const speaker = element("strong", "mobile-dialogue-speaker");
  const dialogueText = element("p", "mobile-dialogue-text");
  const dialogueProgress = element("small", "mobile-dialogue-progress");
  const continueButton = element("button", "mobile-dialogue-continue", "繼續");
  continueButton.type = "button";
  continueButton.addEventListener("click", () => pressCanvasKey(canvas, "Enter"));
  dialogue.append(speaker, dialogueText, dialogueProgress, continueButton);

  const zone = element("div", "mobile-joystick-zone");
  zone.setAttribute("aria-label", "左側虛擬搖桿操作區");
  const joystick = element("div", "mobile-virtual-joystick");
  joystick.dataset.active = "false";
  joystick.dataset.direction = "none";
  const ring = element("span", "mobile-joystick-ring");
  const knob = element("span", "mobile-joystick-knob");
  joystick.append(ring, knob);

  const rotate = element("aside", "mobile-rotate-notice");
  rotate.setAttribute("role", "status");
  rotate.append(element("strong", "", "請將手機旋轉為橫向"), element("span", "", "Room 1–5 的主要遊玩方向為橫式"));

  const portrait = element("aside", "mobile-portrait-notice");
  portrait.setAttribute("role", "status");
  portrait.append(
    element("strong", "", "請將手機旋轉為直向"),
    element("span", "", "角色建立以直式操作；確認進入 Room 1 後再轉為橫向"),
  );

  const labels = new Map([
    ["KeyE", "聆聽"],
    ["Enter", "拿取\n確認"],
    ["Space", "測試"],
    ["Escape", "取消\n歸還"],
  ]);
  const actionButtons = new Map();
  for (const code of ["KeyE", "Enter", "Space", "Escape"]) {
    const button = touchControls.querySelector(`[data-control="${code}"]`);
    if (!button) continue;
    button.textContent = labels.get(code);
    button.setAttribute("aria-label", labels.get(code).replace("\n", "／"));
    button.addEventListener("pointerdown", () => { button.dataset.pressed = "true"; });
    const release = () => { button.dataset.pressed = "false"; };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    actionButtons.set(code, button);
    actions.append(button);
  }

  touchControls.remove();
  scene.append(frame, zone, joystick, hud, feedback, interactionPanel, actions, dialogue);
  stage.append(scene);
  gameScreen.prepend(stage);
  document.body.append(rotate, portrait);

  const virtualJoystick = installVirtualJoystick({ canvas, stage, zone, joystick, knob });
  installFullscreenButton(fullscreen, fullscreenStatus, canvas);

  function updateHelpCopy(state = getState()) {
    const dialog = document.querySelector(".room-help-dialog");
    if (!dialog) return;
    const items = dialog.querySelectorAll("li");
    const room = state.gameProgress.currentRoom;
    const copy = room === 5 ? [
      "先靠近已解鎖的節奏終端，按「聆聽節奏」切換並播放目前階段。",
      "走到九拍節奏環，右側按鈕會顯示「選擇重音」或「取消重音」；每階段選三個。",
      "到測試台按「測試節奏」；完成三個階段後，到最終台按「啟動推進」。",
    ] : room === 4 ? [
      "先到後方中央參考台按「播放參考」，完整聽完後才會解鎖排列測試。",
      "靠近音匣可按「聆聽聲部」或「拿取音匣」；帶到中央編排台後按「放置聲部」。",
      "靠近右側測試台按「測試排列」；播放中可按同一顆按鈕停止，再調整音匣。",
      "手上有音匣時可按「歸還音匣」送回原本基座；完成四聲部後走向右側出口。",
    ] : room === 3 ? [
      "先靠近振盪器按「檢查／監聽」，解鎖第一個接線步驟。",
      "依任務列提示，靠近輸出端按「接線／確認」，再到指定輸入端按一次完成接線。",
      "選取輸出端後可按「取消接線」；已完成的接線不會被取消。",
    ] : room === 2 ? [
      "先到主題終端按「聆聽」，記住最初的樂句主題。",
      "再到四座回應塔按「聆聽」比較；使用「連接／確認」送往出口。",
      "答對後使用左側搖桿，走向右側已開啟的門洞。",
    ] : [
      "先到五座星核裝置，使用右側「聆聽」或點選裝置後試聽，比較旋律。",
      "使用「拿取／確認」拿取或交換片段；拿取後仍可按「聆聽」重播。",
      "帶到右側主題之門，右側按鈕會改為「提交」；完成後走向右側出口。",
    ];
    items.forEach((item, index) => { if (copy[index]) item.textContent = copy[index]; });
    const paragraph = dialog.querySelector("p");
    if (paragraph) paragraph.textContent = "左側按住並拖曳移動；快速點選場景裝置，再從右側選擇動作。";
  }

  updateHelpCopy();

  function syncPresentation(state = getState()) {
    const playing = state.phase === "game" && [1, 2, 3, 4, 5].includes(state.gameProgress.currentRoom);
    const creating = state.phase === "character" && characterScreen && !characterScreen.hidden;
    document.documentElement.classList.toggle("mobile-room1-playing", playing);
    document.documentElement.classList.toggle("mobile-room1-creating", Boolean(creating));
    stage.hidden = !playing;
    if (!playing) virtualJoystick.stop();
    return playing;
  }

  const presentationObserver = new MutationObserver(() => syncPresentation());
  presentationObserver.observe(gameScreen, { attributes: true, attributeFilter: ["hidden"] });
  if (characterScreen) presentationObserver.observe(characterScreen, { attributes: true, attributeFilter: ["hidden"] });
  syncPresentation();

  let signature = "";
  function render(state = getState()) {
    const active = syncPresentation(state);
    if (!active) return;

    const heading = interactionPanel.querySelector("strong");
    if (heading?.textContent.includes("Q 切換附近目標")) heading.textContent = "靠近裝置，或直接點選場景目標";
    const interactionHint = interactionPanel.querySelector("small");
    if (interactionHint) interactionHint.textContent = "左側拖曳移動 · 點選場景目標 · 右側菱形按鈕操作";
    updateHelpCopy(state);

    const room = state.gameProgress.currentRoom;
    const room2 = room === 2;
    const room3 = room === 3;
    const room4 = room === 4;
    const room5 = room === 5;
    const atRoom1Door = room === 1 && isNearDoor(state);
    const selectedDoor03Output = room3
      ? door03PortById(state, state.door03.selectedOutputPortId)
      : null;
    const room3Guide = room3 ? door03GuideViewModel(state) : null;
    const room4Held = room4 ? heldDoor04Voice(state) : null;
    const room4Reference = room4 && nearDoor04Reference(state);
    const room4Test = room4 && nearDoor04Test(state);
    const room4PedestalVoice = room4 ? nearestDoor04Pedestal(state) : null;
    const room4Slot = room4 ? nearestDoor04Slot(state) : null;
    const room4SlotVoice = room4 && room4Slot
      ? door04VoiceById(state, room4Slot.assignedVoiceId)
      : null;
    const room4Busy = room4 && ["preparing", "testing"].includes(state.door04.status);
    const room4Locked = room4 && ["rejected", "opening", "open"].includes(state.door04.status);
    const room4Required = room4 ? door04StageEntryCount(state) : 0;
    const room5Phase = room5 ? door05Phase(state.door05.activePhaseId) : null;
    const room5Terminal = room5 ? nearestDoor05Terminal(state) : null;
    const room5Node = room5 ? nearestDoor05Node(state) : null;
    const room5Test = room5 && nearDoor05Test(state);
    const room5Final = room5 && nearDoor05Final(state);
    const room5Selected = room5 ? door05SelectedAccents(state) : [];
    const room5Confirmed = room5 ? door05ConfirmedAccents(state) : [];
    const room5PhaseComplete = room5 && isDoor05PhaseComplete(state, state.door05.activePhaseId);
    const room5TerminalUnlocked = room5Terminal
      ? isDoor05PhaseUnlocked(state, room5Terminal.phaseId)
      : false;
    const room5Busy = room5 && (
      state.door05.rejectionRemaining > 0
      || ["testing", "completion-spinning", "completion-hold", "launching", "opening", "open"]
        .includes(state.door05.status)
    );
    const room5MovementLocked = room5 && (
      state.door05.rejectionRemaining > 0
      || ["testing", "completion-spinning", "completion-hold", "launching", "opening"]
        .includes(state.door05.status)
    );
    stage.dataset.movementLocked = String(room5MovementLocked);
    if (room5MovementLocked) virtualJoystick.stop();
    roomNumber.textContent = `ROOM ${room}`;
    roomName.textContent = room5
      ? "讓九拍節奏向前奔跑"
      : room4 ? "依次排列並聆聽聲部組合"
        : room3 ? "組建模組合成器"
        : room2 ? "聽見主題的回應" : "找到旋律的種子";
    stage.setAttribute("aria-label", `Room ${room} 手機遊戲畫面`);
    const listenButton = actionButtons.get("KeyE");
    if (listenButton) {
      const room4ListenLabel = room4Reference
        ? state.door04.referencePlaybackStatus === "playing" ? "暫停\n參考" : "播放\n參考"
        : "聆聽\n聲部";
      const room5ListenLabel = room5Terminal
        ? `聆聽\n${door05Phase(room5Terminal.phaseId)?.displayName ?? "節奏"}`
        : "聆聽\n節奏";
      listenButton.textContent = room5
        ? room5ListenLabel
        : room4 ? room4ListenLabel : room3 ? "檢查\n監聽" : "聆聽";
      listenButton.setAttribute("aria-label", room5
        ? room5ListenLabel.replace("\n", "／")
        : room4
        ? room4ListenLabel.replace("\n", "／")
        : room3 ? "檢查／監聽" : "聆聽");
      listenButton.disabled = room5
        ? room5Busy || !room5Terminal || !room5TerminalUnlocked
        : room4
        ? room4Busy || room4Locked || room4Test
          || !(room4Reference || room4Held || room4PedestalVoice || room4SlotVoice)
        : false;
    }
    const enterButton = actionButtons.get("Enter");
    if (enterButton) {
      const room4EnterLabel = room4Slot
        ? room4Held && room4SlotVoice ? "交換\n聲部"
          : room4Held ? "放置\n聲部" : room4SlotVoice ? "取出\n聲部" : "拿取\n放置"
        : room4PedestalVoice ? room4Held ? "已持有\n音匣" : "拿取\n音匣"
          : "拿取\n放置";
      const room5EnterLabel = room5Node && room5Selected.includes(room5Node.stepNumber)
        ? "取消\n重音"
        : "選擇\n重音";
      enterButton.textContent = room5
        ? room5EnterLabel
        : room4
        ? room4EnterLabel
        : room3 ? "接線\n確認"
          : room2 ? "連接\n確認" : atRoom1Door ? "提交" : "拿取\n確認";
      enterButton.setAttribute(
        "aria-label",
        room5 ? room5EnterLabel.replace("\n", "／")
          : room4 ? room4EnterLabel.replace("\n", "／")
          : room3 ? "接線／確認" : room2 ? "連接／確認" : atRoom1Door ? "提交旋律" : "拿取／確認",
      );
      enterButton.disabled = room5
        ? room5Busy || !room5Node || room5PhaseComplete
          || room5Confirmed.includes(room5Node?.stepNumber)
        : room4
        ? room4Busy || room4Locked || room4Reference || room4Test
          || (!room4Slot && !room4PedestalVoice) || Boolean(room4PedestalVoice && room4Held)
        : false;
    }
    const testButton = actionButtons.get("Space");
    if (testButton) {
      const room4TestLabel = room4Busy
        ? "停止\n測試"
        : room4Reference ? "從頭\n重播" : "測試\n排列";
      const room5TestLabel = room5Busy
        ? ["completion-spinning", "completion-hold", "launching", "opening", "open"].includes(state.door05.status)
          ? "推進中"
          : "測試中"
        : room5Final ? "啟動\n推進" : "測試\n節奏";
      testButton.textContent = room5 ? room5TestLabel : room4 ? room4TestLabel : "測試";
      testButton.setAttribute("aria-label", room5
        ? room5TestLabel.replace("\n", "／")
        : room4 ? room4TestLabel.replace("\n", "／") : "測試");
      testButton.disabled = room5
        ? room5Busy || (!room5Test && !room5Final)
          || (room5Final && !state.door05.finalLaunchReady)
        : room4
        ? room4Locked || (!room4Busy && !room4Reference && !room4Test)
        : room2 || room3;
    }
    const cancelButton = actionButtons.get("Escape");
    if (cancelButton) {
      cancelButton.textContent = room5 ? "未使用" : room4 ? "歸還\n音匣" : room3 ? "取消\n接線" : "取消\n歸還";
      cancelButton.setAttribute("aria-label", room5 ? "本關未使用" : room4 ? "歸還音匣" : room3 ? "取消接線" : "取消／歸還");
      cancelButton.disabled = room2 || (room3 && !selectedDoor03Output)
        || (room4 && (!room4Held || room4Busy || room4Locked)) || room5;
    }

    const entry = currentDialogueEntry(state);
    stage.dataset.dialogue = String(Boolean(entry));
    if (entry) virtualJoystick.stop();
    const fragment = heldFragment(state);
    const next = JSON.stringify([
      currentObjective(state),
      room,
      fragment?.displayLabel,
      state.door02.selectedTowerId,
      state.door02.connectedTowerId,
      state.door03.currentStep,
      state.door03.completedEdgeIds.length,
      state.door03.selectedOutputPortId,
      state.door04.stage,
      state.door04.status,
      state.door04.referencePlaybackStatus,
      state.door04.referenceCompleted,
      state.door04.confirmedEntryCount,
      state.door04.heldVoiceId,
      state.door04.slotAssignments,
      state.door05.status,
      state.door05.activePhaseId,
      state.door05.completedPhaseIds,
      state.door05.selectedAccentsByPhase,
      state.door05.confirmedAccentsByPhase,
      state.door05.testStatus,
      state.door05.testBarIndex,
      state.door05.testStep,
      state.door05.rejectionRemaining,
      state.door05.finalLaunchReady,
      state.ui.message?.lines,
      state.ui.message?.kind,
      entry?.speaker,
      entry?.text,
      state.dialogue.index,
      state.dialogue.entries.length,
    ]);
    if (next === signature) return;
    signature = next;

    const objectiveCopy = room3
      ? `${room3Guide.stepLabel}：${room3Guide.stepCopy}`
      : currentObjective(state)
        .replace("按 E 提交", "按「提交」")
        .replace("從頭播放測試", "按「測試排列」")
        .replace("測試台按 Space", "測試台按「測試節奏」")
        .replace("最終驅動台按 Space", "最終驅動台按「啟動推進」");
    objective.textContent = `任務：${objectiveCopy}`;
    if (room5) {
      carry.textContent = state.door05.status === "testing"
        ? `測試：第 ${state.door05.testBarIndex + 1}／2 小節 · 第 ${state.door05.testStep || 1}／9 拍`
        : state.door05.finalLaunchReady
          ? "三階段完成 · 前往最終驅動台"
          : `階段：${room5Phase?.displayName ?? "基礎"} · 已選 ${room5Selected.length}／3 · 完成 ${state.door05.completedPhaseIds.length}／3`;
    } else if (room4) {
      carry.textContent = room4Busy
        ? `播放：${state.door04.activeEntryCount || 1}／${state.door04.testEntryCount || room4Required}`
        : room4Held ? `攜帶：${room4Held.displayLabel}`
          : `已確認：${state.door04.confirmedEntryCount}／4 · 本輪 ${room4Required} 聲部`;
    } else if (room3) {
      carry.textContent = selectedDoor03Output
        ? `已選：${selectedDoor03Output.moduleName} ${selectedDoor03Output.label}`
        : `接線：${state.door03.completedEdgeIds.length}／6`;
    } else if (room2) {
      const tower = state.echoTowers.find((item) => (
        item.id === (state.door02.connectedTowerId ?? state.door02.selectedTowerId)
      ));
      carry.textContent = `${state.door02.connectedTowerId ? "已連接" : "選擇"}：${tower?.displayLabel ?? "無"}`;
    } else {
      carry.textContent = `攜帶：${fragment?.displayLabel ?? "無"}`;
    }
    feedback.hidden = !state.ui.message;
    feedback.dataset.kind = state.ui.message?.kind ?? "status";
    feedback.textContent = state.ui.message?.lines.join(" · ") ?? "";

    dialogue.hidden = !entry;
    if (entry) {
      speaker.textContent = entry.speaker;
      dialogueText.textContent = entry.text;
      dialogueProgress.textContent = `${state.dialogue.index + 1}／${state.dialogue.entries.length}`;
      continueButton.textContent = state.dialogue.index === state.dialogue.entries.length - 1 ? "完成" : "繼續";
    }
  }

  render();
  return { render };
}
