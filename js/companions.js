// Room 5/6 authored event targets from LogicCode six-room integration.
// Room 1–4 retain their newer, independently authored behaviours.
import { ROOM05_ART, ROOM05_LANDMARKS, imageToWorld } from './room05-art.js';
import { ROOM06_ART, ROOM06_LANDMARKS, room06ImageToWorld } from './room06-art.js';
import { updateNpcAnimation } from './character/npc-v3.js';
export function companionTargets(state) {
 const room=state.gameProgress.currentRoom;
 if(room<5)return null;
 const view=room===5?ROOM05_ART.clip:ROOM06_ART.clip;
 const focus=room===5?(state.door05.testStatus==='testing'?ROOM05_LANDMARKS.test:ROOM05_LANDMARKS.terminals[0]):state.door06.stage==='relays'?ROOM06_LANDMARKS.relays[Math.min(4,state.door06.activeRelayIndex)]:ROOM06_LANDMARKS.core;
 const y=room===5?imageToWorld(768,832).y:room06ImageToWorld(768,848).y;
 const x=Math.max(view.x+230,Math.min(view.x+view.width-230,focus.x));
 return {leroy:{x:x-100,y},pinxin:{x:x+100,y:y+15}};
}
export function placeCompanions(state) {
 const targets=companionTargets(state);if(!targets)return;
 state.companions={room:state.gameProgress.currentRoom};
 for(const key of ['leroy','pinxin'])state.companions[key]={...targets[key],targetX:targets[key].x,targetY:targets[key].y,assetKey:key,facing:1};
}
export function updateCompanions(state,dt) {
 if(state.gameProgress.currentRoom<5)return;
 if(state.companions?.room!==state.gameProgress.currentRoom)placeCompanions(state);
 if(state.roomTransition.active)return;
 const targets=companionTargets(state);
 for(const key of ['leroy','pinxin']){
  const c=state.companions[key],t=targets[key],x=c.x,y=c.y,d=Math.hypot(t.x-x,t.y-y),step=Math.min(d,(key==='leroy'?100:76)*dt);
  c.targetX=t.x;c.targetY=t.y;if(d){c.x+=(t.x-x)/d*step;c.y+=(t.y-y)/d*step;}
  updateNpcAnimation(c,x,y,dt,state.player.x);
 }
}
