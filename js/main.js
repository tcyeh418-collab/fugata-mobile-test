import {createRoomHelp} from "./room-help.js?v=hint-toggle-playtest-v1";
import {createSequenceControls} from "./room04-controls.js?v=room04-movement-fixes-v6";
import {createFullscreenTools} from "./fullscreen-tools.js";
import {installPointerControls} from "./pointer-controls.js?v=room01-theme-replay-v1";
import { backupBeforeWrite } from "./save-backups.js";
import { controlDoor04Reference } from "./door04.js?v=room04-movement-fixes-v6";
import {loadWalkArt,supportsWalk,walkCacheInfo,walkFrame} from './character/walk-v14.js';
import {isTrialCharacter} from './character/trial-model.js';
import { createCharacterCreator } from "./character/creator.js";
import { loadCharacter, readCharacterForConfirmation, fixedCharacterDraft, instrumentVisible } from "./character/model.js";
import { CHARACTER_FLOW, createCharacterRouter } from "./character/flow.js";
import { loadProgress, saveProgress, PROGRESS_KEY } from "./progress-save.js?v=room01-theme-replay-v1";
import { createAudioSystem } from "./audio.js?v=room01-theme-replay-v1";
import { INTRO_DIALOGUE, startDialogue } from "./dialogue.js";
import { nearestPedestal } from "./door01.js?v=room01-theme-replay-v1";
import { nearestEchoTower, nearestSubjectTerminal } from "./door02.js";
import { door03PortById, nearestDoor03Module, nearestDoor03Port } from "./door03.js";
import { createDoor03PatchGuide } from "./door03-guide.js";
import {
  door04PlacedCount,
  handleDoor04PreviewState,
  heldDoor04Voice,
  nearDoor04Reference,
  nearDoor04Test,
  nearestDoor04Pedestal,
  nearestDoor04Slot,
} from "./door04.js?v=room04-movement-fixes-v6";
import {
  door05Phase,
  door05SelectedAccents,
  nearDoor05Final,
  nearDoor05Test,
  nearestDoor05Node,
  nearestDoor05Terminal,
} from "./door05.js";
import {
  handleDoor06PreviewState,
  nearDoor06FinalReference,
  nearestDoor06Memory,
  nearestDoor06Relay,
} from "./door06.js";
import { createEndingController } from "./ending.js";
import { createInput } from "./input.js";
import { createRenderer } from "./render.js?v=room01-theme-replay-v1";
import {
  createRoomProgressController,
  createRoomTransitionController,
} from "./room-progress.js";
import { roomCopy } from "./room-copy.js";
import { createInitialState, heldFragment, setMessage } from "./state.js?v=room01-theme-replay-v1";
import { createGameUi, setAudioNotice } from "./ui.js?v=room01-theme-replay-v1";
import { updateGame } from "./update.js?v=room01-theme-replay-v1";

const titleScreen = document.querySelector("#title-screen");
const gameScreen = document.querySelector("#game-screen");
const chapterComplete = document.querySelector("#chapter-complete");
const canvas = document.querySelector("#game-canvas");
const fullTrack = document.querySelector("#fugata-full-track");
const playButton = document.querySelector("#play-fugata");
const toggleButton = document.querySelector("#toggle-fugata");
const startButton = document.querySelector("#start-game");
const titleAudioStatus = document.querySelector("#title-audio-status");
const titleError = document.querySelector("#title-error");
const roomTitle = document.querySelector("#room-title");
const doorNumber = document.querySelector("#door-number");
const localTestSelector = document.querySelector("#local-test-room-selector");
const localTestRoom = document.querySelector("#local-test-room");
const localTestRoomGo = document.querySelector("#local-test-room-go");
const fullscreenButton = document.querySelector("#toggle-fullscreen");
const mobileRoom1Enabled = new URLSearchParams(window.location.search).get("mobile") === "room1";
if (mobileRoom1Enabled) {
  document.documentElement.classList.add("mobile-room1");
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) viewport.content = "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no";
  const mobileStyles = document.createElement("link");
  mobileStyles.rel = "stylesheet";
  mobileStyles.href = "mobile/room1.css?v=9";
  document.head.append(mobileStyles);
}
const localTestEnabled = false; // Public playtest package: no local QA routes.
const autoTestRoom = null;
const autoEndingPreview = false;
const autoRoom03GateState = null;
const autoRoom04State = null;
const autoTransitionState = null;
const freshLocalTestStorage = false;
const localTestingAvailable = false;
const systemReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const localReducedMotion = localTestEnabled
  && new URLSearchParams(window.location.search).get("motion") === "reduce";
const reducedMotionEnabled = systemReducedMotion || localReducedMotion;
document.documentElement.classList.toggle("reduced-motion", reducedMotionEnabled);
const gameUi = createGameUi({
  gameScreen,
  statusRoom: document.querySelector("#status-room"),
  statusDoors: document.querySelector("#status-doors"),
  statusCarrying: document.querySelector("#status-carrying"),
  statusDoor: document.querySelector("#status-door"),
  audioNotice: document.querySelector("#audio-notice"),
  gameplayFeedback: document.querySelector("#gameplay-feedback"),
  roomControlsSummary: document.querySelector("#room-controls-summary"),
  room01Hud: document.querySelector("#room01-hud"),
  room01Objective: document.querySelector("#room01-objective-copy"),
  room01Carry: document.querySelector("#room01-carry-copy"),
  room03Hud: document.querySelector("#room03-hud"),
  room03Objective: document.querySelector("#room03-objective-copy"),
  room03Device: document.querySelector("#room03-device-copy"),
  room03StepCount: document.querySelector("#room03-step-count"),
  room03StepPips: document.querySelector("#room03-step-pips"),
  completionMarker: document.querySelector("#room-completion-marker"),
});
const door03PatchGuide = createDoor03PatchGuide({
  root: document.querySelector("#door03-patch-guide"),
  canvas,
});
const roomProgress = createRoomProgressController(
  document.querySelector("#room-progress-panel"),
);
const roomTransition = createRoomTransitionController(
  document.querySelector("#room-transition-overlay"),
);

if (!(canvas instanceof HTMLCanvasElement) || !(fullTrack instanceof HTMLAudioElement)) {
  throw new Error("Required Fugata game elements are missing.");
}

let storage;
try { storage = window.localStorage; } catch { storage = {getItem:()=>null,setItem:()=>{throw new Error("Storage unavailable");},removeItem:()=>{}}; }
const saveCheckEnabled=localTestEnabled && new URLSearchParams(location.search).get('savecheck')==='1';
const releaseLabel = document.createElement('p');
releaseLabel.id = 'release-label';
releaseLabel.textContent = 'Room 1–6 手機測試版｜正常遊玩：保存角色與進度';
const hubLink = document.createElement('a'); hubLink.href = 'test.html'; hubLink.textContent = '返回統一測試首頁';
releaseLabel.append(' · ', hubLink);
if (localTestingAvailable) document.body.prepend(releaseLabel);
let resumedProgress = localTestEnabled && !saveCheckEnabled ? null : loadProgress(storage);
let state = resumedProgress || createInitialState();
state.ui.reducedMotion = reducedMotionEnabled;
state.character = loadCharacter(storage);
if (resumedProgress || state.character) startButton.textContent = "繼續遊戲";
const saveStatus = document.querySelector("#save-status");
const editCharacter = document.querySelector("#edit-character");
const fullscreenRoot = document.documentElement;
const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
const requestGameFullscreen = fullscreenRoot.requestFullscreen || fullscreenRoot.webkitRequestFullscreen;
const exitDocumentFullscreen = document.exitFullscreen || document.webkitExitFullscreen;

function syncFullscreenUi() {
  const active = Boolean(fullscreenElement());
  fullscreenRoot.classList.toggle("game-fullscreen", active);
  if (!(fullscreenButton instanceof HTMLButtonElement)) return;
  fullscreenButton.textContent = active ? "離開全螢幕" : "全螢幕";
  fullscreenButton.setAttribute("aria-pressed", String(active));
  fullscreenButton.title = active ? "離開全螢幕（Esc 或 F）" : "切換全螢幕（F）";
}

async function leaveGameFullscreen() {
  if (!fullscreenElement() || !exitDocumentFullscreen) return;
  fullscreenRoot.classList.remove("game-fullscreen");
  try { await exitDocumentFullscreen.call(document); }
  catch { syncFullscreenUi(); }
}

async function toggleGameFullscreen() {
  if (fullscreenElement()) {
    await leaveGameFullscreen();
    canvas.focus({ preventScroll: true });
    return;
  }
  if (!requestGameFullscreen) return;
  try {
    await requestGameFullscreen.call(fullscreenRoot, { navigationUI: "hide" });
    canvas.focus({ preventScroll: true });
  } catch {
    saveStatus.textContent = "瀏覽器未允許全螢幕；仍可使用瀏覽器本身的全螢幕功能。";
  }
}

if (fullscreenButton instanceof HTMLButtonElement) {
  const supported = Boolean(requestGameFullscreen && exitDocumentFullscreen);
  fullscreenButton.hidden = !supported;
  fullscreenButton.addEventListener("click", () => { void toggleGameFullscreen(); });
}
document.addEventListener("fullscreenchange", syncFullscreenUi);
document.addEventListener("webkitfullscreenchange", syncFullscreenUi);
window.addEventListener("keydown", (event) => {
  if (event.code !== "KeyF" || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
  if (state.phase !== "game" || gameScreen.hidden) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
  event.preventDefault();
  void toggleGameFullscreen();
});
let lastSavedAt = 0;
function persistProgress() {
  if (!hasEnteredGame || (localTestEnabled && !saveCheckEnabled) || !state.character || !["game", "character", "ending"].includes(state.phase)) return;
  try { if (saveProgress(storage,state)) saveStatus.textContent = "進度已保存"; }
  catch { saveStatus.textContent = "無法保存進度，請檢查瀏覽器本機儲存設定。"; }
}
window.addEventListener("pagehide",()=>{persistProgress();audio.stopAll();});
document.addEventListener("visibilitychange",()=>{if(document.hidden)persistProgress();});
const renderer = createRenderer(canvas, {
  reducedMotion: reducedMotionEnabled,
  externalRoom01Ui: mobileRoom1Enabled,
  externalRoomUiRooms: mobileRoom1Enabled ? [1, 2, 3, 4, 5, 6] : [],
});
const audio = createAudioSystem(fullTrack, {
  onFullTrackState(next) {
    state.audio.fullTrackStatus = next.status;
    state.audio.fullTrackPlaying = next.playing;
    titleScreen.dataset.audioStatus = next.status;
    titleScreen.dataset.audioPlaying = String(next.playing);
    titleAudioStatus.textContent = `完整歌曲：${audioStatusLabel(next.status)}`;
    titleError.textContent = next.error ? "完整歌曲無法播放，請重新載入頁面。" : "";
    if (fullTrack.dataset.everPlayed === "true") {
      toggleButton.disabled = false;
      toggleButton.textContent = next.playing ? "暫停" : "繼續";
    }
  },
  onFragmentAssetsState(next) {
    state.audio.fragmentAssetsStatus = next.status;
    state.audio.loadedFragments = next.loaded;
    state.audio.totalFragments = next.total;
    refreshAudioNotice();
  },
  onDoor02AssetsState(next) {
    state.audio.door02AssetsStatus = next.status;
    state.audio.loadedDoor02 = next.loaded;
    state.audio.totalDoor02 = next.total;
    refreshAudioNotice();
  },
  onSuccessLoopState(next) {
    state.audio.successLoopStatus = next.status;
    refreshAudioNotice();
  },
  onDoor03AssetsState(next) {
    state.audio.door03AssetsStatus = next.status;
    state.audio.loadedDoor03 = next.loaded;
    state.audio.totalDoor03 = next.total;
    if (next.status === "Error") audio.stopDoor03Loop?.(0);
    refreshAudioNotice();
  },
  onDoor04AssetsState(next) {
    state.audio.door04AssetsStatus = next.status;
    state.audio.loadedDoor04 = next.loaded;
    state.audio.totalDoor04 = next.total;
    refreshAudioNotice();
  },
  onDoor05AssetsState(next) {
    state.audio.door05AssetsStatus = next.status;
    state.audio.loadedDoor05 = next.loaded;
    state.audio.totalDoor05 = next.total;
    refreshAudioNotice();
  },
  onDoor06AssetsState(next) {
    state.audio.door06AssetsStatus = next.status;
    state.audio.door06SuccessStatus = next.status;
    state.audio.loadedDoor06 = next.loaded;
    state.audio.totalDoor06 = next.total;
    refreshAudioNotice();
  },
  onSuccessLoopsPlaying(playing) {
    state.audio.successLoopsPlaying = playing;
  },
  onDoor03SuccessPlaying(playing) {
    state.audio.door03SuccessPlaying = playing;
  },
  onDoor04PreviewState(next) {
    state.audio.door04ReferencePlaying = next.playing && next.kind === "reference";
    state.audio.door04PreviewVoiceId = next.playing && next.kind === "voice"
      ? next.entityId
      : null;
    for (const voice of state.door04Capsules) {
      voice.isPlaying = next.playing && next.kind === "voice" && voice.id === next.entityId;
    }
    handleDoor04PreviewState(state, next);
  },
  onDoor04TestState(next) {
    state.audio.door04TestPlaying = next.playing;
  },
  onDoor04SuccessPlaying(playing) {
    state.audio.door04SuccessPlaying = playing;
  },
  onDoor05ReferenceState(next) {
    state.audio.door05ReferencePlayingPhaseId = next.playing ? next.phaseId : null;
    state.door05.referencePlayingPhaseId = next.playing ? next.phaseId : null;
    if (!next.playing) state.door05.referenceStep = 0;
  },
  onDoor05TestState(next) {
    state.audio.door05TestPlaying = next.playing;
  },
  onDoor05TestWarning(next) {
    state.door05.audioWarning = next;
    setMessage(
      state,
      ["音訊警告：音源提早結束；視覺與判定仍會依共同時間軸完成。"],
      3.5,
      "audio",
    );
  },
  onDoor05SuccessPlaying(playing) {
    state.audio.door05SuccessPlaying = playing;
  },
  onDoor06PreviewState(next) {
    state.audio.door06PreviewKind = next.playing ? next.kind : null;
    state.audio.door06PreviewEntityId = next.playing ? next.entityId : null;
    handleDoor06PreviewState(state, next);
    for (const relay of state.door06Relays) {
      relay.playing = next.playing && next.kind === "relay" && relay.id === next.entityId;
    }
    for (const memory of state.door06Memories) {
      memory.isPlaying = next.playing && next.kind === "memory" && memory.id === next.entityId;
    }
  },
  onDoor06SuccessPlaying(playing) {
    state.audio.door06SuccessPlaying = playing;
  },
  onPreviewState(next) {
    for (const fragment of state.fragments) fragment.isPlaying = next.playing && next.kind === "fragment" && fragment.id === next.entityId;
    for (const tower of state.echoTowers) tower.isPlaying = next.playing && next.kind === "echo" && tower.id === next.entityId;
    state.subjectTerminal.isPlaying = next.playing && next.kind === "subject" && state.subjectTerminal.id === next.entityId;
    for (const module of state.door03Modules) {
      module.isInspecting = next.playing && next.kind === "door03" && module.id === next.entityId;
    }
    state.audio.activePreviewId = next.playing ? next.entityId : null;
    state.audio.activePreviewKind = next.playing ? next.kind : null;
  },
});
const endingController = createEndingController({
  root: chapterComplete,
  fullTrack,
  audio,
  onRestart: restartChapter,
});
const input = createInput(canvas, () => { void audio.resume(); });

if (autoEndingPreview) {
  state.phase = "ending";
  state.ending.visible = true;
  titleScreen.hidden = true;
  gameScreen.hidden = true;
  localTestSelector.hidden = true;
  endingController.show();
} else if (
  localTestEnabled
  && localTestSelector instanceof HTMLElement
  && localTestRoom instanceof HTMLSelectElement
  && localTestRoomGo instanceof HTMLButtonElement
) {
  localTestSelector.dataset.enabled = "true";
  localTestRoomGo.addEventListener("click", async () => {
    await openLocalTestRoom(Number(localTestRoom.value));
  });
  if (autoTestRoom !== null) {
    localTestRoom.value = String(autoTestRoom);
    localTestSelector.dataset.autoRoom = String(autoTestRoom);
    void openLocalTestRoom(autoTestRoom, { resumeAudio: false });
  } else {
    localTestSelector.hidden = false;
  }
}

playButton.addEventListener("click", async () => {
  fullTrack.dataset.everPlayed = "true";
  toggleButton.disabled = false;
  await audio.resume();
  await audio.playFullTrack();
});

toggleButton.addEventListener("click", async () => {
  await audio.resume();
  await audio.toggleFullTrack();
});

const enterDestination = createCharacterRouter({
  fugata: async (character) => {
    await loadWalkArt(character);
    if (!supportsWalk(character)) throw new Error('Character confirmation required');
    state.character = character;
    titleScreen.hidden = true;
    gameScreen.hidden = false;
    state.phase = "game";
    // The title song belongs to the entry flow only. Stop it as soon as the
    // first room appears so it cannot overlap Miss DJ Bear Beat's briefing.
    audio.pauseFullTrack();
    if (!resumedProgress && !state.dialogue.sequenceId && !hasEnteredGame) startDialogue(state, "intro", INTRO_DIALOGUE);
    hasEnteredGame = true;
    audio.publishAssetStates();
    input.reset();
    canvas.focus();
    persistProgress();
  },
});
let hasEnteredGame = false;
let editingCharacter = false;
const creator = createCharacterCreator({
  root: document.querySelector("#character-screen"), storage, destination: CHARACTER_FLOW.destination,
  async onComplete(character, route) {
    if (editingCharacter) {
      await loadWalkArt(character);
      await audio.resume();
      state.character = character;
      state.phase = "game";
      gameScreen.hidden = false;
      input.reset();
      canvas.focus();
      persistProgress();
    } else await enterDestination(character, route);
  },
  async onCancel() {
    // Editing may evict the original instrument from the bounded image cache.
    // Restore its frames before making the unchanged saved character visible.
    if (editingCharacter) {
      try { await loadWalkArt(state.character); }
      catch { document.querySelector('#character-error').textContent = '角色圖片載入失敗，請再按一次取消修改。'; return; }
    }
    creator.close();
    input.reset();
    if (editingCharacter) { void audio.resume(); state.phase = "game"; gameScreen.hidden = false; lastSavedAt=performance.now(); canvas.focus(); }
    else { state.phase = "title"; titleScreen.hidden = false; titleScreen.classList.remove("fading"); startButton.disabled = false; playButton.disabled = false; startButton.focus(); }
  },
});
startButton.addEventListener("click", async () => {
  if (state.phase !== "title") return;
  state.phase = "transition";
  startButton.disabled = true;
  playButton.disabled = true;
  toggleButton.disabled = true;
  try {
  await audio.resume();
  // Keep the title song through character creation; game entry stops it.
  titleScreen.hidden = true;
  if (supportsWalk(state.character)) await enterDestination(state.character, {destination: CHARACTER_FLOW.destination});
  else {
    state.phase = "character";
    editingCharacter = false;
    if (localTestSelector) localTestSelector.hidden = true;
    creator.open(readCharacterForConfirmation(storage) || state.character);
  }
  } catch (error) {
    state.phase = "title";
    titleScreen.hidden = false;
    startButton.disabled = playButton.disabled = false;
    let message = document.querySelector('#character-load-error');
    if (!message) { message = document.createElement('p'); message.id = 'character-load-error'; message.setAttribute('role','alert'); startButton.after(message); }
    message.textContent = '角色圖片載入失敗，請再按一次開始遊戲。';
    startButton.focus();
  }
});
function characterEditAvailable() {
  return state.phase === "game" && !state.roomTransition.active && !state.tutorialOpen && !state.dialogue.active
    && !["preparing","testing","reference-playing"].includes(state.door04.status)
    && !["testing","completion-spinning","completion-hold","launching"].includes(state.door05.status)
    && !["relay-playing","relay-replay","reference-playing","reconstructing"].includes(state.door06.status)
    && !state.door06.endingTriggered;
}
editCharacter.addEventListener("click",async ()=>{
  if (!characterEditAvailable()) return;
  await leaveGameFullscreen();
  input.reset();
  editingCharacter = true;
  state.phase = "character";
  gameScreen.hidden = true;
  try { await audio.suspendForCharacter(); }
  catch { state.phase = "game"; gameScreen.hidden = false; saveStatus.textContent = "暫時無法暫停音訊，請稍後再修改角色。"; canvas.focus(); return; }
  creator.open(state.character, {edit:true});
});

const roomHelp=createRoomHelp(()=>state,input,persistProgress,storage);
const sequenceControls=createSequenceControls(()=>state,audio,input);
const pointerControls=installPointerControls(canvas,()=>state,input,{
  minimumCssHitSize: mobileRoom1Enabled ? 44 : 0,
});
const fullscreenTools=createFullscreenTools({
  gameScreen,
  actions:roomHelp.actions,
  canvas,
  interactionPanel:pointerControls.element,
  patchGuide:document.querySelector('#door03-patch-guide'),
  room04Transport:document.getElementById('room04-transport'),
  sequenceTransport:sequenceControls.element,
  roomProgress:document.querySelector('#room-progress-panel'),
});
let mobileRoom1Ui = null;
if (mobileRoom1Enabled) {
  import("../mobile/room1-ui.js?v=9").then(({ installMobileRoom1Ui }) => {
    mobileRoom1Ui = installMobileRoom1Ui({
      canvas,
      gameScreen,
      getState: () => state,
    });
  }).catch((error) => console.error("[Fugata Mobile] Room 1 UI failed to initialize:", error));
}

let previousTime = performance.now();
let animationFrameId = null;

function frame(now) {
  const deltaTime = Math.min((now - previousTime) / 1000, 0.05);
  state.door05.rafIntervalMs = now - previousTime;
  previousTime = now;
  updateGame(state, input, audio, deltaTime, { mobileRoom1: mobileRoom1Enabled });
  if (state.phase === "game") {
    renderer.render(state);
    gameUi.render(state);
    pointerControls.render(state);
    door03PatchGuide.render(state);
    roomProgress.render(state);
    roomTransition.render(state);
    mobileRoom1Ui?.render(state);
    if (state.door06.endingTriggered) gameScreen.classList.add("ending-out");
    if (state.door06.endingTransitionReady && !endingController.isVisible()) {
      state.phase = "ending";
      state.ending.visible = true;
      void leaveGameFullscreen();
      gameScreen.hidden = true;
      endingController.show();
    }
  }
  document.querySelector('#character-art-notice').textContent = state.character?.loadNotice || '';
  editCharacter.disabled = !characterEditAvailable();
  editCharacter.title = editCharacter.disabled ? "請等目前的播放、測試或轉場完成" : "修改暱稱與外觀，保留目前進度";
  if (state.phase === "game" && now-lastSavedAt > 1000) { persistProgress(); lastSavedAt = now; }
  roomHelp.render(state);
  sequenceControls.render(state);
  fullscreenTools.render(state);
  syncDiagnosticState();
  animationFrameId = requestAnimationFrame(frame);
}

function restartChapter() {
  audio.stopAll();
  endingController.hide();
  state = createInitialState();
  state.ui.reducedMotion = reducedMotionEnabled;
  state.character = loadCharacter(storage);
  resumedProgress = null;
  hasEnteredGame = false;
  if (!localTestEnabled) { try { backupBeforeWrite(storage,PROGRESS_KEY,null); storage.removeItem(PROGRESS_KEY); } catch {} }
  audio.publishAssetStates();
  titleScreen.hidden = false;
  titleScreen.classList.remove("fading");
  gameScreen.hidden = true;
  gameScreen.classList.remove("ending-out");
  chapterComplete.hidden = true;
  startButton.disabled = false;
  playButton.disabled = false;
  toggleButton.disabled = true;
  toggleButton.textContent = "暫停";
  fullTrack.dataset.everPlayed = "false";
  titleError.textContent = "";
  titleAudioStatus.textContent = "完整歌曲：已就緒";
  renderer.render(state);
  gameUi.render(state);
  door03PatchGuide.reset();
  door03PatchGuide.render(state);
  roomProgress.render(state);
  roomTransition.render(state);
  syncDiagnosticState();
  startButton.focus();
}

async function openLocalTestRoom(room, { resumeAudio = true } = {}) {
  if (!localTestEnabled) return false;
  audio.stopAll();
  endingController.hide();
  state = createLocalTestRoomState(room, Math.random, {
    room03GateState: room === 3 ? autoRoom03GateState : null,
    room04State: room === 4 ? autoRoom04State : null,
    transitionState: room === 2 ? autoTransitionState : null,
  });
  state.ui.reducedMotion = reducedMotionEnabled;
  state.character = fixedCharacterDraft(readCharacterForConfirmation(storage) || {nickname:'旅人'});
  await loadWalkArt(state.character);

  audio.publishAssetStates();
  if (resumeAudio) await audio.resume();
  titleScreen.hidden = true;
  titleScreen.classList.remove("fading");
  gameScreen.hidden = false;
  gameScreen.classList.remove("ending-out");
  chapterComplete.hidden = true;
  startButton.disabled = true;
  playButton.disabled = true;
  toggleButton.disabled = true;
  door03PatchGuide.reset();
  renderer.render(state);
  gameUi.render(state);
  door03PatchGuide.render(state);
  roomProgress.render(state);
  roomTransition.render(state);
  syncDiagnosticState();
  localTestSelector.hidden = true;
  canvas.focus();
  return true;
}

const room04Transport = document.getElementById("room04-transport");
const room04Toggle = document.getElementById("room04-toggle");
const room04Replay = document.getElementById("room04-replay");
for (const [button, restart] of [[room04Toggle, false], [room04Replay, true]]) {
  button.addEventListener("click", () => {
    if (state.phase !== "game" || state.gameProgress.currentRoom !== 4) return;
    controlDoor04Reference(state, audio, restart);
    canvas.focus({ preventScroll: true });
  });
}
function syncDiagnosticState() {
  gameScreen.dataset.room = state.gameProgress.currentRoom;
  const characterCache=walkCacheInfo();
  gameScreen.dataset.characterCacheSize=String(characterCache.size);
  gameScreen.dataset.characterCacheLimit=String(characterCache.limit);
  room04Transport.hidden = state.phase !== "game" || state.gameProgress.currentRoom !== 4;
  const playback = state.door04.referencePlaybackStatus;
  room04Toggle.textContent = playback === "playing" ? "暫停參考混音" : playback === "paused" ? "繼續參考混音" : "播放參考混音";
  document.getElementById("room04-playback-status").textContent = ({playing:"播放中",paused:"已暫停",completed:"已完整聽完",idle:"尚未播放"})[playback] ?? playback;
  room04Toggle.disabled = room04Replay.disabled = state.tutorialOpen || state.dialogue.active || ["preparing", "testing", "rejected", "opening", "open"].includes(state.door04.status);

  const carried = heldFragment(state);
  const nearby = state.phase === "game" && state.gameProgress.currentRoom === 1 ? nearestPedestal(state) : null;
  const nearbyEcho = state.phase === "game" && state.gameProgress.currentRoom === 2 ? nearestEchoTower(state) : null;
  const nearSubject = state.phase === "game" && state.gameProgress.currentRoom === 2 ? nearestSubjectTerminal(state) : null;
  const preview = state.fragments.find((fragment) => fragment.id === state.audio.activePreviewId) ?? null;
  const echoPreview = state.echoTowers.find((tower) => tower.id === state.audio.activePreviewId) ?? null;
  const selectedEcho = state.echoTowers.find((tower) => tower.id === state.door02.selectedTowerId) ?? null;
  const nearbyModule = state.phase === "game" && state.gameProgress.currentRoom === 3
    ? nearestDoor03Module(state)
    : null;
  const nearbyPort = state.phase === "game" && state.gameProgress.currentRoom === 3
    ? nearestDoor03Port(state)
    : null;
  const selectedDoor03Output = door03PortById(state, state.door03.selectedOutputPortId);
  const nearbyDoor04Voice = state.phase === "game" && state.gameProgress.currentRoom === 4
    ? nearestDoor04Pedestal(state)
    : null;
  const nearbyDoor04Slot = state.phase === "game" && state.gameProgress.currentRoom === 4
    ? nearestDoor04Slot(state)
    : null;
  const heldDoor04 = heldDoor04Voice(state);
  const nearbyDoor05Terminal = state.phase === "game" && state.gameProgress.currentRoom === 5
    ? nearestDoor05Terminal(state)
    : null;
  const nearbyDoor05Node = state.phase === "game" && state.gameProgress.currentRoom === 5
    ? nearestDoor05Node(state)
    : null;
  const nearbyDoor06Relay = state.phase === "game" && state.gameProgress.currentRoom === 6
    ? nearestDoor06Relay(state)
    : null;
  const nearbyDoor06Memory = state.phase === "game" && state.gameProgress.currentRoom === 6
    ? nearestDoor06Memory(state)
    : null;
  const activeDoor05Phase = door05Phase(state.door05.activePhaseId);
  const door03Loop = audio.getDoor03LoopDiagnostics?.() ?? {};
  const door05Diagnostics = audio.getDoor05Diagnostics?.() ?? {};
  const activeRoomCopy = roomCopy(state.gameProgress.currentRoom);
  const nextTitle = [1, 2, 3].includes(state.gameProgress.currentRoom)
    ? `Room ${state.gameProgress.currentRoom}｜${activeRoomCopy.action}\n${activeRoomCopy.concept}`
    : `${activeRoomCopy.ordinal}｜${activeRoomCopy.action}\n${activeRoomCopy.concept}`;
  roomTitle.textContent = nextTitle;
  canvas.setAttribute("aria-label", nextTitle.replace("\n", "｜"));
  doorNumber.textContent = `${String(state.gameProgress.currentRoom).padStart(2, "0")} / 06`;
  Object.assign(canvas.dataset, {
    characterAnimationFrame: supportsWalk(state.character) ? walkFrame(state) : -1,
    characterAnimationSupported: supportsWalk(state.character),
    characterArtSet: state.character?.artSet || 'legacy',
    characterRenderedDirection: isTrialCharacter(state.character) ? 'front' : (state.player.facing || 'front'),
    characterNickname: state.character?.nickname || "",
    characterOutfit: state.character?.outfit || "",
    characterInstrument: state.character?.instrument || "none",
    instrumentVisible: String(instrumentVisible(state)),
    playerFacing: state.player.facing || "front",
    phase: state.phase,
    localTestMode: String(localTestEnabled),
    localTestRoom: localTestEnabled ? String(state.gameProgress.currentRoom) : "disabled",
    playerX: state.player.x.toFixed(2),
    playerY: state.player.y.toFixed(2),
    dialogueActive: String(state.dialogue.active),
    dialogueSequence: state.dialogue.sequenceId ?? "none",
    dialogueIndex: String(state.dialogue.index),
    nearbyFragment: nearby?.displayLabel ?? "none",
    nearbyEcho: nearbyEcho?.displayLabel ?? "none",
    nearSubject: String(Boolean(nearSubject)),
    heldFragment: carried?.displayLabel ?? "none",
    heldCount: String(state.gameProgress.inventory.length),
    doorStatus: state.door01.status,
    doorProgress: state.door01.openingProgress.toFixed(3),
    wrongAttempts: String(state.door01.wrongAttempts),
    door02Status: state.door02.status,
    door02Progress: state.door02.openingProgress.toFixed(3),
    door02WrongAttempts: String(state.door02.wrongAttempts),
    cableState: state.door02.cableState,
    selectedEcho: selectedEcho?.displayLabel ?? "none",
    echoConnected: String(Boolean(state.door02.connectedTowerId)),
    currentRoom: String(state.gameProgress.currentRoom),
    currentDoor: String(state.gameProgress.currentDoor),
    doorsCompleted: String(state.gameProgress.doorsCompleted),
    subjectIdentified: String(state.gameProgress.flags.subjectIdentified),
    answerIdentified: String(state.gameProgress.flags.answerIdentified),
    patchCompleted: String(state.gameProgress.flags.patchCompleted),
    voicesOrdered: String(state.gameProgress.flags.voicesOrdered),
    rhythmActivated: String(state.gameProgress.flags.rhythmActivated),
    fragmentAssets: state.audio.fragmentAssetsStatus,
    loadedFragments: String(state.audio.loadedFragments),
    door02Assets: state.audio.door02AssetsStatus,
    loadedDoor02: String(state.audio.loadedDoor02),
    door03Assets: state.audio.door03AssetsStatus,
    loadedDoor03: String(state.audio.loadedDoor03),
    door03Status: state.door03.status,
    door03CurrentStep: String(state.door03.currentStep),
    door03Progress: state.door03.openingProgress.toFixed(3),
    door03WrongAttempts: String(state.door03.wrongAttempts),
    connections: String(state.door03.connectedEdges.length),
    selectedPatchOutput: selectedDoor03Output?.moduleName ?? "none",
    nearbyModule: nearbyModule?.displayName ?? "none",
    nearbyPort: nearbyPort ? `${nearbyPort.moduleName} ${nearbyPort.type}` : "none",
    door03LoopActive: String(Boolean(door03Loop.active)),
    door03LoopStage: door03Loop.stage ?? "none",
    door03LoopRetired: String(door03Loop.retiredSourceCount ?? 0),
    door03SuccessPlaying: String(state.audio.door03SuccessPlaying),
    door04Assets: state.audio.door04AssetsStatus,
    loadedDoor04: String(state.audio.loadedDoor04),
    door04Status: state.door04.status,
    door04TestStatus: state.door04.testStatus,
    voicesPlaced: String(door04PlacedCount(state)),
    heldDoor04Voice: heldDoor04?.displayLabel ?? "none",
    nearbyDoor04Voice: nearbyDoor04Voice?.displayLabel ?? "none",
    nearbyDoor04Slot: nearbyDoor04Slot ? `Entry ${["I", "II", "III", "IV"][nearbyDoor04Slot.index]}` : "none",
    nearDoor04Reference: String(state.gameProgress.currentRoom === 4 && nearDoor04Reference(state)),
    nearDoor04Test: String(state.gameProgress.currentRoom === 4 && nearDoor04Test(state)),
    door04ActiveEntry: String(state.door04.activeEntryCount),
    door04ReferencePlaying: String(state.audio.door04ReferencePlaying),
    door04TestPlaying: String(state.audio.door04TestPlaying),
    door04SuccessPlaying: String(state.audio.door04SuccessPlaying),
    door05Assets: state.audio.door05AssetsStatus,
    loadedDoor05: String(state.audio.loadedDoor05),
    door05Status: state.door05.status,
    door05TestStatus: state.door05.testStatus,
    door05Phase: activeDoor05Phase?.displayName ?? "none",
    door05SelectedCount: String(door05SelectedAccents(state).length),
    door05CompletedPhases: String(state.door05.completedPhaseIds.length),
    door05TestStep: String(state.door05.testStep),
    door05TestBar: String(state.door05.testBarIndex + 1),
    door05LastRenderedStep: String(state.door05.lastRenderedStep),
    door05Browser: navigator.userAgent,
    door05AudioContextState: door05Diagnostics.contextState ?? "unavailable",
    door05BaseLatency: String(door05Diagnostics.baseLatency ?? "unavailable"),
    door05OutputLatency: String(door05Diagnostics.outputLatency ?? "unavailable"),
    door05OutputTimestampSupported: String(
      Boolean(door05Diagnostics.outputTimestampSupported),
    ),
    door05TestStartAt: String(door05Diagnostics.testStartAt ?? "none"),
    door05AudibleContextTime: String(
      door05Diagnostics.audibleContextTime ?? state.door05.audibleContextTime ?? "none",
    ),
    door05Elapsed: String(door05Diagnostics.actualElapsed ?? state.door05.testElapsed),
    door05CurrentStep: String(state.door05.testStep),
    door05RafIntervalMs: String(state.door05.rafIntervalMs ?? "none"),
    door05VisualSyncOffsetMs: String(door05Diagnostics.visualSyncOffsetMs ?? 0),
    door05ClockSource: door05Diagnostics.clockSource ?? state.door05.testClockSource,
    door05WheelAngle: String(state.door05.wheelAngle),
    door05CompletionSpinActive: String(state.door05.completionSpinActive),
    door05CompletionSpinCompleted: String(state.door05.completionSpinCompleted),
    nearbyDoor05Terminal: nearbyDoor05Terminal
      ? door05Phase(nearbyDoor05Terminal.phaseId)?.displayName ?? "Terminal"
      : "none",
    nearbyDoor05Node: nearbyDoor05Node ? String(nearbyDoor05Node.stepNumber) : "none",
    nearDoor05Test: String(state.gameProgress.currentRoom === 5 && nearDoor05Test(state)),
    nearDoor05Final: String(state.gameProgress.currentRoom === 5 && nearDoor05Final(state)),
    door05ReferencePlaying: String(Boolean(state.audio.door05ReferencePlayingPhaseId)),
    door05ReferenceStep: String(state.door05.referenceStep),
    door05TestPlaying: String(state.audio.door05TestPlaying),
    door05SuccessPlaying: String(state.audio.door05SuccessPlaying),
    door06Assets: state.audio.door06AssetsStatus,
    loadedDoor06: String(state.audio.loadedDoor06),
    door06Status: state.door06.status,
    door06Stage: String(state.door06.stage),
    door06FinalReferenceCompleted: String(state.door06.finalReferenceCompleted),
    door06Relays: String(state.door06.activatedRelayCount),
    door06CoreUnlocked: String(state.door06.coreUnlocked),
    door06WrongAttempts: String(state.door06.wrongAttempts),
    nearbyDoor06Relay: nearbyDoor06Relay?.displayName ?? "none",
    nearbyDoor06Memory: nearbyDoor06Memory?.displayLabel ?? "none",
    nearDoor06FinalReference: String(
      state.gameProgress.currentRoom === 6 && nearDoor06FinalReference(state),
    ),
    door06PreviewKind: state.audio.door06PreviewKind ?? "none",
    door06SuccessStatus: state.audio.door06SuccessStatus,
    door06SuccessPlaying: String(state.audio.door06SuccessPlaying),
    reconstructionCompleted: String(state.gameProgress.flags.reconstructionCompleted),
    door06ExitOpen: String(state.door06.exitOpen),
    endingTriggered: String(state.door06.endingTriggered),
    endingVisible: String(state.ending.visible),
    successLoopsPlaying: String(state.audio.successLoopsPlaying),
    previewPlaying: state.audio.activePreviewId ? "true" : "false",
    previewKind: state.audio.activePreviewKind ?? "none",
    previewFragment: preview?.displayLabel ?? "none",
    previewEcho: echoPreview?.displayLabel ?? "none",
    previewLevel: state.audio.previewLevel.toFixed(3),
    contextHintTarget: safeContextHintTarget(state),
    contextHintVisible: String(state.ui.contextHint.visible),
    contextHintCompact: String(state.ui.contextHint.compactVisible),
    contextHintAlpha: state.ui.contextHint.alpha.toFixed(3),
    audioNotice: state.ui.audioNotice.status,
  });
}

function refreshAudioNotice() {
  const statuses = [
    state.audio.fragmentAssetsStatus,
    state.audio.door02AssetsStatus,
    state.audio.successLoopStatus,
    state.audio.door03AssetsStatus,
    state.audio.door04AssetsStatus,
    state.audio.door05AssetsStatus,
    state.audio.door06AssetsStatus,
  ];
  if (statuses.includes("Error")) setAudioNotice(state, "Error");
  else if (statuses.every((status) => status === "Ready" || status === "Partial")) {
    setAudioNotice(state, "Ready");
  }
  else setAudioNotice(state, "Loading");
}

function safeContextHintTarget(state) {
  const targetId = state.ui.contextHint.targetId;
  if (!targetId) return "none";
  if (targetId === state.door01.id) return "Door 1";
  if (targetId === state.door02.id) return "Door 2";
  if (targetId === state.subjectTerminal.id) return "主題終端";
  const module = state.door03Modules.find((item) => item.id === targetId);
  if (module) return module.displayName;
  const port = door03PortById(state, targetId);
  if (port) return `${port.moduleName} ${port.type === "input" ? "Input" : "Output"}`;
  if (targetId === state.door04ReferenceConsole.id) return "Reference Console";
  if (targetId === state.door04TestConsole.id) return "Test Console";
  if (targetId === state.door05TestConsole.id) return "Rhythm Test";
  if (targetId === state.door05FinalConsole.id) return "Final Rhythm Drive";
  if (targetId === state.door03PatchMonitor.id) return "Patch Monitor";
  if (targetId === state.door06FinalReferenceConsole.id) return "Final Reference";
  const door06Relay = state.door06Relays.find((item) => item.id === targetId);
  if (door06Relay) return door06Relay.displayName;
  const door06Memory = state.door06Memories.find((item) => item.id === targetId);
  if (door06Memory) return door06Memory.displayLabel;
  const door05Terminal = state.door05Terminals.find((item) => item.id === targetId);
  if (door05Terminal) return `${door05Phase(door05Terminal.phaseId)?.displayName ?? "Rhythm"} Terminal`;
  const door05Node = state.door05Nodes.find((item) => item.id === targetId);
  if (door05Node) return `Rhythm Node ${door05Node.stepNumber}`;
  const slot = state.door04Slots.find((item) => item.id === targetId);
  if (slot) return `Entry ${["I", "II", "III", "IV"][slot.index]}`;
  return state.fragments.find((fragment) => fragment.id === targetId)?.displayLabel
    ?? state.echoTowers.find((tower) => tower.id === targetId)?.displayLabel
    ?? state.door04Capsules.find((voice) => voice.id === targetId)?.displayLabel
    ?? "interaction";
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function audioStatusLabel(status) {
  return ({
    Loading: "載入中……",
    Waiting: "等待中",
    Ready: "已就緒",
    Partial: "部分就緒",
    Error: "發生錯誤",
    Playing: "播放中",
    Paused: "已暫停",
    Complete: "播放完成",
  })[status] ?? status;
}

animationFrameId = requestAnimationFrame(frame);

