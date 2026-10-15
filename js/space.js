import {updateNpcAnimation} from './character/npc-v3.js';
import {circleTouchesRect,moveWithCollisions} from './collision.js';
import {ROOM04_SPRITE_LAYOUT,ROOM04_EQUIPMENT_COLLIDERS,ROOM04_NAVIGATION_BOUNDS} from './room04-layout.js?v=room04-movement-fixes-v6';
import {ROOM05_LANDMARKS,ROOM05_RING_CENTER} from './room05-art.js';
import {ROOM06_LANDMARKS} from './room06-art.js';
// Ground occupancy only. Backgrounds 5/6 cannot be depth sorted as separate objects.
const base=(id,p,w,h,offset=0)=>({id:'base-'+id,owner:id,x:p.x-w/2,y:p.y+offset-h/2,width:w,height:h});
export function roomFootprints(s){
 switch(s.gameProgress.currentRoom){
 case 1:{
  const device=s.room01ThemeReplay,footprint=device?.footprint;
  return [
   ...s.fragments.map(f=>base(f.id,f.originalPosition,30,16,8)),
   ...(device&&footprint?[base(device.id,device,footprint.width,footprint.height,footprint.offsetY)]:[]),
  ];
 }
 case 2:return [base(s.subjectTerminal.id,s.subjectTerminal,44,20,10),...s.echoTowers.map(t=>base(t.id,t,38,20,10))];
 case 3:return s.door03Modules.map(m=>base(m.id,{x:m.x,y:m.y+m.height/2},Math.max(24,m.width*.55),18,-2));
 case 4:return ROOM04_EQUIPMENT_COLLIDERS.map(w => {
  const voice=s.door04Capsules.find(v=>v.pedestalId===w.owner);
  return voice?{...w,owner:voice.id}:w;
 });
 case 5:return [
  {id:'room5-building',x:3820,y:58,width:340,height:110},
  base('ring-core',ROOM05_RING_CENTER,82,32,-22),
  ...s.door05Terminals.map(t=>base(t.id,t,38,24,12)),
  ...s.door05Relays.map(t=>base(t.id,t,32,22,12)),
  base(s.door05TestConsole.id,s.door05TestConsole,50,30,20),base(s.door05FinalConsole.id,s.door05FinalConsole,68,28,24)];
 case 6:return [base('core',ROOM06_LANDMARKS.core,160,64,45),...s.door06Relays.map(r=>base(r.id,r,36,22,21)),base(s.door06FinalReferenceConsole.id,s.door06FinalReferenceConsole,48,26,24),...s.door06Memories.map(m=>base(m.id,m,22,18,32))];
 default:return [];
 }
}
export const ROOM_BOUNDS={1:[58,800,65,574],2:[850,1540,65,565],3:[1620,2500,70,565],4:ROOM04_NAVIGATION_BOUNDS,5:[3525,4420,188,565],6:[4480,5380,145,580]};

// Room 5's painted floor narrows toward both doorways. Keeping only a
// rectangular limit lets actors stand over the side architecture even though
// their feet are still technically inside the room. These measured bands
// follow the visible floor seams while preserving both doorway approaches.
const ROOM05_FLOOR_BANDS=Object.freeze([
 [3525,312,388],[3560,290,415],[3620,250,480],[3700,215,530],
 [3800,190,560],[3900,178,570],[4050,175,570],[4180,190,555],
 [4280,225,515],[4360,280,450],[4420,312,388],
]);
function interpolateRoom05Band(x,index){
 const first=ROOM05_FLOOR_BANDS[0],last=ROOM05_FLOOR_BANDS.at(-1);
 if(x<=first[0])return first[index];
 if(x>=last[0])return last[index];
 for(let i=1;i<ROOM05_FLOOR_BANDS.length;i++){
  const right=ROOM05_FLOOR_BANDS[i];if(x>right[0])continue;
  const left=ROOM05_FLOOR_BANDS[i-1],mix=(x-left[0])/(right[0]-left[0]);
  return left[index]+(right[index]-left[index])*mix;
 }
 return last[index];
}
export function roomVerticalRange(room,x){
 const [, , top,bottom]=ROOM_BOUNDS[room];
 if(room!==5)return {minY:top,maxY:bottom};
 return {
  minY:Math.max(top,interpolateRoom05Band(x,1)),
  maxY:Math.min(bottom,interpolateRoom05Band(x,2)),
 };
}
export function legalPoint(point,walls,room,radius=13){
 const [l,r]=ROOM_BOUNDS[room],{minY,maxY}=roomVerticalRange(room,point.x);
 return point.x>=l&&point.x<=r&&point.y>=minY&&point.y<=maxY&&!walls.some(w=>circleTouchesRect({...point,radius},w));
}
export function nearestGround(point,walls,room,radius=13){
 if(legalPoint(point,walls,room,radius))return {x:point.x,y:point.y};
 // Prefer the minimum correction (including straight boundary clamping).
 // The old radial search picked its first eastward sample every frame when
 // navigation bounds disagreed by a fraction of a pixel with a physical wall.
 const [l,r]=ROOM_BOUNDS[room],boundedX=Math.max(l,Math.min(r,point.x));
 const {minY,maxY}=roomVerticalRange(room,boundedX);
 const bounded={x:boundedX,y:Math.max(minY,Math.min(maxY,point.y))};
 if(legalPoint(bounded,walls,room,radius))return bounded;
 const candidates=walls.filter(w=>circleTouchesRect({...bounded,radius},w)).flatMap(w=>[
  {x:w.x-radius,y:bounded.y},{x:w.x+w.width+radius,y:bounded.y},
  {x:bounded.x,y:w.y-radius},{x:bounded.x,y:w.y+w.height+radius},
 ]).filter(p=>legalPoint(p,walls,room,radius));
 candidates.sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));
 if(candidates.length)return candidates[0];
 // Used only to recover invalid old positions/targets, never for click-to-move.
 for(let ring=8;ring<=1000;ring+=8)for(let i=0;i<32;i++){
  const a=i*Math.PI/16,p={x:point.x+Math.cos(a)*ring,y:point.y+Math.sin(a)*ring};
  if(legalPoint(p,walls,room,radius))return p;
 }
 return null;
}
export function recoverPlayer(s,walls){
 if(s.roomTransition.active)return;
 const room=s.gameProgress.currentRoom;
 if(!legalPoint(s.player,walls,room,s.player.radius)){
  const p=nearestGround(s.player,walls,room,s.player.radius);if(p)Object.assign(s.player,p);
 }
}
export function castFor(s){return s.gameProgress.currentRoom<5?s[`room0${s.gameProgress.currentRoom}Characters`]:s.companions;}
export function constrainCast(s,walls,previous,deltaTime){
 const cast=castFor(s);if(!cast)return;
 for(const key of ['leroy','pinxin']){
  const c=cast[key];if(!c)continue;
  const target=nearestGround({x:c.targetX??c.x,y:c.targetY??c.y},walls,s.gameProgress.currentRoom,14);
  if(target){c.targetX=target.x;c.targetY=target.y;}
  const old=previous?.[key];
  if(old&&legalPoint(old,walls,s.gameProgress.currentRoom,14)){
   const dx=c.x-old.x,dy=c.y-old.y,d=Math.hypot(dx,dy);
   const actor={x:old.x,y:old.y,radius:14,speed:d};
   // Small substeps prevent crossing a thin footprint when authored motion is abrupt.
   const steps=Math.max(1,Math.ceil(d/5));for(let i=0;i<steps;i++)moveWithCollisions(actor,{x:dx,y:dy},1/steps,walls);
   c.x=actor.x;c.y=actor.y;
  }
  if(!legalPoint(c,walls,s.gameProgress.currentRoom,14)){const p=nearestGround(c,walls,s.gameProgress.currentRoom,14);if(p)Object.assign(c,p);}
  if(s.gameProgress.currentRoom===1&&old){
   const focusX=c.x+(c.facing||1)*20;
   c.animation=old.animation?{...old.animation}:undefined;
   updateNpcAnimation(c,old.x,old.y,deltaTime,focusX);
  }
  if(c.animation&&old&&Math.hypot(c.x-old.x,c.y-old.y)<.02){c.animation.moving=false;c.animation.distance=0;}
 }
}
