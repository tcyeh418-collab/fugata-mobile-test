import { restoreDoor04Ownership } from './door04.js?v=room04-movement-fixes-v6';
import { backupBeforeWrite } from './save-backups.js';
import { ROOM05_LANDMARKS } from './room05-art.js';
import { ROOM06_LANDMARKS } from './room06-art.js';
import { createInitialState } from './state.js?v=room01-theme-replay-v1';
export const PROGRESS_KEY = 'fugata.progress.v1';
// Explicit root allowlist keeps character, audio devices and renderer state out of chapter saves.
const KEYS = ['elapsedTime','gameProgress','player','door01','door02','door03','door04','door05','door06','roomTransition','fragments','echoTowers','door03Modules','door04Capsules','door04Slots','door05Nodes','door06Relays','door06Memories','dialogue','ui'];
const clone = value => JSON.parse(JSON.stringify(value));
export function progressSnapshot(state) {
 const data = Object.fromEntries(KEYS.map(key=>[key,clone(state[key])]));
 // AudioContext timestamps cannot survive a reload. Incomplete listening/testing must be replayed.
 if(data.door03.status==='previewing')data.door03.status='patching';
 const d4=data.door04;
 if(['reference-playing','preparing','testing'].includes(d4.status)){d4.status=d4.referenceCompleted?'arranging':'reference-ready';d4.testStatus='idle';d4.referencePlaybackStatus=d4.referenceCompleted?'completed':'idle';d4.testElapsed=0;}
 d4.sequenceRequest=0;d4.testProgress=0;d4.activeEntryCount=0;
 const d5=data.door05;
 if(d5.status==='testing'){d5.status='configuring';d5.testStatus='idle';d5.testElapsed=0;}
 d5.testStartAt=null;d5.referencePlayingPhaseId=null;d5.referenceStep=0;
 if(['completion-spinning','completion-hold'].includes(d5.status)) {d5.status='launching';d5.launchElapsed=0;d5.completionSpinActive=false;d5.completionSpinCompleted=true;}
 const d6=data.door06;
 if(['relay-playing','relay-replay'].includes(d6.status))d6.status='restoring';
 if(d6.status==='confirming'){d6.status='memory-ready';d6.selectedMemoryId=null;}
 if(d6.status==='reference-playing')d6.status=d6.memoriesUnlocked?'memory-ready':'reference-ready';
 d6.relayPlaybackStatus='idle';d6.playingRelayId=null;d6.finalReferencePlaying=false;
 for(const key of ['fragments','echoTowers','door03Modules','door04Capsules','door06Relays','door06Memories'])for(const item of data[key]){if('isPlaying'in item)item.isPlaying=false;if('playing'in item)item.playing=false;if('isInspecting'in item)item.isInspecting=false;}
 for(const room of [2,3,4,5,6]){const door=data[`door0${room}`];if(door?.completed)door.completionDialogueShown=true;}
 if(data.dialogue.active&&/^door0[2-6]-completion$/.test(data.dialogue.sequenceId??''))data.dialogue={...createInitialState(()=>.5).dialogue};
 data.ui.message=null; data.ui.completionMarker=null; data.ui.contextHint={...createInitialState(()=>.5).ui.contextHint};
 return {version:1,layout:'playthrough-v3',data};
}
export function saveProgress(storage,state) {
 // Keep the last stable side of a room transfer; never restore a half-black transition.
 if(state.roomTransition.active)return false;
 const serialized=JSON.stringify(progressSnapshot(state));
 const existing=storage.getItem(PROGRESS_KEY);
 if(existing){try{if(JSON.parse(existing).layout!=='playthrough-v3')backupBeforeWrite(storage,PROGRESS_KEY,serialized);}catch{backupBeforeWrite(storage,PROGRESS_KEY,serialized);}}
 storage.setItem(PROGRESS_KEY,serialized);return true;
}
export function loadProgress(storage) {
 try {
  const saved=JSON.parse(storage.getItem(PROGRESS_KEY));
  if(!saved||saved.version!==1||!saved.data)return null;
  const data=saved.data;
  if(!Number.isInteger(data.gameProgress?.currentRoom)||data.gameProgress.currentRoom<1||data.gameProgress.currentRoom>6||!Number.isFinite(data.player?.x)||!Number.isFinite(data.player?.y))return null;
  const state=createInitialState();
  for(const key of KEYS)if(data[key]!==undefined)state[key]=mergeKnown(state[key],data[key]);
  const defaults=createInitialState();
  // Geometry belongs to the current art, puzzle identity and progress belong to the save.
  for(const key of ['fragments','door04Capsules','door04Slots','door05Nodes','door06Relays','door06Memories']) {
   state[key]=state[key].map(item=>{
    const layout=['fragments','door04Capsules'].includes(key)?defaults[key].find(d=>d.pedestalId===item.pedestalId):key==='door06Memories'?defaults[key][state[key].indexOf(item)]:defaults[key].find(d=>d.id===item.id || (d.stepNumber && d.stepNumber===item.stepNumber));
    if(!layout)return item;
    for(const field of ['x','y','radius','interactionRadius','cablePath','originalPosition','angle','socketY','width','height'])if(field in layout)item[field]=clone(layout[field]);
    if(key==='door04Capsules')item.displayLabel='音匣 '+['甲','乙','丙','丁'][defaults[key].findIndex(d=>d.pedestalId===item.pedestalId)];
    return item;
   });
  }
  if(!saved.layout&&state.gameProgress.currentRoom>=5)Object.assign(state.player,state.gameProgress.currentRoom===5?ROOM05_LANDMARKS.entry:ROOM06_LANDMARKS.entry);
  // New fields receive current defaults; serialize through the same transient-state cleanup.
  const clean=progressSnapshot(state).data;
  for(const key of KEYS)state[key]=clean[key];
  restoreDoor04Ownership(state);
  state.player.radius=13;state.player.speed=205;
  state.roomTransition={...createInitialState().roomTransition,completedFromRooms:state.roomTransition.completedFromRooms};
  state.phase='title';return state;
 } catch {return null;}
}
function mergeKnown(base,raw) {
 if(Array.isArray(base))return Array.isArray(raw)?clone(raw):base;
 if(base&&typeof base==='object'){if(!raw||typeof raw!=='object'||Array.isArray(raw))return base;const out={...base};for(const key of Object.keys(base))if(Object.hasOwn(raw,key))out[key]=mergeKnown(base[key],raw[key]);return out;}
 if(base===null)return raw;
 return typeof raw===typeof base?raw:base;
}
