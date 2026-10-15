import { currentDialogueEntry } from "../js/dialogue.js";
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
    manifest.href = new URL("./room1.webmanifest", import.meta.url).href;
    manifest.dataset.mobileRoom1 = "true";
    document.head.append(manifest);
  }

  const metas = [
    ["mobile-web-app-capable", "yes"],
    ["apple-mobile-web-app-capable", "yes"],
    ["apple-mobile-web-app-status-bar-style", "black-translucent"],
    ["apple-mobile-web-app-title", "Fugata Room 1"],
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
  const touchControls = frame?.querySelector(".game-touch-controls");
  const interactionPanel = gameScreen.querySelector(".interaction-panel");
  if (!frame || !touchControls || !interactionPanel) throw new Error("Room 1 mobile controls are missing");

  const stage = element("section", "mobile-room1-stage");
  stage.setAttribute("aria-label", "Room 1 手機遊戲畫面");
  const scene = element("section", "mobile-scene-column");
  const actions = element("section", "mobile-action-diamond");
  actions.setAttribute("aria-label", "互動控制");

  const hud = element("header", "mobile-room1-hud");
  const identity = element("div", "mobile-room1-identity");
  identity.append(element("small", "", "ROOM 1"), element("strong", "", "找到旋律的種子"));
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
    document.querySelector(".room-help-bar button")?.click();
    updateHelpCopy();
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
  rotate.append(element("strong", "", "請將手機旋轉為橫向"), element("span", "", "Room 1 的主要遊玩方向為橫式"));

  const labels = new Map([
    ["KeyE", "聆聽"],
    ["Enter", "拿取\n確認"],
    ["Space", "測試"],
    ["Escape", "取消\n歸還"],
  ]);
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
    actions.append(button);
  }

  touchControls.remove();
  scene.append(frame, zone, joystick, hud, feedback, interactionPanel, actions, dialogue);
  stage.append(scene);
  gameScreen.prepend(stage);
  document.body.append(rotate);

  const virtualJoystick = installVirtualJoystick({ canvas, stage, zone, joystick, knob });
  installFullscreenButton(fullscreen, fullscreenStatus, canvas);

  function updateHelpCopy() {
    const dialog = document.querySelector(".room-help-dialog");
    if (!dialog) return;
    const items = dialog.querySelectorAll("li");
    const copy = [
      "先到五座星核裝置，使用右側「聆聽」或點選裝置後試聽，比較旋律。",
      "使用「拿取／確認」拿取或交換片段；帶到右側主題之門，再用「聆聽」提交。",
      "完成後在左側按住並拖曳搖桿，走向右側已開啟的出口。",
    ];
    items.forEach((item, index) => { if (copy[index]) item.textContent = copy[index]; });
    const paragraph = dialog.querySelector("p");
    if (paragraph) paragraph.textContent = "左側按住並拖曳移動；快速點選場景裝置，再從右側選擇動作。";
  }

  updateHelpCopy();

  let signature = "";
  function render(state = getState()) {
    const active = state.phase === "game" && state.gameProgress.currentRoom === 1;
    stage.hidden = !active;
    if (!active) {
      virtualJoystick.stop();
      return;
    }

    const heading = interactionPanel.querySelector("strong");
    if (heading?.textContent.includes("Q 切換附近目標")) heading.textContent = "靠近裝置，或直接點選場景目標";
    const interactionHint = interactionPanel.querySelector("small");
    if (interactionHint) interactionHint.textContent = "左側拖曳移動 · 點選場景目標 · 右側菱形按鈕操作";
    updateHelpCopy();

    const entry = currentDialogueEntry(state);
    stage.dataset.dialogue = String(Boolean(entry));
    if (entry) virtualJoystick.stop();
    const fragment = heldFragment(state);
    const next = JSON.stringify([
      currentObjective(state),
      fragment?.displayLabel,
      state.ui.message?.lines,
      state.ui.message?.kind,
      entry?.speaker,
      entry?.text,
      state.dialogue.index,
      state.dialogue.entries.length,
    ]);
    if (next === signature) return;
    signature = next;

    objective.textContent = `任務：${currentObjective(state)}`;
    carry.textContent = `攜帶：${fragment?.displayLabel ?? "無"}`;
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
