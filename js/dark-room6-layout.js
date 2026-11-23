import {darkRoom1Projection,darkRoom1FloorProjection,darkRoom1Point,darkRoom1Walls} from './dark-room1-layout.js';
export const DARK_ROOM6=Object.freeze({width:2520,height:1080,worldOffsetX:4430,
 assetRoot:'assets/art/fugata/room06/dark-v1/',entry:{x:4510,y:260},
 relays:[480,820,1160,1500,1840].map(x=>({x,y:700})),core:{x:1160,y:950},reference:{x:660,y:950},
 memories:[1590,1830,2070].map(x=>({x,y:950})),
 characters:{leroy:{x:350,y:970},pinxin:{x:2250,y:965}},bounds:[4488,5218,70,569]});
export function isDarkRoom6State(s){return s.gameProgress.currentRoom===6&&s.room06Presentation?.kind==='dark-v1';}
export function darkRoom6Projection(w,h){const p=darkRoom1Projection(w,h);return {...p,offsetX:p.offsetX-4430*p.scaleX};}
export function darkRoom6FloorProjection(scale=1){const p=darkRoom1FloorProjection(scale);return {...p,offsetX:p.offsetX-4430*p.scaleX};}
export {darkRoom1Point as darkRoom6Point};
export function darkRoom6ArtToWorld(p,scale=1){const f=darkRoom6FloorProjection(scale);return {x:(p.x-f.offsetX)/f.scaleX,y:(p.y-f.offsetY)/f.scaleY};}
export function configureDarkRoom6(s,{arrive=true}={}){
 Object.assign(s.room06Presentation??={},{kind:'dark-v1',sceneScale:1});syncDarkRoom6SceneScale(s,1);
 if(arrive)Object.assign(s.player,DARK_ROOM6.entry);
}
export function syncDarkRoom6SceneScale(s,scale){
 s.room06Presentation.sceneScale=scale;
 const core=darkRoom6ArtToWorld(DARK_ROOM6.core);
 Object.assign(s.door06Core,core);
 s.door06Relays.forEach((r,i)=>{Object.assign(r,darkRoom6ArtToWorld(DARK_ROOM6.relays[i]),{interactionRadius:80});
  r.cablePath=[{x:r.x,y:r.y+25},{x:r.x,y:350},{x:core.x,y:350},{x:core.x,y:core.y-20}];});
 s.door06Memories.forEach((m,i)=>Object.assign(m,darkRoom6ArtToWorld(DARK_ROOM6.memories[i]),{interactionRadius:76}));
 Object.assign(s.door06FinalReferenceConsole,darkRoom6ArtToWorld(DARK_ROOM6.reference),{interactionRadius:85});
}
export function darkRoom6MovementScale(s){return {x:.5,y:1.5*(s.room06Presentation.sceneScale||1)/.7};}
export function darkRoom6Walls(s){return darkRoom1Walls({room01Presentation:s.room06Presentation,door01:s.door06})
 .map(w=>({...w,x:w.x+4430,id:w.id.replace('room1','room6').replace('door-01','door-06')}));}
export function darkRoom6EndingTrigger(s){const scale=s.room06Presentation.sceneScale||1,p=a=>darkRoom6ArtToWorld(a,scale),a=p({x:2330,y:650}),b=p({x:2418,y:700});
 return {x:a.x,y:a.y,width:b.x-a.x,height:b.y-a.y};
}
export function darkRoom6DoorDepth(s){if(!isDarkRoom6State(s)||!s.door06.exitOpen)return 0;
 const p=darkRoom1Point(s.player,darkRoom6FloorProjection(s.room06Presentation.sceneScale||1));
 return p.x<2330||p.x>2418?0:Math.max(0,Math.min(1,(740-p.y)/90));}
export function darkRoom6HitSize(t){
 if(t.id.startsWith('door06-relay-'))return {width:65,height:350,centered:false};
 if(t.id.startsWith('door06-memory-'))return {width:50,height:300,centered:false};
 return {width:100,height:400,centered:false};
}
