export const FULLSCREEN_ROOM_TOOLS = Object.freeze({
  1: Object.freeze({ label: null }),
  2: Object.freeze({ label: null }),
  3: Object.freeze({ label: "接線指南" }),
  4: Object.freeze({ label: "聲部工具" }),
  5: Object.freeze({ label: null }),
  6: Object.freeze({ label: "重構進度" }),
});

export function createFullscreenTools({
  gameScreen,
  actions,
  canvas,
  interactionPanel,
  patchGuide,
  room04Transport,
  sequenceTransport,
  roomProgress,
}) {
  const drawer = document.createElement("aside");
  drawer.id = "fullscreen-tools-drawer";
  drawer.className = "fullscreen-tools-drawer";
  drawer.dataset.mode = "none";
  drawer.dataset.room = "1";
  drawer.setAttribute("aria-label", "房間工具");

  interactionPanel.dataset.fullscreenToolPanel = "interaction";
  for (const panel of [patchGuide, room04Transport, sequenceTransport, roomProgress]) {
    panel.dataset.fullscreenToolPanel = "room";
  }
  drawer.append(interactionPanel, patchGuide, room04Transport, sequenceTransport, roomProgress);
  gameScreen.append(drawer);

  const interactionToggle = document.createElement("button");
  interactionToggle.type = "button";
  interactionToggle.className = "fullscreen-tool-toggle";
  interactionToggle.dataset.fullscreenInteractionToggle = "";
  interactionToggle.textContent = "操作";
  interactionToggle.setAttribute("aria-controls", drawer.id);
  interactionToggle.setAttribute("aria-expanded", "false");

  const roomToggle = document.createElement("button");
  roomToggle.type = "button";
  roomToggle.className = "fullscreen-tool-toggle";
  roomToggle.dataset.fullscreenRoomToggle = "";
  roomToggle.setAttribute("aria-controls", drawer.id);
  roomToggle.setAttribute("aria-expanded", "false");
  actions.prepend(interactionToggle, roomToggle);

  let mode = "none";
  let room = 0;

  function setMode(nextMode) {
    mode = mode === nextMode ? "none" : nextMode;
    drawer.dataset.mode = mode;
    interactionToggle.setAttribute("aria-expanded", String(mode === "interaction"));
    roomToggle.setAttribute("aria-expanded", String(mode === "room"));
    canvas.focus({ preventScroll: true });
  }

  interactionToggle.addEventListener("click", () => setMode("interaction"));
  roomToggle.addEventListener("click", () => setMode("room"));

  function render(state) {
    const nextRoom = state.gameProgress.currentRoom;
    const fullscreen = document.documentElement.classList.contains("game-fullscreen");
    if (room !== nextRoom || !fullscreen || state.phase !== "game") {
      room = nextRoom;
      mode = "none";
    }

    const roomTool = FULLSCREEN_ROOM_TOOLS[nextRoom] ?? FULLSCREEN_ROOM_TOOLS[1];
    drawer.dataset.mode = mode;
    drawer.dataset.room = String(nextRoom);
    interactionToggle.hidden = !fullscreen;
    interactionToggle.disabled = interactionPanel.hidden;
    roomToggle.hidden = !fullscreen || !roomTool.label;
    roomToggle.textContent = roomTool.label ?? "關卡工具";
    interactionToggle.setAttribute("aria-expanded", String(mode === "interaction"));
    roomToggle.setAttribute("aria-expanded", String(mode === "room"));

    if (mode === "interaction" && interactionPanel.hidden) {
      mode = "none";
      drawer.dataset.mode = mode;
      interactionToggle.setAttribute("aria-expanded", "false");
    }
  }

  return { drawer, interactionToggle, roomToggle, render };
}
