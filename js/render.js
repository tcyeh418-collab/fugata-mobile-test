import {room04CarriedCapsule} from "./room04-carry.js";
import {room04InteractionFrame, room04DeviceState, ROOM04_DEVICE_STATES, ROOM04_STATE_FRAMES} from "./room04-atlas.js";
import {drawExitGuidance} from "./exit-guidance.js?v=room04-movement-fixes-v6";
import {targets,reachable} from "./interaction-targets.js?v=room01-theme-replay-v1";
import { ROOM06_ART, ROOM06_PORTALS } from "./room06-art.js";
import { ROOM05_ART, ROOM05_LANDMARKS, ROOM05_RING_CENTER, room05RingPoint } from "./room05-art.js";
import { drawNpc, loadNpcArt } from "./character/npc-v3.js";
import { drawGameAvatar } from "./character/game-avatar.js";
import { currentDialogueEntry } from "./dialogue.js";
import {
  DOOR03_SIGNAL_TYPES,
  VALID_DOOR03_EDGES,
  isDoor03StaticGuideEdge,
} from "./door03-synth-data.js?v=room03-side-gate-v1";
import { door04TestConsoleLabel } from "./door04.js?v=room04-movement-fixes-v6";
import { rooms, staticWalls } from "./rooms.js?v=room01-theme-replay-v1";
import {
  ROOM01_DOORWAY,
  ROOM01_STATIONS,
  ROOM01_STATION_SPRITE,
  ROOM01_THEME_REPLAY_DEVICE,
  ROOM01_VIEWPORT,
} from "./room01-layout.js?v=room01-theme-replay-v1";
import {
  ROOM02_ARTBOARD,
  ROOM02_SPRITE_LAYOUT,
  ROOM02_TERMINAL_CABLE_ROUTE,
  ROOM02_VIEWPORT,
} from "./room02-layout.js?v=room02-perspective-exit-v1";
import {
  ROOM03_ARTBOARD,
  ROOM03_CABLE_WAYPOINTS,
  ROOM03_DEVICE_GEOMETRY,
  ROOM03_DOORWAY,
  ROOM03_GATE_LAYOUT,
  ROOM03_OVERLAY_LAYOUT,
  ROOM03_PROCEDURAL_WALL_IDS,
  ROOM03_VIEWPORT,
  room03GateDestination,
} from "./room03-layout.js?v=room03-side-gate-v1";
import {
  ROOM04_ARTBOARD,
  ROOM04_ACTOR_LAYOUT,
  ROOM04_IMAGE_REGIONS,
  ROOM04_STATION_SPRITE,
  room04ActiveSlot,
  ROOM04_DOORWAY,
  ROOM04_PROCEDURAL_WALL_IDS,
  ROOM04_SPRITE_LAYOUT,
  ROOM04_VIEWPORT,
} from "./room04-layout.js?v=room04-movement-fixes-v6";
import { WORLD, heldFragment } from "./state.js?v=room01-theme-replay-v1";

const C = {
  background: "#090710", floor: "#12101a", floor2: "#0d121b", floor3: "#101018",
  wall: "#30283d", edge: "#514162", violet: "#ad7cff", cyan: "#68d9e8",
  pale: "#f1eaff", muted: "#9486a1", reject: "#ff6b4a", success: "#9ee8d6",
  gold: "#e4ad45", warmGold: "#ffd477", ink: "#080b0f",
};

const ROOM01_ART_SOURCES = Object.freeze({
  background: "assets/art/fugata/room01/observatory-background-v2.png",
  stations: "assets/art/fugata/room01/melody-station-atlas.png",
  themeReplay: "assets/art/fugata/room01/theme-replay-device-v1.png?v=room01-theme-replay-v1",
  gate: "assets/art/fugata/room01/subject-gate-celestial-atlas-v5.png?v=room01-clean-gate-v4",
  doorwayForeground: "assets/art/fugata/room01/doorway-foreground-occlusion-v1.png?v=room01-clean-gate-v4",
  leroy: "assets/art/fugata/room01/leroy.png",
  pinxin: "assets/art/fugata/room01/pinxin.png",
});

const ROOM01_STATION_REGIONS = Object.freeze({
  idle: Object.freeze({ x: 96, y: 80, width: 470, height: 700 }),
  empty: Object.freeze({ x: 606, y: 80, width: 470, height: 700 }),
  listening: Object.freeze({ x: 1111, y: 80, width: 470, height: 700 }),
  carried: Object.freeze({ x: 1580, y: 270, width: 330, height: 330 }),
});

const ROOM01_GATE_REGIONS = Object.freeze({
  locked: Object.freeze({ x: 0, y: 0, width: 260, height: 434 }),
  ready: Object.freeze({ x: 260, y: 0, width: 260, height: 434 }),
  rejected: Object.freeze({ x: 520, y: 0, width: 260, height: 434 }),
  open: Object.freeze({ x: 780, y: 0, width: 260, height: 434 }),
});

const ROOM02_ART_SOURCES = Object.freeze({
  background: "assets/art/fugata/room02/echo-hall-background-clean.png?v=room02-plain-gates-v1",
  subjectTerminal: "assets/art/fugata/room02/subject-terminal-atlas.png",
  echoTower: "assets/art/fugata/room02/echo-tower-atlas.png",
});

const ROOM02_SUBJECT_REGIONS = Object.freeze({
  idle: Object.freeze({ x: 0, y: 0, width: 768, height: 1024 }),
  playing: Object.freeze({ x: 768, y: 0, width: 768, height: 1024 }),
});

const ROOM02_TOWER_REGIONS = Object.freeze({
  idle: Object.freeze({ x: 0, y: 0, width: 441, height: 713 }),
  listening: Object.freeze({ x: 441, y: 0, width: 441, height: 713 }),
  checking: Object.freeze({ x: 882, y: 0, width: 442, height: 713 }),
  rejected: Object.freeze({ x: 1324, y: 0, width: 441, height: 713 }),
  connected: Object.freeze({ x: 1765, y: 0, width: 441, height: 713 }),
});

const ROOM03_ART_SOURCES = Object.freeze({
  background: "assets/art/fugata/room03/workshop-background.png",
  equipment: "assets/art/fugata/room03/synth-equipment-atlas.png",
  sideGateClosed: "assets/art/fugata/room03/room03-side-gate-closed-v1.png",
  sideGateOpen: "assets/art/fugata/room03/room03-side-gate-open-v1.png",
  leroy: "assets/art/fugata/room03/leroy.png",
  pinxin: "assets/art/fugata/room03/pinxin.png",
});

const ROOM03_ATLAS_REGIONS = Object.freeze({
  "filter-vcf": Object.freeze({ x: 42, y: 126, width: 440, height: 326 }),
  "envelope-adsr": Object.freeze({ x: 565, y: 8, width: 390, height: 335 }),
  "amp-vca": Object.freeze({ x: 1065, y: 130, width: 430, height: 330 }),
  sequencer: Object.freeze({ x: 28, y: 545, width: 450, height: 350 }),
  "oscillator-vco": Object.freeze({ x: 560, y: 664, width: 430, height: 350 }),
  effect: Object.freeze({ x: 1060, y: 540, width: 460, height: 360 }),
  monitor: Object.freeze({ x: 510, y: 340, width: 410, height: 330 }),
  speaker: Object.freeze({ x: 865, y: 355, width: 245, height: 310 }),
});

const ROOM04_ART_SOURCES = Object.freeze({
  deskFront: "assets/art/fugata/room04/arrangement-desk-front-v4.png",
  stationFront: "assets/art/fugata/room04/voice-station-front-v4.png",
  leroyInteraction: "assets/art/fugata/room04/leroy-interaction-atlas-v1.png",
  pinxinInteraction: "assets/art/fugata/room04/pinxin-interaction-atlas-v1.png",
  station: "assets/art/fugata/room04/voice-station-back-v4.png?v=room04-movement-fixes-v6",
  fx: "assets/art/fugata/room04/device-state-atlas-v2.png?v=room04-movement-fixes-v6",
  background: "assets/art/fugata/room04/weaving-chamber-background-v3.png?v=room04-movement-fixes-v6",
  capsules: "assets/art/fugata/room04/voice-capsule-v3.png?v=room04-no-microphone-v3",
  referenceConsole: "assets/art/fugata/room04/reference-console-v4.png?v=room04-movement-fixes-v6",
  voiceLoom: "assets/art/fugata/room04/arrangement-desk-back-v4.png?v=room04-movement-fixes-v6",
  testConsole: "assets/art/fugata/room04/test-console-v4.png?v=room04-movement-fixes-v6",
  leroy: "assets/art/fugata/room03/leroy.png?v=room04-movement-fixes-v6",
  pinxin: "assets/art/fugata/room03/pinxin.png?v=room04-movement-fixes-v6",
});

const ROOM1_MOBILE_PLAYTEST_PACKAGE = true;

export function createRenderer(canvas, options = {}) {
  loadNpcArt();
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable.");
  const externalRoom01Ui = options.externalRoom01Ui === true;
  const room01Art = Object.fromEntries(
    Object.entries(ROOM01_ART_SOURCES).map(([key, source]) => [key, loadImage(source)]),
  );
  const room02Art = Object.fromEntries(
    Object.entries(ROOM1_MOBILE_PLAYTEST_PACKAGE ? {} : ROOM02_ART_SOURCES).map(([key, source]) => [key, loadImage(source)]),
  );
  const room03Art = Object.fromEntries(
    Object.entries(ROOM1_MOBILE_PLAYTEST_PACKAGE ? {} : ROOM03_ART_SOURCES).map(([key, source]) => [key, loadImage(source)]),
  );
  const room04Art = Object.fromEntries(
    Object.entries(ROOM1_MOBILE_PLAYTEST_PACKAGE ? {} : ROOM04_ART_SOURCES).map(([key, source]) => [key, loadImage(source)]),
  );
  const room05Image = ROOM1_MOBILE_PLAYTEST_PACKAGE ? new Image() : loadImage(ROOM05_ART.src);
  const room06Image = ROOM1_MOBILE_PLAYTEST_PACKAGE ? new Image() : loadImage(ROOM06_ART.src);
  const reducedMotion = options.reducedMotion
    ?? (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

  function render(state) {
    canvas.dataset.reducedMotion = String(reducedMotion);
    const followedCameraX = state.player.x - canvas.width * 0.5;
    const room01CameraX = rooms.subject.x - (canvas.width - rooms.subject.width) * 0.5;
    const cameraX = state.gameProgress.currentRoom === 1
      ? room01CameraX
      : state.gameProgress.currentRoom === 2
        ? ROOM02_VIEWPORT.x
      : state.gameProgress.currentRoom === 4
        ? ROOM04_VIEWPORT.x
        : state.gameProgress.currentRoom === 5 ? ROOM05_ART.clip.x
        : state.gameProgress.currentRoom === 6 ? ROOM06_ART.clip.x
        : Math.max(
        0,
        Math.min(
          WORLD.width - canvas.width,
          state.gameProgress.currentRoom === 3 ? ROOM03_VIEWPORT.x : followedCameraX,
        ),
      );
    canvas.dataset.cameraX=String(cameraX);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    drawBackground(cameraX);
    context.save();
    context.translate(-cameraX, 0);
    drawRooms(state);
    drawRoom01Backdrop(state);
    drawRoom02Backdrop(state);
    drawRoom03Backdrop(state);
    drawRoom04Backdrop(state);
    if (state.gameProgress.currentRoom === 5) drawRoom05Art();
    if (state.gameProgress.currentRoom === 6) drawRoom06Art();
    drawDoor02Cables(state);
    depthQueue = [];
    drawDoor04Timeline(state);
    drawDoor05Energy(state);
    drawDoor01Pedestals(state);
    drawRoom01ThemeReplayDevice(state);
    drawSubjectTerminal(state);
    drawEchoTowers(state);
    drawDoor03Cables(state);
    drawDoor03Modules(state);
    drawDoor03PatchMonitor(state);
    drawDoor03Ports(state);
    drawDoor03Legend(state);
    drawDoor04Capsules(state);
    drawDoor04Consoles(state);
    drawDoor05Terminals(state);
    drawDoor05Ring(state);
    drawDoor05Consoles(state);
    drawDoor06Relays(state);
    drawDoor06Core(state);
    drawDoor06Memories(state);
    drawDoor06FinalReference(state);
    drawDoor01(state);
    drawDoor04(state);
    drawDoor05(state);
    drawDoor06(state);
    drawFutureRoomMask(state);
    drawRoom01Characters(state);
    drawRoom02Characters(state);
    drawRoom03Characters(state);
    drawRoom04Characters(state);
    if (state.gameProgress.currentRoom >= 5 && state.companions?.room === state.gameProgress.currentRoom) {
      for (const key of ['leroy','pinxin']) {
        const c = state.companions[key];
        atDepth(c.y, () => {
          context.save(); context.translate(c.x,c.y);
          if (!drawNpc(context,c,84,reducedMotion) && imageReady(room01Art[key])) context.drawImage(room01Art[key],-28,-84,56,84);
          context.restore();
        });
      }
    }
    atDepth(state.player.y, () => drawPlayer(state));
    const ordered = depthQueue; depthQueue = null;
    ordered.sort((a,b)=>a.footY-b.footY).forEach(item=>item.draw());
    drawRoom01Foreground(state);
    drawRoom03Foreground(state);
    drawRoom04Foreground(state);
    drawExitGuidance(context,state);
    context.restore();
    if(!state.tutorialOpen && !(externalRoom01Ui && state.gameProgress.currentRoom === 1)) {
      drawContextHint(state, cameraX);
    }
    if (state.gameProgress.currentRoom === 3 && !state.dialogue.active) {
      drawRoom03StatusToast(state);
    }
    if (state.dialogue.active && !(externalRoom01Ui && state.gameProgress.currentRoom === 1)) {
      drawDialogue(state);
    }
    if (state.gameProgress.currentRoom === 6 && state.door06.status === "confirming") {
      const selected = state.door06Memories.find(memory => memory.id === state.door06.selectedMemoryId);
      context.save();
      context.fillStyle = "rgba(4,7,11,.88)"; context.fillRect(0,0,960,640);
      context.fillStyle = C.ink; context.fillRect(190,234,580,172);
      context.strokeStyle = C.gold; context.strokeRect(190,234,580,172);
      context.textAlign = "center"; context.fillStyle = C.warmGold; context.font = "bold 22px ui-sans-serif,system-ui";
      context.fillText(`確認將「${selected?.displayLabel ?? "記憶片段"}」送回核心？`,480,285);
      context.fillStyle = C.pale; context.font = "18px ui-sans-serif,system-ui";
      context.fillText("Space — 確認送出",480,332);
      context.fillText("Esc — 返回比較",480,370); context.restore();
    }
  }

  function drawRoom05Art() {
    if (!room05Image.complete || !room05Image.naturalWidth) return;
    const art = ROOM05_ART;
    context.save();
    context.beginPath();
    context.rect(art.clip.x, art.clip.y, art.clip.width, art.clip.height);
    context.clip();
    context.drawImage(room05Image, art.offsetX, art.offsetY,
      art.sourceWidth * art.scale, art.sourceHeight * art.scale);
    context.restore();
  }

  // Light only: all equipment bodies and brass sockets belong to the master image.
  function door05Light(point, color, radius = 16, alpha = 0.8) {
    context.save();
    context.globalAlpha = alpha;
    context.strokeStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 15;
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(point.x, point.y, radius, radius * 0.57, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function drawRoom06Art() {
    const art=ROOM06_ART;
    context.save(); context.beginPath();
    context.rect(art.clip.x,art.clip.y,art.clip.width,art.clip.height); context.clip();
    if (room06Image.complete && room06Image.naturalWidth) {
      context.drawImage(room06Image,art.offsetX,art.offsetY,art.sourceWidth*art.scale,art.sourceHeight*art.scale);
    }
    context.restore();
  }

  // Additive light only: equipment, glass and brass remain in the fixed master.
  function room06Light(point, color, rx, ry, alpha=.75) {
    context.save(); context.globalAlpha=alpha; context.strokeStyle=color;
    context.shadowColor=color; context.shadowBlur=14; context.lineWidth=1.5;
    context.beginPath(); context.ellipse(point.x,point.y,rx,ry,0,0,Math.PI*2);
    context.stroke(); context.restore();
  }

  function drawRoom06Prism(point,color,size,alpha=1) {
    context.save();context.translate(point.x,point.y);context.globalAlpha=alpha;
    context.strokeStyle=color;context.fillStyle=color;context.shadowColor=color;context.shadowBlur=12;
    context.beginPath();context.moveTo(0,-size);context.lineTo(size*.43,0);
    context.lineTo(0,size);context.lineTo(-size*.43,0);context.closePath();
    context.globalAlpha=alpha*.3;context.fill();context.globalAlpha=alpha;context.lineWidth=1.5;context.stroke();
    context.beginPath();context.moveTo(0,-size);context.lineTo(0,size);context.stroke();context.restore();
  }

  function drawDoor05Portal(point, alpha) {
    context.save();
    const glow = context.createRadialGradient(point.x, point.y, 2, point.x, point.y, 42);
    glow.addColorStop(0, `rgba(170,247,247,${alpha})`);
    glow.addColorStop(0.4, `rgba(160,118,232,${alpha * 0.5})`);
    glow.addColorStop(0.75, `rgba(220,174,83,${alpha * 0.22})`);
    glow.addColorStop(1, "rgba(220,174,83,0)");
    context.fillStyle = glow;
    context.fillRect(point.x - 42, point.y - 42, 84, 84);
    context.restore();
  }

  function drawRoom06Portal(points, alpha) {
    context.save(); context.beginPath();
    points.forEach((p,i) => i ? context.lineTo(p.x,p.y) : context.moveTo(p.x,p.y));
    context.closePath(); context.clip();
    const xs=points.map(p=>p.x), ys=points.map(p=>p.y);
    const x=Math.min(...xs), y=Math.min(...ys), width=Math.max(...xs)-x, height=Math.max(...ys)-y;
    const glow=context.createLinearGradient(x,y,x+width,y+height);
    glow.addColorStop(0, `rgba(173,124,255,${alpha*.45})`);
    glow.addColorStop(1, `rgba(158,248,245,${alpha})`);
    context.fillStyle=glow; context.fillRect(x,y,width,height); context.restore();
  }

  function drawTargetSelection(state) {
    if(state.dialogue.active||state.tutorialOpen)return;
    for(const t of targets(state)){
      const selected=t.id===state.interaction?.selectedId,hover=t.id===state.interaction?.hoverId;
      if(!selected&&!hover)continue;
      context.save();context.strokeStyle=selected?C.gold:C.pale;context.lineWidth=selected?2.5:1.5;
      const w=t.hitWidth||50,h=t.hitHeight||60;
      context.strokeRect(t.x-w/2-4,t.y-(t.centered?h/2:h)-4,w+8,h+20);
      context.font='600 11px ui-sans-serif,system-ui';context.textAlign='center';context.fillStyle=C.warmGold;
      context.fillText(reachable(state,t)?t.name:'請靠近 · '+t.name,t.x,t.y+(t.centered?h/2:18)+15);
      context.restore();
    }
  }

  function drawBackground(cameraX) {
    context.fillStyle = C.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(154, 120, 200, 0.055)";
    context.lineWidth = 1;
    const offset = -(cameraX % 32);
    for (let x = offset; x < canvas.width; x += 32) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); }
    for (let y = 0; y < canvas.height; y += 32) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); }
  }

  let depthQueue = null;
  function atDepth(footY, draw) {
    if(depthQueue) depthQueue.push({footY,draw}); else draw();
  }

  function drawRooms(state) {
    if (state.gameProgress.currentRoom >= 5) return;
    const room03Active = state.gameProgress.currentRoom === 3;
    const room04Active = state.gameProgress.currentRoom === 4;
    context.fillStyle = C.floor; context.fillRect(rooms.subject.x, rooms.subject.y, rooms.subject.width, rooms.subject.height);
    context.fillStyle = "#0f0c16"; context.fillRect(rooms.corridor01.x, rooms.corridor01.y, rooms.corridor01.width, rooms.corridor01.height);
    context.fillStyle = C.floor2; context.fillRect(rooms.echo.x, rooms.echo.y, rooms.echo.width, rooms.echo.height);
    context.fillStyle = "#0b1017"; context.fillRect(rooms.corridor02.x, rooms.corridor02.y, rooms.corridor02.width, rooms.corridor02.height);
    if (!room03Active) {
      context.fillStyle = C.floor3; context.fillRect(rooms.room3.x, rooms.room3.y, rooms.room3.width, rooms.room3.height);
      context.fillStyle = "#0b1017"; context.fillRect(rooms.corridor03.x, rooms.corridor03.y, rooms.corridor03.width, rooms.corridor03.height);
    }
    if (!room04Active) {
      context.fillStyle = "#111019"; context.fillRect(rooms.room4.x, rooms.room4.y, rooms.room4.width, rooms.room4.height);
      context.fillStyle = "#0b1017"; context.fillRect(rooms.corridor04.x, rooms.corridor04.y, rooms.corridor04.width, rooms.corridor04.height);
    }
    context.fillStyle = "#111019"; context.fillRect(rooms.room5.x, rooms.room5.y, rooms.room5.width, rooms.room5.height);
    context.fillStyle = "#0b1017"; context.fillRect(rooms.corridor05.x, rooms.corridor05.y, rooms.corridor05.width, rooms.corridor05.height);
    context.fillStyle = "#100f1a"; context.fillRect(rooms.room6.x, rooms.room6.y, rooms.room6.width, rooms.room6.height);
    const corridorGlow = context.createLinearGradient(rooms.finalCorridor.x, 0, rooms.finalCorridor.x + rooms.finalCorridor.width, 0);
    corridorGlow.addColorStop(0, "#10141c");
    corridorGlow.addColorStop(1, "#2a2638");
    context.fillStyle = corridorGlow;
    context.fillRect(rooms.finalCorridor.x, rooms.finalCorridor.y, rooms.finalCorridor.width, rooms.finalCorridor.height);
    for (const wall of staticWalls) {
      if (room03Active && ROOM03_PROCEDURAL_WALL_IDS.includes(wall.id)) continue;
      if (room04Active && ROOM04_PROCEDURAL_WALL_IDS.includes(wall.id)) continue;
      context.fillStyle = C.wall; context.fillRect(wall.x, wall.y, wall.width, wall.height);
      context.strokeStyle = C.edge; context.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.width - 1, wall.height - 1);
    }
    label("第一室｜找到旋律的種子｜樂句的主題", 78, 88);
    label("Room 2｜聽見另一個聲部接話｜主題的回應", 838, 88);
    if (!room03Active) label("第三室｜讓聲音活起來｜組建模組合成器", 1638, 88);
    if (!room04Active) label("第四室｜讓四個聲部交織｜聲部的編織", 2598, 88);
    label("第五室｜讓九拍向前奔跑｜節奏驅動！", 3558, 88);
    label("第六室｜讓最初的旋律回來｜樂句的回歸", 4518, 88);
    label("出口", 5520, 328);
  }

  function drawRoom01Backdrop(state) {
    const room = rooms.subject;
    const background = room01Art.background;
    const isActive = state.gameProgress.currentRoom === 1;
    const backdropRect = isActive
      ? ROOM01_VIEWPORT
      : room;
    context.save();
    context.beginPath();
    context.rect(backdropRect.x, backdropRect.y, backdropRect.width, backdropRect.height);
    context.clip();
    if (imageReady(background)) {
      context.imageSmoothingEnabled = false;
      context.drawImage(
        background,
        backdropRect.x,
        backdropRect.y,
        backdropRect.width,
        backdropRect.height,
      );
    } else {
      const fallback = context.createRadialGradient(360, 290, 30, 360, 290, 420);
      fallback.addColorStop(0, "#17233b");
      fallback.addColorStop(0.64, "#081329");
      fallback.addColorStop(1, "#030813");
      context.fillStyle = fallback;
      context.fillRect(backdropRect.x, backdropRect.y, backdropRect.width, backdropRect.height);
    }

    const completion = state.gameProgress.flags.subjectIdentified
      ? reducedMotion ? 1 : state.door01.status === "opening" ? state.door01.openingProgress : 1
      : 0;
    drawRoom01InstrumentGlow(205, 170, 74, completion, 0);
    drawRoom01InstrumentGlow(360, 168, 62, completion, 0.18);
    drawRoom01InstrumentGlow(580, 170, 72, completion, 0.36);
    drawRoom01InstrumentGlow(360, 82, 260, completion, 0.54);

    const time = reducedMotion ? 0 : state.elapsedTime;
    const particleCount = completion > 0 ? 34 : 18;
    for (let index = 0; index < particleCount; index += 1) {
      const originX = backdropRect.x + 24 + (index * 137.3) % (backdropRect.width - 48);
      const originY = backdropRect.y + 30 + (index * 71.7) % (backdropRect.height - 70);
      const drift = reducedMotion ? 0 : (time * (4 + index % 3)) % 42;
      const x = originX + Math.sin(index * 2.4 + time * 0.35) * (reducedMotion ? 0 : 4);
      const travelHeight = backdropRect.height - 60;
      const y = backdropRect.y + 24 + ((originY - backdropRect.y - 24 - drift + travelHeight) % travelHeight);
      context.globalAlpha = completion > 0 ? 0.22 + completion * 0.36 : 0.1;
      context.fillStyle = index % 4 === 0 ? C.cyan : index % 3 === 0 ? C.violet : C.warmGold;
      const size = completion > 0 && index % 5 === 0 ? 3 : 1.5;
      context.fillRect(Math.round(x), Math.round(y), size, size);
    }
    context.restore();
    drawRoom01Corridor(state);
  }

  function drawRoom01Corridor(state) {
    const corridor = rooms.corridor01;
    if (state.gameProgress.currentRoom === 1 && imageReady(room01Art.background)) return;
    context.save();
    const passage = context.createLinearGradient(corridor.x, 0, corridor.x + corridor.width, 0);
    passage.addColorStop(0, "#08101d");
    passage.addColorStop(1, "#020611");
    context.fillStyle = passage;
    context.fillRect(corridor.x, corridor.y - 18, corridor.width, corridor.height + 36);
    context.fillStyle = "#111928";
    context.fillRect(corridor.x, corridor.y - 18, corridor.width, 18);
    context.fillRect(corridor.x, corridor.y + corridor.height, corridor.width, 18);
    context.strokeStyle = "rgba(228,173,69,.46)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(corridor.x, corridor.y - 0.5);
    context.lineTo(corridor.x + corridor.width, corridor.y - 0.5);
    context.moveTo(corridor.x, corridor.y + corridor.height + 0.5);
    context.lineTo(corridor.x + corridor.width, corridor.y + corridor.height + 0.5);
    context.stroke();
    context.restore();
  }

  function drawRoom01InstrumentGlow(x, y, radius, completion, delay) {
    const progress = clamp((completion - delay) / 0.28, 0, 1);
    if (progress <= 0) return;
    const glow = context.createRadialGradient(x, y, radius * 0.08, x, y, radius);
    glow.addColorStop(0, `rgba(255,220,132,${0.2 * progress})`);
    glow.addColorStop(0.48, `rgba(156,113,255,${0.09 * progress})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = glow;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function drawRoom03Backdrop(state) {
    if (state.gameProgress.currentRoom !== 3) return;
    const room = ROOM03_VIEWPORT;
    const background = room03Art.background;
    context.save();
    context.beginPath();
    context.rect(room.x, room.y, room.width, room.height);
    context.clip();
    if (imageReady(background)) {
      context.imageSmoothingEnabled = false;
      context.drawImage(
        background,
        0,
        0,
        ROOM03_ARTBOARD.width,
        ROOM03_ARTBOARD.height,
        room.x,
        room.y,
        room.width,
        room.height,
      );
    } else {
      const fallback = context.createRadialGradient(2030, 320, 40, 2030, 320, 480);
      fallback.addColorStop(0, "#152436");
      fallback.addColorStop(0.62, "#0a1624");
      fallback.addColorStop(1, "#050b13");
      context.fillStyle = fallback;
      context.fillRect(room.x, room.y, room.width, room.height);
    }

    const completed = state.gameProgress.flags.patchCompleted;
    const energy = completed ? 0.2 + state.audio.door03SuccessLevel * 0.18 : 0;
    if (energy > 0) {
      const illumination = context.createRadialGradient(2030, 330, 40, 2030, 330, 430);
      illumination.addColorStop(0, `rgba(255,212,119,${energy})`);
      illumination.addColorStop(0.48, `rgba(71,211,218,${energy * 0.45})`);
      illumination.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = illumination;
      context.fillRect(room.x, room.y, room.width, room.height);
    }

    const time = reducedMotion ? 0 : state.elapsedTime;
    const particleCount = completed ? 30 : 15;
    for (let index = 0; index < particleCount; index += 1) {
      const seedX = (index * 137.5) % (room.width - 68);
      const seedY = (index * 83.25) % (room.height - 140);
      const drift = reducedMotion ? 0 : (time * (6 + index % 4)) % 70;
      const x = room.x + 34 + seedX;
      const y = room.y + 52 + ((seedY - drift + room.height - 140) % (room.height - 140));
      const cyan = index % 3 === 0;
      context.globalAlpha = completed ? 0.42 : 0.16;
      context.fillStyle = cyan ? "#69dce7" : C.warmGold;
      const size = completed && index % 4 === 0 ? 3 : 1.5;
      context.fillRect(Math.round(x), Math.round(y), size, size);
    }
    context.globalAlpha = 1;
    context.restore();
  }

  function drawRoom04Backdrop(state) {
    if (state.gameProgress.currentRoom !== 4) return;
    const room = ROOM04_VIEWPORT;
    const background = room04Art.background;
    context.save();
    context.beginPath();
    context.rect(room.x, room.y, room.width, room.height);
    context.clip();
    if (imageReady(background)) {
      context.imageSmoothingEnabled = false;
      context.drawImage(
        background,
        0,
        0,
        ROOM04_ARTBOARD.width,
        ROOM04_ARTBOARD.height,
        room.x,
        room.y,
        room.width,
        room.height,
      );
    } else {
      context.fillStyle = "#07101a";
      context.fillRect(room.x, room.y, room.width, room.height);
    }

    if (["opening", "open"].includes(state.door04.status)) {
      const intensity = state.door04.status === "opening"
        ? state.door04.openingProgress
        : 1;
      const glow = context.createRadialGradient(
        ROOM04_DOORWAY.exit.focus.x,
        ROOM04_DOORWAY.exit.focus.y,
        24,
        ROOM04_DOORWAY.exit.focus.x,
        ROOM04_DOORWAY.exit.focus.y,
        220,
      );
      glow.addColorStop(0, `rgba(255,210,112,${0.08 * intensity})`);
      glow.addColorStop(0.48, `rgba(80,221,224,${0.055 * intensity})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(room.x, room.y, room.width, room.height);
    }
    context.restore();
  }

  function drawRoom02Backdrop(state) {
    if (state.gameProgress.currentRoom !== 2) return;
    const background = room02Art.background;
    const room = ROOM02_VIEWPORT;
    context.save();
    context.beginPath();
    context.rect(room.x, room.y, room.width, room.height);
    context.clip();
    if (imageReady(background)) {
      context.imageSmoothingEnabled = false;
      context.drawImage(
        background,
        0,
        0,
        ROOM02_ARTBOARD.width,
        ROOM02_ARTBOARD.height,
        room.x,
        room.y,
        room.width,
        room.height,
      );
    } else {
      context.fillStyle = "#07101a";
      context.fillRect(room.x, room.y, room.width, room.height);
    }
    context.restore();
  }

  function drawFutureRoomMask(state) {
    if (state.gameProgress.currentRoom >= 5) return;
    const boundaries = { 1: 840, 2: ROOM02_VIEWPORT.x + ROOM02_VIEWPORT.width, 3: 2560, 4: 3520, 5: 4480 };
    const boundary = boundaries[state.gameProgress.currentRoom];
    if (!boundary) return;
    context.fillStyle = "#05040a";
    context.fillRect(boundary, 0, WORLD.width - boundary, canvas.height);
  }

  function label(text, x, y) { context.fillStyle = "rgba(220,207,236,.25)"; context.font = "600 11px ui-sans-serif,system-ui"; context.fillText(text, x, y); }

  function drawDoor01Pedestals(state) {
    for (const fragment of state.fragments) {
      atDepth(fragment.y, () => {
      const inserted = state.door01.insertedFragmentId === fragment.id && ["opening", "open"].includes(state.door01.status);
      const empty = fragment.isHeld || inserted;
      const playing = fragment.isPlaying;
      const stateName = empty ? "empty" : playing ? "listening" : "idle";
      const lift = playing && !reducedMotion ? 6 : 0;
      const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(state.elapsedTime * 2.2) * 0.14;
      context.save();
      context.shadowBlur = playing ? 20 : 7 + pulse * 3;
      context.shadowColor = playing ? C.cyan : "rgba(161,102,235,.56)";
      drawRoom01StationSprite(
        stateName,
        fragment.x - ROOM01_STATION_SPRITE.anchorX,
        fragment.y - ROOM01_STATION_SPRITE.anchorY - lift,
        ROOM01_STATION_SPRITE.width,
        ROOM01_STATION_SPRITE.height,
      );
      context.restore();
      if (!empty && !playing) {
        context.save();
        context.globalAlpha = 0.08 + pulse * 0.09;
        context.fillStyle = C.violet;
        context.beginPath();
        context.arc(fragment.x, fragment.y + ROOM01_STATION_SPRITE.coreOffsetY, 13 + pulse * 2, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      if (playing) drawRoom01ListeningEffect(state, fragment, lift);
      context.textAlign = "center";
      context.fillStyle = playing ? C.pale : "#cdbfda";
      context.font = "700 10px ui-sans-serif,system-ui";
      context.shadowBlur = 5;
      context.shadowColor = "#02050b";
      context.fillText(fragment.displayLabel, fragment.x, fragment.y + ROOM01_STATION_SPRITE.labelOffsetY);
      context.shadowBlur = 0;
      if (empty) {
        context.fillStyle = "rgba(227,214,191,.62)";
        context.font = "600 8px ui-sans-serif,system-ui";
        context.fillText("星核艙空置", fragment.x, fragment.y + ROOM01_STATION_SPRITE.emptyLabelOffsetY);
      }
      context.textAlign = "start";
    
      });
    }
  }

  function drawRoom01StationSprite(stateName, x, y, width, height) {
    const atlas = room01Art.stations;
    const region = ROOM01_STATION_REGIONS[stateName];
    if (!region || !imageReady(atlas)) return false;
    context.imageSmoothingEnabled = false;
    context.drawImage(
      atlas,
      region.x,
      region.y,
      region.width,
      region.height,
      x,
      y,
      width,
      height,
    );
    return true;
  }

  function drawRoom01ThemeReplayDevice(state) {
    if (state.gameProgress.currentRoom !== 1 || !state.room01ThemeReplay) return;
    const device = state.room01ThemeReplay;
    atDepth(device.y, () => {
      const focusX = device.x + ROOM01_THEME_REPLAY_DEVICE.playbackFocusOffsetX;
      const focusY = device.y + ROOM01_THEME_REPLAY_DEVICE.playbackFocusOffsetY;
      if (device.playing) {
        const time = reducedMotion ? 0 : state.elapsedTime;
        const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(time * 3.1) * 0.18;
        context.save();
        context.globalAlpha = 0.18 + pulse * 0.14;
        context.strokeStyle = C.warmGold;
        context.shadowBlur = 14;
        context.shadowColor = C.gold;
        context.lineWidth = 1.4;
        for (let index = 0; index < 2; index += 1) {
          context.beginPath();
          context.ellipse(
            focusX,
            focusY,
            28 + index * 9 + pulse * 2,
            11 + index * 4 + pulse,
            reducedMotion ? -0.12 : time * 0.08,
            0,
            Math.PI * 2,
          );
          context.stroke();
        }
        context.restore();
      }

      if (!imageReady(room01Art.themeReplay)) return;
      context.save();
      context.imageSmoothingEnabled = false;
      context.shadowBlur = device.playing ? 11 : 5;
      context.shadowColor = device.playing ? "rgba(255,212,119,.72)" : "rgba(228,173,69,.3)";
      context.drawImage(
        room01Art.themeReplay,
        device.x - ROOM01_THEME_REPLAY_DEVICE.anchorX,
        device.y - ROOM01_THEME_REPLAY_DEVICE.anchorY,
        ROOM01_THEME_REPLAY_DEVICE.width,
        ROOM01_THEME_REPLAY_DEVICE.height,
      );
      context.restore();
    });
  }

  function drawRoom01ListeningEffect(state, fragment, lift) {
    const time = reducedMotion ? 0 : state.elapsedTime;
    const centerY = fragment.y + ROOM01_STATION_SPRITE.coreOffsetY - lift;
    context.save();
    context.lineWidth = 1.3;
    for (let index = 0; index < 2; index += 1) {
      const expansion = reducedMotion ? index * 8 : ((time * 18 + index * 17) % 34);
      context.globalAlpha = reducedMotion ? 0.34 - index * 0.1 : 0.42 * (1 - expansion / 40);
      context.strokeStyle = index === 0 ? C.violet : C.cyan;
      context.beginPath();
      context.ellipse(fragment.x, centerY, 24 + expansion, 12 + expansion * 0.48, 0, 0, Math.PI * 2);
      context.stroke();
    }
    for (let index = 0; index < 7; index += 1) {
      const angle = index * 2.31 + time * (reducedMotion ? 0 : 0.55);
      const radius = 34 + (index % 3) * 8;
      context.globalAlpha = 0.28 + (index % 2) * 0.18;
      context.fillStyle = index % 2 ? C.cyan : C.violet;
      context.fillRect(
        Math.round(fragment.x + Math.cos(angle) * radius),
        Math.round(centerY + Math.sin(angle) * radius * 0.56),
        index % 3 === 0 ? 3 : 2,
        index % 3 === 0 ? 3 : 2,
      );
    }
    context.restore();
  }

  function drawSubjectTerminal(state) {
    atDepth(state.subjectTerminal.y, () => {
    if (state.gameProgress.currentRoom !== 2) return;
    const terminal = state.subjectTerminal;
    const active = terminal.isPlaying;
    const level = terminal.visualLevel;
    const scale = ROOM02_SPRITE_LAYOUT.deviceScale;
    const stateName = active ? "playing" : "idle";
    const region = ROOM02_SUBJECT_REGIONS[stateName];
    const anchor = ROOM02_SPRITE_LAYOUT.subjectAnchors[stateName];
    const destination = {
      x: terminal.x - anchor.sourceX * scale,
      y: terminal.y - anchor.sourceY * scale,
      width: region.width * scale,
      height: region.height * scale,
    };

    if (active) drawRoom02DeviceAura(state.elapsedTime, terminal, level, C.violet, 34);
    drawRoom02AtlasSprite(room02Art.subjectTerminal, region, destination);
    labelBelow("主題終端", terminal.x, terminal.y + 35, active ? C.pale : C.muted);
  
    });
  }

  function drawEchoTowers(state) {
    if (state.gameProgress.currentRoom !== 2) return;
    for (const tower of state.echoTowers) {
      atDepth(tower.y, () => {
      const stateName = room02TowerState(state, tower);
      const region = ROOM02_TOWER_REGIONS[stateName];
      const scale = ROOM02_SPRITE_LAYOUT.deviceScale;
      const anchor = ROOM02_SPRITE_LAYOUT.towerAnchors[stateName];
      const destination = {
        x: tower.x - anchor.sourceX * scale,
        y: tower.y - anchor.sourceY * scale,
        width: region.width * scale,
        height: region.height * scale,
      };
      if (tower.isPlaying) {
        drawRoom02DeviceAura(state.elapsedTime + tower.x, tower, tower.visualLevel, C.cyan, 28);
      }
      drawRoom02AtlasSprite(room02Art.echoTower, region, destination);
      labelBelow(
        tower.displayLabel,
        tower.x,
        tower.y + 34,
        stateName === "idle" ? C.muted : C.pale,
      );
    
      });
    }
  }

  function room02TowerState(state, tower) {
    const selected = state.door02.selectedTowerId === tower.id;
    if (tower.isConnected || state.door02.connectedTowerId === tower.id) return "connected";
    if (selected && state.door02.status === "rejected") return "rejected";
    if (selected && state.door02.status === "checking") return "checking";
    if (tower.isPlaying) return "listening";
    return "idle";
  }

  function drawRoom02DeviceAura(time, target, level, color, radius) {
    const strength = Math.min(0.24, 0.08 + level * 0.16);
    context.save();
    context.translate(target.x, target.y - radius * 0.55);
    context.globalAlpha = strength;
    context.strokeStyle = color;
    context.lineWidth = 1;
    const expansion = reducedMotion ? 0 : Math.sin(time * 3.2) * 2;
    context.beginPath();
    context.ellipse(0, 0, radius + expansion, radius * 0.48 + expansion * 0.3, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function drawRoom02AtlasSprite(atlas, region, destination, alpha = 1) {
    if (!imageReady(atlas) || alpha <= 0) return false;
    context.save();
    context.globalAlpha = alpha;
    context.imageSmoothingEnabled = false;
    context.drawImage(
      atlas,
      region.x,
      region.y,
      region.width,
      region.height,
      destination.x,
      destination.y,
      destination.width,
      destination.height,
    );
    context.restore();
    return true;
  }

  function drawRoom02AtlasSpriteMirrored(atlas, region, destination, alpha = 1) {
    if (!region || !imageReady(atlas) || alpha <= 0) return false;
    context.save();
    context.globalAlpha = alpha;
    context.imageSmoothingEnabled = false;
    context.translate(destination.x + destination.width, destination.y);
    context.scale(-1, 1);
    context.drawImage(
      atlas,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      destination.width,
      destination.height,
    );
    context.restore();
    return true;
  }

  function drawAudioAura(time, level, color) {
    context.strokeStyle = color; context.globalAlpha = .35 + level * .5; context.lineWidth = 1.5;
    for (let ring = 0; ring < 2; ring += 1) { context.beginPath(); context.arc(0, 0, 32 + ring * 11 + level * 14 + Math.sin(time * 4 + ring) * 3, 0, Math.PI * 2); context.stroke(); }
    context.fillStyle = color;
    for (let i = 0; i < 6; i += 1) { const angle = time * .8 + i * Math.PI / 3; const radius = 35 + level * 22; context.globalAlpha = .25 + level * .55; context.beginPath(); context.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 1.5 + level * 1.5, 0, Math.PI * 2); context.fill(); }
    context.globalAlpha = 1;
  }

  function labelBelow(text, x, y, color) { context.textAlign = "center"; context.fillStyle = color; context.font = "600 11px ui-sans-serif,system-ui"; context.fillText(text, x, y); context.textAlign = "start"; }

  function drawDoor02Cables(state) {
    if (state.gameProgress.currentRoom !== 2) return;
    drawPath(
      ROOM02_TERMINAL_CABLE_ROUTE,
      "rgba(173,124,255,.2)",
      1.5,
      0,
    );
  }

  function drawDoor03Cables(state) {
    if (state.gameProgress.currentRoom !== 3) return;
    const successBoost = state.audio.door03SuccessLevel;
    if (state.door03.oscillatorDiscovered && !state.door03.completed) {
      for (const edge of VALID_DOOR03_EDGES) {
        if (
          state.door03.completedEdgeIds.includes(edge.id)
          || !isDoor03StaticGuideEdge(edge)
        ) continue;
        const from = findDoor03Port(state, edge.fromPortId);
        const to = findDoor03Port(state, edge.toPortId);
        if (!from || !to) continue;
        const signal = DOOR03_SIGNAL_TYPES[edge.signalType];
        drawPatchCable(from, to, signal?.color ?? C.muted, 1.35, true, 0.14, edge.id);
      }
    }
    for (const edge of state.door03.connectedEdges) {
      const from = findDoor03Port(state, edge.fromPortId);
      const to = findDoor03Port(state, edge.toPortId);
      if (!from || !to) continue;
      const color = DOOR03_SIGNAL_TYPES[edge.signalType]?.color ?? C.success;
      drawPatchCable(from, to, color, 5 + successBoost * 1.5, false, 0.9, edge.id);
      drawPatchCable(from, to, "#fff", 1.35, false, 0.92, edge.id);
      drawSignalDot(
        from,
        to,
        state.elapsedTime * 0.42 + edge.id.length * 0.07,
        C.pale,
        edge.id,
      );
    }

    const candidate = state.door03.candidateEdge;
    if (candidate) {
      const from = findDoor03Port(state, candidate.fromPortId);
      const to = findDoor03Port(state, candidate.toPortId);
      if (from && to) {
        const rejected = candidate.phase === "rejected";
        const alpha = rejected ? 0.25 + Math.abs(Math.sin(state.elapsedTime * 24)) * 0.65 : 0.85;
        const color = rejected
          ? C.reject
          : DOOR03_SIGNAL_TYPES[candidate.signalType]?.color ?? C.violet;
        drawPatchCable(from, to, color, 3, !rejected, alpha);
      }
    } else if (state.door03.selectedOutputPortId) {
      const from = findDoor03Port(state, state.door03.selectedOutputPortId);
      if (from) {
        drawPatchCable(
          from,
          { x: state.player.x, y: state.player.y },
          DOOR03_SIGNAL_TYPES[from.signalType]?.color ?? C.violet,
          2.5,
          true,
          0.72,
        );
      }
    }
    const vcaOut = findDoor03Port(state, "vca-audio-out");
    if (vcaOut) {
      drawPatchCable(
        vcaOut,
        state.door03Speaker,
        DOOR03_SIGNAL_TYPES.audio.color,
        state.door03.speakerActive ? 5 : 2.5,
        false,
        state.door03.speakerActive ? 0.95 : 0.35,
        "fixed-speaker-output",
      );
    }
  }

  function drawDoor03Modules(state) {
    if (state.gameProgress.currentRoom !== 3) return;
    const selectedPort = findDoor03Port(state, state.door03.selectedOutputPortId);
    const expectedEdge = VALID_DOOR03_EDGES[state.door03.currentStep - 1];
    const currentModuleIds = new Set(
      [expectedEdge?.fromPortId, expectedEdge?.toPortId]
        .map((portId) => findDoor03Port(state, portId)?.moduleId)
        .filter(Boolean),
    );
    for (const module of state.door03Modules) {
      atDepth(module.y + module.height / 2, () => {
      const inspecting = module.isInspecting || module.inspectionRemaining > 0;
      const nearby = Math.hypot(state.player.x - module.x, state.player.y - module.y) <= module.interactionRadius;
      const highlighted = inspecting || nearby || selectedPort?.moduleId === module.id || currentModuleIds.has(module.id);
      const active = module.isActive;
      const level = state.audio.activePreviewId === module.id ? state.audio.previewLevel : 0;
      context.save();
      context.translate(module.x, module.y);
      const completed = state.gameProgress.flags.patchCompleted;
      const glowColor = completed ? C.warmGold : active ? C.cyan : C.violet;
      context.shadowBlur = inspecting ? 22 + level * 16 : active || completed ? 12 : 0;
      context.shadowColor = glowColor;
      const atlasDrawn = drawRoom03AtlasSprite(
        module.id,
        ROOM03_DEVICE_GEOMETRY.sprites.module.width,
        ROOM03_DEVICE_GEOMETRY.sprites.module.height,
      );
      if (!atlasDrawn) {
        context.fillStyle = active ? "#203b37" : inspecting ? "#302341" : "#1b1823";
        context.strokeStyle = active ? C.success : inspecting ? "#c49bff" : "#574865";
        context.lineWidth = active || inspecting ? 2 : 1.2;
        roundedRect(context, -module.width / 2, -module.height / 2, module.width, module.height, 8);
        context.fill();
        context.stroke();
      }
      context.shadowBlur = 0;
      const label = highlighted ? module.displayName : module.shortName;
      context.font = `${highlighted ? "800 14px" : "700 12px"} ui-sans-serif,system-ui`;
      context.textAlign = "center";
      const labelWidth = context.measureText(label).width + 18;
      const labelY = ROOM03_OVERLAY_LAYOUT.moduleLabelOffsetY;
      context.fillStyle = highlighted ? "rgba(5,9,12,.92)" : "rgba(5,9,12,.76)";
      context.strokeStyle = highlighted ? glowColor : "rgba(193,169,120,.55)";
      context.lineWidth = highlighted ? 1.5 : 1;
      roundedRect(context, -labelWidth / 2, labelY - 16, labelWidth, 22, 4);
      context.fill();
      context.stroke();
      context.fillStyle = highlighted ? C.pale : "#d6bd87";
      context.shadowBlur = highlighted ? 10 : 5;
      context.shadowColor = highlighted ? glowColor : "#000";
      context.fillText(label, 0, labelY);
      context.restore();
    
      });
    }
  }

  function drawDoor03Ports(state) {
    if (state.gameProgress.currentRoom !== 3) return;
    for (const module of state.door03Modules) {
      atDepth(module.y + module.height / 2, () => {
      for (const port of [...module.inputPorts, ...module.outputPorts]) drawDoor03Port(state, port);
    
      });
    }
  }

  function drawRoom03AtlasSprite(regionId, destinationWidth, destinationHeight) {
    const atlas = room03Art.equipment;
    const region = ROOM03_ATLAS_REGIONS[regionId];
    if (!region || !imageReady(atlas)) return false;
    context.imageSmoothingEnabled = false;
    context.drawImage(
      atlas,
      region.x,
      region.y,
      region.width,
      region.height,
      -destinationWidth / 2,
      -destinationHeight / 2,
      destinationWidth,
      destinationHeight,
    );
    return true;
  }

  function drawModulePattern(module, state, level, lit) {
    const color = lit ? C.cyan : "#675677";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.globalAlpha = lit ? 0.55 + level * 0.4 : 0.35;
    if (module.id === "sequencer") {
      for (let index = 0; index < 9; index += 1) {
        const on = Math.floor(state.elapsedTime * 9) % 9 === index;
        context.globalAlpha = on && lit ? 1 : lit ? 0.45 : 0.2;
        context.beginPath();
        context.arc(-36 + index * 9, -12, on ? 3 : 2, 0, Math.PI * 2);
        context.fill();
      }
    } else if (module.id === "oscillator-vco") {
      context.beginPath();
      context.moveTo(-36, -7);
      for (let x = -36; x <= 36; x += 8) context.lineTo(x, -7 + Math.sin((x + 36) * 0.18) * 8);
      context.stroke();
    } else if (module.id === "filter-vcf") {
      for (let index = 0; index < 7; index += 1) {
        const height = 8 + (Math.sin(state.elapsedTime * 5 + index) * 0.5 + 0.5) * (12 + level * 14);
        context.fillRect(-30 + index * 10, 2 - height / 2, 4, height);
      }
    } else if (module.id === "effect") {
      for (let index = 0; index < 8; index += 1) {
        const x = -34 + ((index * 23 + Math.floor(state.elapsedTime * 7) * 11) % 68);
        const y = -18 + ((index * 17 + Math.floor(state.elapsedTime * 5) * 7) % 34);
        context.beginPath();
        context.arc(x, y, 1.5 + (index % 2), 0, Math.PI * 2);
        context.fill();
      }
    } else if (module.id === "envelope-adsr") {
      context.beginPath();
      context.arc(0, -6, 23, 0.25, Math.PI * 1.75);
      context.stroke();
      context.beginPath();
      context.moveTo(20, -17);
      context.lineTo(27, -9);
      context.lineTo(17, -7);
      context.stroke();
    } else if (module.id === "amp-vca") {
      context.strokeRect(-28, -22, 56, 36);
      context.fillRect(-18, -12, 36 * (module.isActive ? 1 : 0.25), 4);
      context.fillRect(-18, -2, 36 * (state.door03.connectedEdges.length / 6), 4);
      context.fillRect(-18, 8, 36 * (state.door03.completed ? 1 : 0.15), 4);
    }
    context.globalAlpha = 1;
  }

  function drawDoor03Port(state, port) {
    const selected = state.door03.selectedOutputPortId === port.id;
    const connected = state.door03.connectedEdges.some(
      (edge) => edge.fromPortId === port.id || edge.toPortId === port.id,
    );
    const connectable = port.type === "input"
      && Boolean(state.door03.selectedOutputPortId)
      && Math.hypot(state.player.x - port.x, state.player.y - port.y) <= port.interactionRadius;
    const pulse = 0.5 + Math.sin(state.elapsedTime * 7) * 0.25;
    const expectedEdge = VALID_DOOR03_EDGES[state.door03.currentStep - 1];
    const currentTarget = Boolean(expectedEdge)
      && (expectedEdge.fromPortId === port.id || expectedEdge.toPortId === port.id)
      && !connected;
    const signalColor = DOOR03_SIGNAL_TYPES[port.signalType]?.color ?? C.violet;
    context.save();
    context.translate(port.x, port.y);
    context.shadowBlur = selected ? 20 : currentTarget ? 12 + pulse * 10 : connected || connectable ? 13 : 4;
    context.shadowColor = selected ? signalColor : connected ? C.pale : signalColor;
    context.lineWidth = 2;
    context.strokeStyle = selected
      ? signalColor
      : connected || connectable || currentTarget ? signalColor : "#65556f";
    context.fillStyle = connected ? signalColor : "#17141d";
    if (port.type === "input") {
      context.beginPath();
      context.arc(0, 0, selected ? 9 : 8, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = connected || connectable ? C.pale : "#756582";
      context.beginPath();
      context.arc(0, 0, 2.5, 0, Math.PI * 2);
      context.fill();
    } else {
      context.rotate(Math.PI / 4);
      context.fillRect(-7, -7, 14, 14);
      context.strokeRect(-7, -7, 14, 14);
    }
    context.restore();
    if (currentTarget) {
      context.save();
      context.translate(port.x, port.y);
      context.strokeStyle = signalColor;
      context.lineWidth = 1.5;
      context.globalAlpha = 0.62 + pulse * 0.25;
      context.beginPath();
      context.arc(0, 0, 13, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }
    context.fillStyle = connected ? C.pale : signalColor;
    context.font = `${currentTarget ? "800" : "700"} 10px ui-sans-serif,system-ui`;
    context.textAlign = "center";
    context.fillText(`${port.type === "output" ? "OUT" : "IN"} · ${port.label}`, port.x, port.y + ROOM03_OVERLAY_LAYOUT.portLabelOffsetY);
    context.textAlign = "start";
  }

  function drawDoor03PatchMonitor(state) {
    if (state.gameProgress.currentRoom !== 3) return;
    atDepth(state.door03PatchMonitor.y + state.door03PatchMonitor.height / 2, () => {
    const monitor = state.door03PatchMonitor;
    const hasStage = Boolean(state.door03.currentStageAudioKey);
    const active = state.audio.activePreviewKind === "door03-stage";
    context.save();
    context.translate(monitor.x, monitor.y);
    context.shadowBlur = active ? 14 : hasStage ? 7 : 0;
    context.shadowColor = active ? C.cyan : "rgba(228,173,69,.42)";
    const monitorDrawn = drawRoom03AtlasSprite(
      "monitor",
      ROOM03_DEVICE_GEOMETRY.sprites.monitor.width,
      ROOM03_DEVICE_GEOMETRY.sprites.monitor.height,
    );
    if (!monitorDrawn) {
      context.fillStyle = hasStage ? "#172a31" : "#1c1a21";
      roundedRect(context, -monitor.width / 2, -monitor.height / 2, monitor.width, monitor.height, 10);
      context.fill();
    }
    context.restore();

    
    });
    atDepth(state.door03Speaker.y + 48, () => {
    const speaker = state.door03Speaker;
    context.save();
    const speakerShake = state.door03.speakerActive && !reducedMotion
      ? Math.sin(state.elapsedTime * 36) * (1.2 + state.audio.door03SuccessLevel)
      : 0;
    context.translate(speaker.x + speakerShake, speaker.y);
    context.shadowBlur = state.door03.speakerActive ? 18 : 0;
    context.shadowColor = C.success;
    const speakerDrawn = drawRoom03AtlasSprite(
      "speaker",
      ROOM03_DEVICE_GEOMETRY.sprites.speaker.width,
      ROOM03_DEVICE_GEOMETRY.sprites.speaker.height,
    );
    if (!speakerDrawn) {
      context.fillStyle = state.door03.speakerActive ? "#294b44" : "#211d27";
      roundedRect(context, -32, -48, 64, 96, 8);
      context.fill();
    }
    context.restore();
    labelBelow(
      "揚聲器／輸出",
      speaker.x,
      speaker.y + ROOM03_OVERLAY_LAYOUT.speakerLabelOffsetY,
      state.door03.speakerActive ? C.pale : C.muted,
    );

  
    });
  }

  function drawDoor03Legend(state) {
    if (state.gameProgress.currentRoom !== 3) return;
    const x = ROOM03_OVERLAY_LAYOUT.legend.x;
    const y = ROOM03_OVERLAY_LAYOUT.legend.y;
    context.save();
    context.font = "600 8px ui-sans-serif,system-ui";
    context.textAlign = "start";
    let offset = 0;
    for (const signal of Object.values(DOOR03_SIGNAL_TYPES)) {
      context.fillStyle = signal.color;
      context.fillRect(x + offset, y - 8, 9, 9);
      context.fillText(signal.label, x + offset + 14, y);
      offset += 188;
    }
    context.restore();
  }

  function drawPatchCable(from, to, color, width, dashed, alpha, routeId = null) {
    const points = door03CablePoints(from, to, routeId);
    context.save();
    context.globalAlpha = alpha;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.shadowBlur = 11;
    context.shadowColor = color;
    if (dashed) {
      context.setLineDash([9, 7]);
      context.lineDashOffset = -statefulDashOffset();
    }
    context.beginPath();
    traceRoundedCable(points);
    context.stroke();
    context.restore();
  }

  function drawSignalDot(from, to, phase, color, routeId = null) {
    const progress = ((phase % 1) + 1) % 1;
    const point = pointAlongCable(door03CablePoints(from, to, routeId), progress);
    context.save();
    context.fillStyle = color;
    context.shadowBlur = 9;
    context.shadowColor = color;
    context.beginPath();
    context.arc(point.x, point.y, 3, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function door03CablePoints(from, to, routeId) {
    const waypoints = ROOM03_CABLE_WAYPOINTS[routeId] ?? [];
    return [
      { x: from.x, y: from.y },
      ...waypoints,
      { x: to.x, y: to.y },
    ];
  }

  function traceRoundedCable(points) {
    const cornerRadius = 17;
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length - 1; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const next = points[index + 1];
      const incoming = Math.hypot(current.x - previous.x, current.y - previous.y);
      const outgoing = Math.hypot(next.x - current.x, next.y - current.y);
      const radius = Math.min(cornerRadius, incoming * 0.35, outgoing * 0.35);
      const enter = interpolatePoint(current, previous, incoming ? radius / incoming : 0);
      const leave = interpolatePoint(current, next, outgoing ? radius / outgoing : 0);
      context.lineTo(enter.x, enter.y);
      context.quadraticCurveTo(current.x, current.y, leave.x, leave.y);
    }
    const last = points[points.length - 1];
    context.lineTo(last.x, last.y);
  }

  function pointAlongCable(points, progress) {
    const lengths = [];
    let total = 0;
    for (let index = 1; index < points.length; index += 1) {
      const length = Math.hypot(
        points[index].x - points[index - 1].x,
        points[index].y - points[index - 1].y,
      );
      lengths.push(length);
      total += length;
    }
    let remaining = total * progress;
    for (let index = 0; index < lengths.length; index += 1) {
      if (remaining <= lengths[index] || index === lengths.length - 1) {
        const ratio = lengths[index] ? Math.min(1, remaining / lengths[index]) : 0;
        return interpolatePoint(points[index], points[index + 1], ratio);
      }
      remaining -= lengths[index];
    }
    return points[points.length - 1];
  }

  function interpolatePoint(from, to, progress) {
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  }

  function findDoor03Port(state, portId) {
    for (const module of state.door03Modules) {
      const port = [...module.inputPorts, ...module.outputPorts].find((item) => item.id === portId);
      if (port) return port;
    }
    return null;
  }

  function statefulDashOffset() {
    return (performance.now() / 45) % 32;
  }

  function drawPath(points, color, width, dash) {
    context.save(); context.strokeStyle = color; context.lineWidth = width; context.shadowBlur = width > 2 ? 12 : 0; context.shadowColor = color;
    if (dash) { context.setLineDash([dash, dash]); context.lineDashOffset = -performance.now() / 50; }
    context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); context.stroke(); context.restore();
  }

  function drawDoor04Timeline(state) {
    if (state.gameProgress.currentRoom !== 4) return;
    const loom=ROOM04_SPRITE_LAYOUT.voiceLoom;
    const destination={x:loom.anchor.x-loom.width/2,y:loom.anchor.y-loom.height,width:loom.width,height:loom.height};
    atDepth(loom.anchor.y - 0.02,()=>{
      drawRoom04Image(room04Art.voiceLoom,destination);
      for(const slot of state.door04Slots)drawDoor04Slot(state,slot);
    });
    // Use the same anchor for both layers. The front lip can occlude feet
    // behind it, while a character on the front apron remains fully visible.
    atDepth(loom.anchor.y,()=>drawRoom04Image(room04Art.deskFront,destination));
    atDepth(Infinity,()=>{
      for(const slot of state.door04Slots)labelBelow(slot.assignedVoiceId ? state.door04Capsules.find(v=>v.id===slot.assignedVoiceId)?.displayLabel : "空位",slot.x,loom.anchor.y+14,C.pale);
    });
  }

  function drawDoor04Slot(state, slot) {
    const assignedVoice = state.door04Capsules.find((item) => item.id === slot.assignedVoiceId);
    const voice = assignedVoice?.currentLocation === "slot" ? assignedVoice : null;
    const active = slot.index === room04ActiveSlot(state);
    if (active) {
      context.save();context.strokeStyle=C.cyan;context.lineWidth=3;
      context.beginPath();context.ellipse(slot.x,slot.socketY ?? slot.y,30,13,0,0,Math.PI*2);context.stroke();context.restore();
    }

    if (voice) {
      const sprite = ROOM04_SPRITE_LAYOUT.capsuleSlotted;
      drawRoom04CapsuleSprite(
        "carried",
        slot.x - sprite.anchorX,
        (slot.socketY ?? slot.y) - sprite.anchorY,
        sprite.width,
        sprite.height,
      );
    }
  }

  function drawDoor04Capsules(state) {
    if (state.gameProgress.currentRoom !== 4) return;
    const sprite = ROOM04_STATION_SPRITE;
    for (const voice of state.door04Capsules) {
      atDepth(voice.originalPosition.y - 0.01, () => {
        const p = voice.originalPosition;
        drawRoom04Image(room04Art.station, {x:p.x-sprite.anchorX, y:p.y-sprite.anchorY, width:sprite.width, height:sprite.height});
        if (voice.currentLocation === "pedestal") {
          drawRoom04CapsuleSprite("placed",p.x-sprite.capsuleWidth/2,p.y-sprite.socketLift-sprite.capsuleHeight,sprite.capsuleWidth,sprite.capsuleHeight);
        }
      });
      const p=voice.originalPosition;
      atDepth(p.y,()=>drawRoom04Image(room04Art.stationFront,{x:p.x-sprite.anchorX,y:p.y-sprite.anchorY,width:sprite.width,height:sprite.height}));
      atDepth(Infinity,()=>{
        drawRoom04Fx(ROOM04_DEVICE_STATES[room04DeviceState(state,"station",voice)],p.x+44,p.y-26,19);
        labelBelow(voice.currentLocation === "pedestal" ? voice.displayLabel : "空聲部架",p.x>ROOM04_VIEWPORT.x+ROOM04_VIEWPORT.width/2 && p.y<350 ? p.x+76 : p.x,p.y+16,voice.isPlaying?C.cyan:C.muted);
      });
    }
  }

  function drawDoor04Consoles(state) {
    if (state.gameProgress.currentRoom !== 4) return;
    const reference=state.door04ReferenceConsole;
    const referenceSprite=ROOM04_SPRITE_LAYOUT.referenceConsole;
    const test=state.door04TestConsole;
    const testSprite=ROOM04_SPRITE_LAYOUT.testConsole;
    for(const [image,sprite] of [[room04Art.referenceConsole,referenceSprite],[room04Art.testConsole,testSprite]]){
      atDepth(sprite.anchor.y,()=>drawRoom04Image(image,{x:sprite.anchor.x-sprite.width/2,y:sprite.anchor.y-sprite.height,width:sprite.width,height:sprite.height}));
    }
    // One state atlas, rendered after the actors; no second pulsing FX layer.
    atDepth(Infinity,()=>{
      const referenceActive=state.audio.door04ReferencePlaying;
      const referenceCompleted=state.door04.referenceCompleted;
      const testActive=state.door04.status === "testing";
      const testEntryCount=state.door04.stage === "reference" ? 0 : state.door04.testEntryCount;
      drawRoom04Fx(ROOM04_DEVICE_STATES[room04DeviceState(state,"reference")],reference.x,referenceSprite.anchor.y-31,25);
      drawRoom04Fx(ROOM04_DEVICE_STATES[room04DeviceState(state,"test")],test.x,testSprite.anchor.y-48,27);
      labelBelow(referenceActive ? "參考混音 · 播放中" : referenceCompleted ? "參考混音 · 已完成" : "參考混音",reference.x,referenceSprite.anchor.y+14,referenceActive||referenceCompleted?C.pale:C.muted);
      labelBelow(testActive ? `正在播放第 ${state.door04.activeEntryCount || 1}／${testEntryCount} 段` : state.door04.status === "rejected" ? "排列錯誤 · 請調整" : state.door04.completed ? "編排完成" : door04TestConsoleLabel(testEntryCount),test.x,testSprite.anchor.y+2,state.door04.completed?C.success:testActive?C.pale:C.muted);
    });
  }

  function drawRoom04Image(image, destination, alpha = 1) {
    if (!imageReady(image) || alpha <= 0) return false;
    context.save();
    context.globalAlpha = alpha;
    context.imageSmoothingEnabled = false;
    const key = Object.keys(ROOM04_IMAGE_REGIONS).find(key => room04Art[key] === image);
    const region = ROOM04_IMAGE_REGIONS[key] ?? [0,0,image.naturalWidth,image.naturalHeight];
    context.drawImage(
      image,
      ...region,
      destination.x,
      destination.y,
      destination.width,
      destination.height,
    );
    context.restore();
    return true;
  }

  function drawRoom04Fx(index, x, y, width = 30) {
    if (!imageReady(room04Art.fx)) return;
    context.save();
    const f=ROOM04_STATE_FRAMES[index];
    context.drawImage(room04Art.fx,f.x,f.y,f.width,f.height,x-width/2,y-width/2,width,width);
    context.restore();
  }

  function drawRoom04CapsuleSprite(stateName, x, y, width, height, alpha = 1) {
    const region = ROOM04_SPRITE_LAYOUT.capsuleAtlas[stateName];
    if (!region || !imageReady(room04Art.capsules) || alpha <= 0) return false;
    context.save();
    context.globalAlpha = alpha;
    context.imageSmoothingEnabled = false;
    context.drawImage(
      room04Art.capsules,
      region.x,
      region.y,
      region.width,
      region.height,
      x,
      y,
      width,
      height,
    );
    context.restore();
    return true;
  }

  function drawDoor05Terminals(state) {
    if (state.gameProgress.currentRoom !== 5) return;
    for (const terminal of state.door05Terminals) {
      const unlocked = state.door05.unlockedPhaseIds.includes(terminal.phaseId);
      const completed = state.door05.completedPhaseIds.includes(terminal.phaseId);
      const active = state.audio.door05ReferencePlayingPhaseId === terminal.phaseId;
      const name = { foundation: "基礎", drive: "推進", sprint: "衝刺" }[terminal.phaseId];
      if (active || completed) door05Light(terminal, completed ? C.success : C.cyan,
        13 + (active ? state.audio.door05ReferenceLevel * 4 : 0));
      labelBelow(`${name}節奏終端`, terminal.x, terminal.y + 39, active || completed ? C.pale : C.muted);
      if (!unlocked) labelBelow("未解鎖", terminal.x, terminal.y + 52, C.muted);
    }
  }

  function drawDoor05Ring(state) {
    if (state.gameProgress.currentRoom !== 5) return;
    const door = state.door05;
    const rotating = ["completion-spinning", "completion-hold"].includes(door.status);
    const launching = ["launching", "opening", "open"].includes(door.status);
    const energized = rotating || launching;
    for (const node of state.door05Nodes) {
      const referencePulse = Boolean(door.referencePlayingPhaseId) && door.referenceStep === node.stepNumber;
      const testPulse = door.status === "testing" && door.testStep === node.stepNumber;
      const launchPulse = launching
        && (Math.floor(Math.max(0, door.launchElapsed - 1.2) / 0.11) % 9) + 1 === node.stepNumber;
      const active = referencePulse || testPulse || launchPulse;
      const rejected = node.visualState === "rejected" && node.isSelected;
      // The existing wheelAngle rotates nine energy points, never the master,
      // socket numbers or interaction centres. No independent animation clock.
      const energyPoint = rotating ? room05RingPoint(node.angle + door.wheelAngle) : node;
      const color = rejected ? "#d99563" : active ? "#e5ffff" : energized ? C.cyan : node.isConfirmed ? C.success : C.violet;
      if (node.isSelected && active && !energized && !rejected) {
        door05Light(node, C.violet, node.radius + 7, 0.9);
      }
      if (active || rejected || node.isConfirmed || node.isSelected || energized) {
        const scale = active ? (node.isSelected && testPulse ? 1.32 : 1.18) : 1;
        door05Light(energyPoint, color, node.radius * scale, rejected ? 0.6 : 0.9);
      }
      context.save();
      context.fillStyle = C.pale;
      context.shadowColor = "#000";
      context.shadowBlur = 4;
      context.font = "700 11px ui-sans-serif,system-ui";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(node.stepNumber), node.x, node.y);
      if (node.isConfirmed) {
        context.fillStyle = C.success;
        context.font = "800 8px ui-sans-serif,system-ui";
        context.fillText("◆", node.x, node.y - 17);
      }
      context.restore();
    }
    labelBelow("節奏環 · 9/8", ROOM05_RING_CENTER.x, ROOM05_RING_CENTER.y + 24, C.muted);
  }

  function drawDoor05Consoles(state) {
    if (state.gameProgress.currentRoom !== 5) return;
    const test = state.door05TestConsole;
    const testActive = state.door05.status === "testing";
    if (testActive) door05Light(test, C.cyan, 19);
    context.save();
    context.translate(test.x, test.y + 24);
    for (let index = 0; index < 9; index += 1) {
      context.fillStyle = testActive && state.door05.testStep === index + 1 ? "#e5ffff" : "#50717a";
      context.fillRect(-31 + index * 7, 0, 4, 5);
    }
    context.restore();
    labelBelow("節奏測試", test.x, test.y + 46, testActive ? C.pale : C.muted);
    for (const relay of state.door05Relays) {
      const completed = state.door05.completedPhaseIds.includes(relay.phaseId);
      if (completed) door05Light(relay, C.success, 13);
      labelBelow({ foundation: "基礎", drive: "推進", sprint: "衝刺" }[relay.phaseId],
        relay.x, relay.y + 30, completed ? C.success : C.muted);
    }
    const final = state.door05FinalConsole;
    const ready = state.door05.finalLaunchReady;
    const launching = ["completion-spinning", "completion-hold", "launching", "opening", "open"].includes(state.door05.status);
    if (ready || launching) door05Light(final, launching ? C.cyan : C.violet,
      24 + (launching ? state.audio.door05SuccessLevel * 5 : 0));
    labelBelow("最終節奏驅動", final.x, final.y + 54, ready || launching ? C.pale : C.muted);
  }

  function drawDoor05Energy(state) {
    if (state.gameProgress.currentRoom !== 5) return;
    if (!["launching", "opening", "open"].includes(state.door05.status)) return;
    const progress = Math.min(1, state.door05.launchElapsed / 2.4);
    state.door05Relays.forEach((relay, index) => {
      if (progress < (index + 1) * 0.12) return;
      drawPath([ROOM05_RING_CENTER, relay, state.door05FinalConsole],
        index % 2 ? C.violet : C.cyan, 1.5, 0);
    });
    if (progress > 0.62) drawPath([state.door05FinalConsole, ROOM05_LANDMARKS.right], C.cyan, 2, 0);
  }

  function drawDoor06Energy(state) {
    if (state.gameProgress.currentRoom !== 6) return;
    for (const relay of state.door06Relays) {
      if (!relay.activated) continue;
      drawPath(relay.cablePath,C.cyan,1.3+(relay.playing ? relay.energyLevel : 0),0);
    }
  }

  function drawDoor06Relays(state) {
    if (state.gameProgress.currentRoom !== 6) return;
    for (const [index,relay] of state.door06Relays.entries()) {
      const next=state.door06.stage === "relays" && index===state.door06.activeRelayIndex;
      labelBelow(relay.displayName.toUpperCase(),relay.x,relay.y+49,relay.activated ? C.pale : C.muted);
      if (next) labelBelow("下一個",relay.x,relay.y-20,C.violet);
    }
  }

  function drawDoor06Core(state) {
    if (state.gameProgress.currentRoom !== 6) return;
    const door=state.door06, core=state.door06Core;
    const ready=door.coreUnlocked || door.completed;
    const progress=door.completed ? Math.min(1,door.reconstructElapsed/door.reconstructDuration) : 0;
    const settled=door.completed && (progress>=1 || ["opening","open"].includes(door.status));
    if (ready || door.activatedRelayCount) {
      // All effects stay inside the core housing; external equipment remains unlit.
      const p=reducedMotion && door.completed ? 1 : progress;
      const ease=1-Math.pow(1-p,3);
      const angle=door.completed ? Math.PI*6*ease : 0;
      context.save();context.translate(core.x,core.y);
      context.beginPath();context.ellipse(0,0,102,88,0,0,Math.PI*2);context.clip();
      const glow=context.createRadialGradient(0,0,2,0,0,82);
      glow.addColorStop(0,door.completed?'rgba(255,244,194,.75)':'rgba(112,224,232,.22)');
      glow.addColorStop(.3,door.completed?'rgba(238,185,72,.28)':'rgba(112,224,232,.08)');
      glow.addColorStop(1,'rgba(238,185,72,0)');
      context.fillStyle=glow;context.fillRect(-102,-88,204,176);
      context.lineWidth=door.completed?2.2:1.5;
      for (let ring=0;ring<3;ring++) {
        context.strokeStyle=door.completed?(ring===1?'#fff1bd':'#e4ad45'):C.cyan;
        context.shadowColor=context.strokeStyle;context.shadowBlur=door.completed?14:7;
        context.globalAlpha=door.completed ? .9 :.35+door.activatedRelayCount*.09;
        context.beginPath();
        const start=angle*(ring%2?-1:1)+ring;
        context.ellipse(0,0,80-ring*9,48-ring*7,ring*Math.PI/3,
          start,start+Math.PI*(door.completed?2:.65+door.activatedRelayCount*.2));
        context.stroke();
      }
      if (door.completed) {
        // A finite inward burst joins the rings into one warm, stable finished core.
        if (!reducedMotion && !settled) {
          for(let i=0;i<18;i++) {
            const a=i*Math.PI*2/18+angle*.35;
            const radius=76*(1-ease)+10;
            const x=Math.cos(a)*radius,y=Math.sin(a)*radius*.72;
            context.globalAlpha=(1-p)*.85;context.fillStyle='#fff1bd';
            context.fillRect(x-1.5,y-1.5,3,3);
          }
        }
        context.globalAlpha=.9;context.strokeStyle='#fff7d8';context.lineWidth=2;
        const ray=settled||reducedMotion?22:14+24*Math.sin(Math.PI*p);
        context.beginPath();context.moveTo(-ray,0);context.lineTo(ray,0);
        context.moveTo(0,-ray);context.lineTo(0,ray);context.stroke();
      }
      context.restore();
      if (door.completed) drawRoom06Prism(core,'#ffe5a0',settled?19:15+4*progress,.95);
    }
    const text=door.completed?(settled?'FUGATA 核心 · 重構完成':'FUGATA 核心 · 重構中')
      :ready?'FUGATA 核心 · 就緒':`FUGATA 核心 · ${door.activatedRelayCount}／5`;
    labelBelow(text,core.x,core.y+139,door.completed?C.gold:ready?C.pale:C.muted);
  }

  function drawDoor06Memories(state) {
    if (state.gameProgress.currentRoom !== 6) return;
    for (const memory of state.door06Memories) {
      // Never consult answer identity for appearance; completed memories are anonymous in the core.
      const visible=state.door06.memoriesUnlocked && !state.door06.completed && memory.visualState!=="dormant";
      const color=memory.visualState==="checking" ? C.pale : memory.visualState==="rejected" ? "#d99563" : C.violet;
      if (visible) drawRoom06Prism(memory,color,13,memory.isPlaying ? .85+Math.sin(state.elapsedTime*4)*.1 : .75);
      // Stagger with the physical tubes; the full interaction hint stays in the existing UI.
      labelBelow(memory.displayLabel,memory.x,memory.y+35,visible ? color : C.muted);
    }
  }

  function drawDoor06FinalReference(state) {
    if (state.gameProgress.currentRoom !== 6) return;
    const unit=state.door06FinalReferenceConsole, door=state.door06;
    labelBelow("最終參考",unit.x,unit.y+66,door.finalReferenceUnlocked ? C.pale : C.muted);
  }

  function drawDoor01(state) {
    if (state.gameProgress.currentRoom !== 1) return;
    const door = state.door01;
    const nearWithFragment = Boolean(heldFragment(state))
      && state.player.x >= door.interactionZone.x
      && state.player.x <= door.interactionZone.x + door.interactionZone.width
      && state.player.y >= door.interactionZone.y
      && state.player.y <= door.interactionZone.y + door.interactionZone.height;
    const gateState = ["opening", "open"].includes(door.status)
      ? "open"
      : door.status === "rejected" || door.rejectionFlashRemaining > 0
        ? "rejected"
        : door.status === "checking" || nearWithFragment ? "ready" : "locked";

    if (door.status === "opening" && imageReady(room01Art.gate) && !reducedMotion) {
      drawRoom01GateSprite("locked", 1 - door.openingProgress);
      drawRoom01GateSprite("open", door.openingProgress);
    } else if (!drawRoom01GateSprite(gateState)) {
      drawSlidingDoor(door, ROOM01_DOORWAY.collider.x, C.violet);
    }

    if (nearWithFragment && gateState === "ready") {
      const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(state.elapsedTime * 3.2) * 0.18;
      context.save();
      context.globalAlpha = 0.18 + pulse * 0.16;
      context.strokeStyle = C.warmGold;
      context.shadowBlur = 16;
      context.shadowColor = C.violet;
      context.lineWidth = 1.6;
      context.beginPath();
      context.arc(ROOM01_DOORWAY.focus.x, ROOM01_DOORWAY.focus.y, 25 + pulse * 3, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    if (door.rejectionFlashRemaining > 0) drawRoom01RejectionEffect(state);
  }

  function drawRoom01GateSprite(stateName, alpha = 1) {
    const atlas = room01Art.gate;
    const region = ROOM01_GATE_REGIONS[stateName];
    if (!region || !imageReady(atlas) || alpha <= 0) return false;
    const { x, y, width, height } = ROOM01_DOORWAY.gateSprite;
    context.save();
    context.globalAlpha = alpha;
    context.imageSmoothingEnabled = false;
    context.drawImage(
      atlas,
      region.x,
      region.y,
      region.width,
      region.height,
      x,
      y,
      width,
      height,
    );
    context.restore();
    return true;
  }

  function drawRoom01RejectionEffect(state) {
    const remaining = clamp(state.door01.rejectionFlashRemaining, 0, 1);
    const time = reducedMotion ? 0 : state.elapsedTime;
    context.save();
    context.globalAlpha = 0.3 + remaining * 0.45;
    context.strokeStyle = "#e76838";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(ROOM01_DOORWAY.focus.x, ROOM01_DOORWAY.focus.y, 30 + (reducedMotion ? 8 : (1 - remaining) * 22), 0, Math.PI * 2);
    context.stroke();
    for (let index = 0; index < 8; index += 1) {
      const angle = index * Math.PI / 4 + time * (reducedMotion ? 0 : 0.25);
      const distance = 34 + (reducedMotion ? 10 : (1 - remaining) * (20 + index % 3 * 4));
      context.fillStyle = index % 2 ? "#ffb05f" : "#d94c35";
      const size = index % 3 === 0 ? 4 : 2;
      context.fillRect(
        Math.round(ROOM01_DOORWAY.focus.x + Math.cos(angle) * distance),
        Math.round(ROOM01_DOORWAY.focus.y + Math.sin(angle) * distance),
        size,
        size,
      );
    }
    context.restore();
  }

  function drawDoor03(state) {
    if (state.gameProgress.currentRoom !== 3) return;
    drawRoom03EntranceGate();

    const door = state.door03;
    if (door.status === "opening" && !reducedMotion) {
      drawRoom03ExitGateSprite("closed", 1 - door.openingProgress);
      drawRoom03ExitGateSprite("open", door.openingProgress);
      drawRoom03GateStatusEffect(state, "checking", 1 - door.openingProgress);
      return;
    }
    const stateName = door.status === "open" || door.status === "opening"
      ? "open"
      : door.rejectionRemaining > 0
        ? "rejected"
        : door.status === "learning-complete" || door.connectedEdges.length === 6
          ? "checking"
          : "closed";
    drawRoom03ExitGateSprite(stateName);
    if (stateName === "checking" || stateName === "rejected") {
      drawRoom03GateStatusEffect(state, stateName);
    }
  }

  function drawRoom03EntranceGate() {
    return drawRoom03SideGateSprite("entrance", room03Art.sideGateOpen, 1);
  }

  function drawRoom03ExitGateSprite(stateName, alpha = 1) {
    const image = stateName === "open"
      ? room03Art.sideGateOpen
      : room03Art.sideGateClosed;
    return drawRoom03SideGateSprite("exit", image, alpha);
  }

  function drawRoom03SideGateSprite(side, image, alpha) {
    if (!imageReady(image)) return false;
    const destination = room03GateDestination(side);
    context.save();
    context.globalAlpha = alpha;
    context.imageSmoothingEnabled = false;
    if (side === "entrance") {
      context.translate(destination.x + destination.width, 0);
      context.scale(-1, 1);
      context.drawImage(image, 0, destination.y, destination.width, destination.height);
    } else {
      context.drawImage(
        image,
        destination.x,
        destination.y,
        destination.width,
        destination.height,
      );
    }
    context.restore();
    return true;
  }

  function drawRoom03GateStatusEffect(state, stateName, alpha = 1) {
    const checking = stateName === "checking";
    const pulse = reducedMotion
      ? 0.55
      : 0.42 + Math.sin(state.elapsedTime * 7) * 0.16;
    const x = ROOM03_GATE_LAYOUT.exitTarget.x;
    const { y, height } = ROOM03_DOORWAY.exit.opening;
    const gradient = context.createLinearGradient(x, y, x, y + height);
    if (checking) {
      gradient.addColorStop(0, "rgba(102,168,255,0)");
      gradient.addColorStop(0.34, `rgba(183,124,255,${pulse * alpha})`);
      gradient.addColorStop(0.68, `rgba(72,220,226,${pulse * alpha})`);
      gradient.addColorStop(1, "rgba(102,168,255,0)");
    } else {
      gradient.addColorStop(0, "rgba(255,118,68,0)");
      gradient.addColorStop(0.5, `rgba(255,118,68,${0.82 * alpha})`);
      gradient.addColorStop(1, "rgba(255,118,68,0)");
    }
    context.save();
    context.strokeStyle = gradient;
    context.lineWidth = checking ? 2 : 3;
    context.shadowColor = checking ? "#b77cff" : "#ff7644";
    context.shadowBlur = reducedMotion ? 4 : checking ? 10 : 14;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y + height);
    context.stroke();
    context.restore();
  }

  function drawDoor04(state) {
    if (state.gameProgress.currentRoom !== 4) return;
    // Both entrances are painted into the Room 4 background. Door state is
    // represented only by collision and the completion glow in the backdrop.
  }

  function drawDoor05(state) {
    if (state.gameProgress.currentRoom !== 5) return;
    const transition = state.roomTransition;
    const arrival = transition.toRoom === 5 && transition.active && transition.roomChanged;
    if (arrival) drawDoor05Portal(ROOM05_LANDMARKS.left, 0.65);
    if (["opening", "open"].includes(state.door05.status)) {
      drawDoor05Portal(ROOM05_LANDMARKS.right,
        state.door05.status === "open" ? 0.75 : state.door05.openingProgress * 0.75);
    }
  }

  function drawDoor06(state) {
    if (state.gameProgress.currentRoom !== 6) return;
    const transition = state.roomTransition;
    if (transition.active && transition.roomChanged && transition.toRoom === 6) {
      drawRoom06Portal(ROOM06_PORTALS.left, .5 * (1-transition.opacity));
    }
    if (["opening", "open"].includes(state.door06.status)) {
      drawRoom06Portal(ROOM06_PORTALS.right,
        state.door06.status === "open" ? .65 : state.door06.openingProgress * .65);
    }
  }

  function drawRoom01Characters(state) {
    if (state.gameProgress.currentRoom !== 1 || !state.room01Characters) return;
    for (const character of Object.values(state.room01Characters)) {
      atDepth(character.y, () => {
      const sprite = room01Art[character.assetKey];
      const characterX = character.x;
      const characterY = character.y;
      const bob = 0;
      context.save();
      context.translate(characterX, characterY + bob);
      context.globalAlpha = 0.44;
      context.fillStyle = "#020507";
      context.beginPath();
      context.ellipse(0, 1, 22, 6, 0, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      if (drawNpc(context, character, 93, reducedMotion || state.roomTransition.active)) {
        // Directional art is already authored left/right; never mirror it.
      } else if (imageReady(sprite)) {
        context.scale(character.facing || 1, 1);
        context.imageSmoothingEnabled = false;
        context.drawImage(sprite, -31, -94, 62, 93);
      } else {
        context.fillStyle = character.assetKey === "pinxin" ? "#d0a3ff" : C.warmGold;
        context.beginPath();
        context.arc(0, -64, 12, 0, Math.PI * 2);
        context.fill();
        context.fillRect(-9, -51, 18, 43);
      }
      context.restore();

      context.save();
      context.textAlign = "center";
      context.fillStyle = C.warmGold;
      context.font = "700 9px ui-sans-serif,system-ui";
      context.shadowBlur = 5;
      context.shadowColor = "#000";
      context.fillText(character.displayName, characterX, characterY - 100 + bob);
      context.restore();
    
      });
    }
  }

  function drawRoom02Characters(state) {
    if (state.gameProgress.currentRoom !== 2 || !state.room02Characters) return;
    for (const character of Object.values(state.room02Characters)) {
      atDepth(character.y, () => {
      const sprite = room01Art[character.assetKey];
      const bob = 0;
      context.save();
      context.translate(character.x, character.y + bob);
      context.globalAlpha = 0.4;
      context.fillStyle = "#020507";
      context.beginPath();
      context.ellipse(0, 1, 21, 6, 0, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      if (drawNpc(context, character, 90, reducedMotion || state.roomTransition.active)) {
        // Directional art is already authored left/right; never mirror it.
      } else if (imageReady(sprite)) {
        context.scale(character.facing || 1, 1);
        context.imageSmoothingEnabled = false;
        context.drawImage(sprite, -30, -91, 60, 90);
      } else {
        context.fillStyle = character.assetKey === "pinxin" ? "#d0a3ff" : C.warmGold;
        context.beginPath();
        context.arc(0, -62, 12, 0, Math.PI * 2);
        context.fill();
        context.fillRect(-9, -49, 18, 41);
      }
      context.restore();

      context.save();
      context.textAlign = "center";
      context.fillStyle = C.warmGold;
      context.font = "700 9px ui-sans-serif,system-ui";
      context.shadowBlur = 5;
      context.shadowColor = "#000";
      context.fillText(character.displayName, character.x, character.y - 98 + bob);
      context.restore();
    
      });
    }
  }

  function drawRoom03Characters(state) {
    if (state.gameProgress.currentRoom !== 3 || !state.room03Characters) return;
    for (const character of Object.values(state.room03Characters)) {
      atDepth(character.y, () => {
      const sprite = room03Art[character.assetKey];
      const bob = 0;
      context.save();
      context.translate(character.x, character.y + bob);
      context.globalAlpha = 0.42;
      context.fillStyle = "#020507";
      context.beginPath();
      context.ellipse(0, 1, 24, 7, 0, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      if (drawNpc(context, character, ROOM03_DEVICE_GEOMETRY.sprites.character.height, reducedMotion || state.roomTransition.active)) {
        // Directional art is already authored left/right; never mirror it.
      } else if (imageReady(sprite)) {
        context.scale(character.facing || 1, 1);
        context.imageSmoothingEnabled = false;
        context.drawImage(
          sprite,
          -ROOM03_DEVICE_GEOMETRY.sprites.character.width / 2,
          -ROOM03_OVERLAY_LAYOUT.characterSpriteLift,
          ROOM03_DEVICE_GEOMETRY.sprites.character.width,
          ROOM03_DEVICE_GEOMETRY.sprites.character.height,
        );
      } else {
        context.fillStyle = character.assetKey === "pinxin" ? "#d0a3ff" : C.warmGold;
        context.beginPath();
        context.arc(0, -70, 13, 0, Math.PI * 2);
        context.fill();
        context.fillRect(-10, -56, 20, 48);
      }
      context.restore();

      context.save();
      context.textAlign = "center";
      context.fillStyle = C.warmGold;
      context.font = "700 9px ui-sans-serif,system-ui";
      context.shadowBlur = 5;
      context.shadowColor = "#000";
      context.fillText(
        character.displayName,
        character.x,
        character.y - ROOM03_OVERLAY_LAYOUT.characterLabelLift + bob,
      );
      context.restore();
    
      });
    }
  }

  function drawRoom04Characters(state) {
    if (state.gameProgress.currentRoom !== 4 || !state.room04Characters) return;
    for (const character of Object.values(state.room04Characters)) {
      atDepth(character.y, () => {
      const sprite = room04Art[character.assetKey];
      const bob = 0;
      context.save();
      context.translate(character.x, character.y + bob);
      context.globalAlpha = 0.42;
      context.fillStyle = "#020507";
      context.beginPath();
      context.ellipse(0, 1, 24, 7, 0, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      const interactionFrame = room04InteractionFrame(state,character);
      const interactionSprite=room04Art[character.assetKey+"Interaction"];
      const interactionReady=interactionFrame && imageReady(interactionSprite);
      if(interactionReady){
        const f=interactionFrame,scale=ROOM04_ACTOR_LAYOUT.height/f.standingHeight;
        context.drawImage(interactionSprite,f.x,f.y,f.width,f.height,(f.x-f.footX)*scale,(f.y-f.footY)*scale,f.width*scale,f.height*scale);
      } else if (drawNpc(context, character, ROOM04_ACTOR_LAYOUT.height, reducedMotion || state.roomTransition.active)) {
        // Directional art is already authored left/right; never mirror it.
      } else if (imageReady(sprite)) {
        context.scale(character.facing || 1, 1);
        context.imageSmoothingEnabled = false;
        context.drawImage(
          sprite,
          -ROOM03_DEVICE_GEOMETRY.sprites.character.width / 2,
          -ROOM03_OVERLAY_LAYOUT.characterSpriteLift,
          ROOM03_DEVICE_GEOMETRY.sprites.character.width,
          ROOM03_DEVICE_GEOMETRY.sprites.character.height,
        );
      } else {
        context.fillStyle = character.assetKey === "pinxin" ? "#d0a3ff" : C.warmGold;
        context.beginPath();
        context.arc(0, -70, 13, 0, Math.PI * 2);
        context.fill();
        context.fillRect(-10, -56, 20, 48);
      }
      if (
        character.assetKey === "leroy"
        && !(interactionReady && interactionFrame.containsCapsule)
        && state.room04Presentation?.carryActor === "leroy"
        && state.door04Capsules.some((voice) =>
          voice.id === state.door04.heldVoiceId && voice.currentLocation === "held")
      ) {
        const hand = ROOM04_ACTOR_LAYOUT.hand[character.pose] ?? ROOM04_ACTOR_LAYOUT.hand.holding;
        drawRoom04CapsuleSprite("carried", hand[0]-ROOM04_ACTOR_LAYOUT.propWidth/2, hand[1]-ROOM04_ACTOR_LAYOUT.propHeight,ROOM04_ACTOR_LAYOUT.propWidth,ROOM04_ACTOR_LAYOUT.propHeight);
      }
      context.restore();

      context.save();
      context.textAlign = "center";
      context.fillStyle = C.warmGold;
      context.font = "700 9px ui-sans-serif,system-ui";
      context.shadowBlur = 5;
      context.shadowColor = "#000";
      context.fillText(
        character.displayName,
        character.x,
        character.y - ROOM04_ACTOR_LAYOUT.height - 10 + bob,
      );
      context.restore();
    
      });
    }
  }

  function drawRoom01Foreground(state) {
    if (state.gameProgress.currentRoom !== 1) return;
    context.save();
    if (room01DoorDepth(state) > 0 && imageReady(room01Art.doorwayForeground)) {
      const foreground = ROOM01_DOORWAY.foregroundSprite;
      context.imageSmoothingEnabled = false;
      context.drawImage(
        room01Art.doorwayForeground,
        foreground.x,
        foreground.y,
        foreground.width,
        foreground.height,
      );
    }
    context.restore();
  }

  function drawRoom03Foreground(state) {
    if (state.gameProgress.currentRoom !== 3) return;
    // The approved background already contains the foreground masonry. Keep
    // this layer intentionally transparent so it cannot recreate seam masks.
  }

  function drawRoom04Foreground(state) {
    if (state.gameProgress.currentRoom !== 4) return;
    // The approved clean layout intentionally has no foreground crate layer.
  }

  function drawSlidingDoor(door, x, accent) {
    if (door.status === "open") return;
    const slide = door.status === "opening" ? 120 * door.openingProgress : 0;
    context.save(); if (door.rejectionFlashRemaining > 0) { context.shadowBlur = 25; context.shadowColor = C.reject; }
    context.fillStyle = door.status === "rejected" ? "#522239" : door.status === "opening" ? "#3c5662" : "#27212f";
    context.fillRect(x,270-slide,22,120); context.strokeStyle = door.status === "rejected" ? C.reject : accent; context.strokeRect(x+.5,270.5-slide,21,119); context.restore();
  }

  function drawPlayer(state) {
    const p = state.player;
    const doorwayDepth = room01DoorDepth(state);
    const exitPerspective = room02ExitPerspective(state);
    context.save();
    if (doorwayDepth > 0) {
      const scale = 1 - doorwayDepth * 0.16;
      context.translate(p.x, p.y);
      context.scale(scale, scale);
      context.translate(-p.x, -p.y);
      context.globalAlpha = 1 - doorwayDepth * 0.1;
    }
    if (exitPerspective.active) {
      context.translate(p.x, p.y);
      context.scale(exitPerspective.scale, exitPerspective.scale);
      context.translate(-p.x, -p.y);
      context.globalAlpha *= exitPerspective.opacity;
    }
    if (state.gameProgress.currentRoom === 4 && state.room04Presentation?.playerForm === "orb") {
      const near = [state.door04ReferenceConsole,state.door04TestConsole,...state.door04Capsules,...state.door04Slots].some(t=>Math.hypot(p.x-t.x,p.y-t.y)<t.interactionRadius);
      context.save();
      context.fillStyle="#100b2488";context.beginPath();context.ellipse(p.x,p.y+8,17,5,0,0,Math.PI*2);context.fill();
      context.shadowColor=C.violet;context.shadowBlur=reducedMotion?10:18;
      context.fillStyle=near?"#e4ccff":"#c395ff";context.beginPath();context.arc(p.x,p.y-12,near?13:11,0,Math.PI*2);context.fill();
      context.fillStyle="#fff4ff";context.beginPath();context.arc(p.x-2,p.y-14,5,0,Math.PI*2);context.fill();
      context.restore();
    } else drawGameAvatar(context, state, { reducedMotion });
    if(state.gameProgress.currentRoom === 4) for(const voice of state.door04Capsules) {
      if (voice.currentLocation === "held" && state.room04Presentation?.carryActor !== "leroy") {
        const carried = room04CarriedCapsule(state,reducedMotion);
        drawRoom04CapsuleSprite("carried",carried.x,carried.y,carried.width,carried.height);
      }
    }
    const carried = heldFragment(state);
    if (carried) {
      context.save();
      const hover = reducedMotion ? 0 : Math.sin(state.elapsedTime * 3) * 2;
      context.shadowBlur = 12;
      context.shadowColor = C.violet;
      if (state.gameProgress.currentRoom === 1 && imageReady(room01Art.stations)) {
        const region = ROOM01_STATION_REGIONS.carried;
        context.imageSmoothingEnabled = false;
        context.drawImage(
          room01Art.stations,
          region.x,
          region.y,
          region.width,
          region.height,
          p.x + 10,
          p.y - 43 + hover,
          34,
          34,
        );
      } else {
        context.translate(p.x+18,p.y-18 + hover);
        context.rotate(Math.PI/4);
        context.fillStyle="#c394ff";
        context.fillRect(-6,-6,12,12);
      }
      context.restore();
    }
    context.restore();
  }

  function room02ExitPerspective(state) {
    const transition = state.roomTransition;
    if (
      !transition.active
      || transition.fromRoom !== 2
      || !["door-perspective", "fade-out"].includes(transition.phase)
    ) return { active: false, scale: 1, opacity: 1 };
    return {
      active: true,
      scale: transition.playerScale ?? 1,
      opacity: transition.playerOpacity ?? 1,
    };
  }

  function room01DoorDepth(state) {
    if (state.gameProgress.currentRoom !== 1 || state.door01.status !== "open") return 0;
    const zone = ROOM01_DOORWAY.depthZone;
    if (state.player.y < zone.minY || state.player.y > zone.maxY) return 0;
    return clamp((state.player.x - zone.startX) / (zone.endX - zone.startX), 0, 1);
  }

  function drawRoom03StatusToast(state) {
    const message = state.ui.message;
    if (!message) return;
    const kind = message.kind ?? "patch";
    const lines = message.lines;
    const rejected = kind === "rejected";
    const success = kind === "success";
    const border = rejected ? C.reject : success ? C.success : C.gold;
    const width = 520;
    const height = 24 + Math.min(2, lines.length) * 19;
    const x = (canvas.width - width) / 2;
    const y = 536 - height;
    context.save();
    context.globalAlpha = message.alpha ?? 1;
    context.fillStyle = "rgba(5,9,12,.94)";
    context.strokeStyle = border;
    context.lineWidth = 1.2;
    context.shadowBlur = rejected ? 18 : 10;
    context.shadowColor = border;
    roundedRect(context, x, y, width, height, 4);
    context.fill();
    context.stroke();
    context.shadowBlur = 0;
    context.textAlign = "center";
    lines.slice(0, 2).forEach((line, index) => {
      context.fillStyle = index === 0 ? border : "#efe2c5";
      context.font = index === 0
        ? "700 12px ui-sans-serif,system-ui"
        : "500 11px ui-sans-serif,system-ui";
      context.fillText(line, canvas.width / 2, y + 21 + index * 19);
    });
    context.restore();
  }

  function drawRoom03ControlStrip() {
    const x = 302;
    const y = 604;
    const width = 356;
    const height = 26;
    context.save();
    context.fillStyle = "rgba(4,8,11,.9)";
    context.strokeStyle = "rgba(228,173,69,.72)";
    roundedRect(context, x, y, width, height, 4);
    context.fill();
    context.stroke();
    context.textAlign = "center";
    context.fillStyle = "#eadfc8";
    context.font = "600 10px ui-sans-serif,system-ui";
    context.fillText("E  檢查／重聽　　Enter  連接　　Esc  取消", x + width / 2, y + 17);
    context.restore();
  }

  function drawContextHint(state, cameraX) {
    if (state.dialogue.active) return;
    const hint = state.ui.contextHint;
    if (!hint.anchor || (!hint.visible && !hint.compactVisible)) return;

    const anchorX = hint.anchor.x - cameraX;
    const anchorY = hint.anchor.y;
    if (hint.compactVisible && !hint.visible) {
      drawCompactInteractionMark(anchorX, anchorY, hint.lines[0]?.split(" ")[0] ?? "E");
      return;
    }

    context.save();
    context.font = "500 13px ui-sans-serif,system-ui";
    const textWidth = Math.max(...hint.lines.map((line) => context.measureText(line).width), 120);
    const width = Math.min(360, Math.max(156, textWidth + 32));
    const height = 18 + hint.lines.length * 20;
    let x = clamp(anchorX - width / 2, 12, canvas.width - width - 12);
    let y = anchorY - height - 58;
    if (y < 12) y = anchorY + 52;
    y = clamp(y, 12, canvas.height - height - 12);

    const playerX = state.player.x - cameraX;
    const playerY = state.player.y;
    if (rectNearPoint(x, y, width, height, playerX, playerY, state.player.radius + 10)) {
      const alternateY = anchorY + 54;
      y = alternateY + height <= canvas.height - 12
        ? alternateY
        : clamp(anchorY - height - 72, 12, canvas.height - height - 12);
    }

    context.globalAlpha = hint.alpha;
    context.shadowBlur = 14;
    context.shadowColor = "rgba(228,173,69,.25)";
    context.fillStyle = "rgba(4,8,11,.965)";
    roundedRect(context, x, y, width, height, 7);
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = "rgba(228,173,69,.74)";
    context.lineWidth = 1;
    context.stroke();

    context.textAlign = "center";
    hint.lines.slice(0, 2).forEach((line, index) => {
      context.fillStyle = index === 0 ? C.pale : "#c8ba9a";
      context.font = index === 0
        ? "500 13px ui-sans-serif,system-ui"
        : "400 11px ui-sans-serif,system-ui";
      context.fillText(line, x + width / 2, y + 21 + index * 19);
    });
    context.restore();
  }

  function drawCompactInteractionMark(anchorX, anchorY, keyLabel) {
    const x = clamp(anchorX, 18, canvas.width - 18);
    const y = clamp(anchorY - 44, 18, canvas.height - 18);
    context.save();
    context.globalAlpha = 0.28;
    context.fillStyle = "#171020";
    context.strokeStyle = C.gold;
    context.beginPath();
    context.arc(x, y, 11, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = C.pale;
    context.font = "700 9px ui-sans-serif,system-ui";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = keyLabel === "Enter" || keyLabel === "Space"
      ? "700 6px ui-sans-serif,system-ui"
      : "700 9px ui-sans-serif,system-ui";
    context.fillText(keyLabel, x, y + 0.5);
    context.restore();
  }

  function drawDialogue(state) {
    const entry = currentDialogueEntry(state);
    if (!entry) return;
    const isFinalEntry = state.dialogue.index === state.dialogue.entries.length - 1;
    if (
      state.gameProgress.currentRoom === 1
      || state.gameProgress.currentRoom === 2
    ) {
      drawRoom01Dialogue(entry, isFinalEntry);
      return;
    }
    if (state.gameProgress.currentRoom === 3) {
      drawRoom03Dialogue(entry, isFinalEntry);
      return;
    }
    drawRoom01Dialogue(entry, isFinalEntry);
  }

  function drawRoom01Dialogue(entry, isFinalEntry) {
    const x = 154;
    const y = 492;
    const width = 652;
    const height = 130;
    const speaker = visibleSpeakerName(entry.speaker);
    const portrait = entry.speaker === "Leroy"
      ? room01Art.leroy
      : entry.speaker === "Miss DJ Bear Beat" ? room01Art.pinxin : null;
    const textX = portrait ? x + 112 : x + 22;

    context.save();
    context.fillStyle = "rgba(3,8,14,.965)";
    context.strokeStyle = "rgba(228,173,69,.88)";
    context.lineWidth = 1.35;
    context.shadowBlur = 18;
    context.shadowColor = "rgba(0,0,0,.84)";
    roundedRect(context, x, y, width, height, 5);
    context.fill();
    context.stroke();
    context.shadowBlur = 0;

    if (portrait && imageReady(portrait)) {
      context.save();
      roundedRect(context, x + 15, y + 15, 78, 84, 3);
      context.clip();
      context.fillStyle = "#07101a";
      context.fillRect(x + 15, y + 15, 78, 84);
      context.imageSmoothingEnabled = false;
      context.drawImage(portrait, 170, 0, 684, 684, x + 14, y + 14, 80, 86);
      context.restore();
      context.strokeStyle = "rgba(228,173,69,.74)";
      context.strokeRect(x + 15.5, y + 15.5, 77, 83);
    }

    context.fillStyle = C.gold;
    context.font = "700 12px ui-sans-serif,system-ui";
    context.fillText(speaker, textX, y + 25);
    context.strokeStyle = "rgba(228,173,69,.32)";
    context.beginPath();
    context.moveTo(textX, y + 34);
    context.lineTo(x + width - 20, y + 34);
    context.stroke();
    context.fillStyle = "#f3ead9";
    context.font = "500 14px ui-sans-serif,system-ui";
    wrapMixedText(context, entry.text, x + width - 22 - textX).slice(0, 3).forEach((line, index) => {
      context.fillText(line, textX, y + 56 + index * 20);
    });
    context.textAlign = "right";
    context.fillStyle = "#c9b88e";
    context.font = "600 9px ui-sans-serif,system-ui";
    context.fillText(
      isFinalEntry ? "Enter／Esc — 收起對話" : "Enter — 下一句",
      x + width - 18,
      y + height - 12,
    );
    context.restore();
  }

  function drawRoom03Dialogue(entry, isFinalEntry) {
    const x = 154;
    const y = 472;
    const width = 652;
    const height = 146;
    const speaker = visibleSpeakerName(entry.speaker);
    const portrait = entry.speaker === "Leroy"
      ? room03Art.leroy
      : entry.speaker === "Miss DJ Bear Beat" ? room03Art.pinxin : null;
    const textX = portrait ? x + 126 : x + 24;

    context.save();
    context.fillStyle = "rgba(4,8,11,.965)";
    context.strokeStyle = "rgba(228,173,69,.84)";
    context.lineWidth = 1.4;
    context.shadowBlur = 18;
    context.shadowColor = "rgba(0,0,0,.8)";
    roundedRect(context, x, y, width, height, 5);
    context.fill();
    context.stroke();
    context.shadowBlur = 0;

    if (portrait && imageReady(portrait)) {
      context.save();
      roundedRect(context, x + 18, y + 18, 88, 96, 3);
      context.clip();
      context.fillStyle = "#071018";
      context.fillRect(x + 18, y + 18, 88, 96);
      context.imageSmoothingEnabled = false;
      context.drawImage(portrait, 170, 0, 684, 684, x + 17, y + 17, 90, 98);
      context.restore();
      context.strokeStyle = "rgba(228,173,69,.76)";
      context.strokeRect(x + 18.5, y + 18.5, 87, 95);
    }

    context.fillStyle = C.gold;
    context.font = "700 13px ui-sans-serif,system-ui";
    context.fillText(speaker, textX, y + 29);
    context.strokeStyle = "rgba(228,173,69,.35)";
    context.beginPath();
    context.moveTo(textX, y + 38);
    context.lineTo(x + width - 22, y + 38);
    context.stroke();
    context.fillStyle = "#f3ead9";
    context.font = "500 15px ui-sans-serif,system-ui";
    wrapMixedText(context, entry.text, x + width - 24 - textX).slice(0, 3).forEach((line, index) => {
      context.fillText(line, textX, y + 63 + index * 22);
    });
    context.textAlign = "right";
    context.fillStyle = "#c9b88e";
    context.font = "600 10px ui-sans-serif,system-ui";
    context.fillText(
      isFinalEntry ? "Enter／Esc — 收起對話" : "Enter — 下一句",
      x + width - 20,
      y + height - 13,
    );
    context.restore();
  }
  return { render };
}

function loadImage(source) {
  const image = new Image();
  image.decoding = "async";
  image.src = source;
  return image;
}

function imageReady(image) {
  return Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
}

function visibleSpeakerName(speaker) {
  return speaker;
}

function wrapMixedText(context,text,maxWidth){const lines=[];for(const paragraph of text.split("\n")){let line="";for(const character of [...paragraph]){const candidate=line+character;if(line&&context.measureText(candidate).width>maxWidth){lines.push(line);line=character;}else line=candidate;}if(line)lines.push(line);}return lines;}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function rectNearPoint(x, y, width, height, pointX, pointY, margin) {
  return pointX >= x - margin
    && pointX <= x + width + margin
    && pointY >= y - margin
    && pointY <= y + height + margin;
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}
