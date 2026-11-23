import {darkRoom1Projection,darkRoom1FloorProjection,darkRoom1Point,darkRoom1Walls} from './dark-room1-layout.js';
export const DARK_ROOM4=Object.freeze({width:2520,height:1080,worldOffsetX:2510,assetRoot:'assets/art/fugata/room04/dark-v1/',
 entry:{x:2590,y:400},stations:[{x:620,y:770},{x:1820,y:770},{x:530,y:950},{x:1900,y:950}],
 reference:{x:1080,y:715},loom:{x:1260,y:890},test:{x:2110,y:850},slotXs:[1005,1175,1345,1515],slotY:770,
 characters:{leroy:{x:760,y:960},pinxin:{x:2250,y:960}},bounds:[2568,3298,70,569]});
export function isDarkRoom4State(s){return s.gameProgress.currentRoom===4&&s.room04Presentation?.kind==='dark-v1';}
export function darkRoom4Projection(w,h){const p=darkRoom1Projection(w,h);return {...p,offsetX:p.offsetX-2510*p.scaleX};}
export function darkRoom4FloorProjection(scale=1){const p=darkRoom1FloorProjection(scale);return {...p,offsetX:p.offsetX-2510*p.scaleX};}
export {darkRoom1Point as darkRoom4Point};
export function darkRoom4ArtToWorld(p,scale=1){const f=darkRoom4FloorProjection(scale);return {x:(p.x-f.offsetX)/f.scaleX,y:(p.y-f.offsetY)/f.scaleY};}
export function configureDarkRoom4(s,{arrive=true}={}){
 if(s.door04.testMode!=='quartet-review'){
  Object.assign(s.door04,{testMode:'quartet-review',reviewResults:[null,null,null,null],confirmedEntryCount:s.door04.completed?4:0,testEntryCount:4,stage:s.door04.completed?'complete':'quartet'});
  if(!s.door04.completed&&['locked','reference-ready','arranging'].includes(s.door04.status))s.door04.status='arranging';
 }
 Object.assign(s.room04Presentation??={},{kind:'dark-v1',sceneScale:1});syncDarkRoom4SceneScale(s,1);
 for(const [key,p]of Object.entries(DARK_ROOM4.characters)){const a=darkRoom4ArtToWorld(p);Object.assign(s.room04Characters[key],a,{targetX:a.x,targetY:a.y});}
 if(arrive)Object.assign(s.player,DARK_ROOM4.entry);
}
export function syncDarkRoom4SceneScale(s,scale){
 s.room04Presentation.sceneScale=scale;
 s.door04Capsules.forEach((v,i)=>{const a=darkRoom4ArtToWorld(DARK_ROOM4.stations[i]);v.originalPosition={...a};
  if(v.currentLocation==='pedestal'){v.x=a.x;v.y=a.y;}v.interactionRadius=82;});
 Object.assign(s.door04ReferenceConsole,darkRoom4ArtToWorld(DARK_ROOM4.reference),{interactionRadius:95});
 Object.assign(s.door04TestConsole,darkRoom4ArtToWorld(DARK_ROOM4.test),{interactionRadius:85});
 s.door04Slots.forEach((slot,i)=>{
  const logical=darkRoom4ArtToWorld({x:DARK_ROOM4.slotXs[i],y:943});Object.assign(slot,logical,{interactionRadius:82});
  const foot=darkRoom1Point(darkRoom4ArtToWorld(DARK_ROOM4.loom),darkRoom4FloorProjection(scale));
  slot.hitPoint=darkRoom4ArtToWorld({x:DARK_ROOM4.slotXs[i],y:foot.y-120},scale);slot.socketY=slot.hitPoint.y;
 });
}
export function darkRoom4MovementScale(s){return {x:.5,y:1.5*(s.room04Presentation.sceneScale||1)/.7};}
export function darkRoom4Walls(s){return darkRoom1Walls({room01Presentation:s.room04Presentation,door01:s.door04})
 .map(w=>({...w,x:w.x+2510,id:w.id.replace('room1','room4').replace('door-01','door-04')}));}
export function darkRoom4ExitTrigger(s,base){const scale=s.room04Presentation.sceneScale||1,p=a=>darkRoom4ArtToWorld(a,scale);
 return {...base,x:p({x:2300,y:700}).x,minX:p({x:2300,y:700}).x+s.player.radius,maxX:p({x:2448,y:700}).x-s.player.radius,
  minY:p({x:2370,y:650}).y,maxY:p({x:2370,y:700}).y,
  perspective:{vanishingPoint:p({x:2370,y:670}),duration:.55,minScale:.88,fadeStart:.6}};
}
export function darkRoom4DoorDepth(s){if(!isDarkRoom4State(s)||s.door04.status!=='open')return 0;
 const p=darkRoom1Point(s.player,darkRoom4FloorProjection(s.room04Presentation.sceneScale||1));
 if(p.x<2330||p.x>2418)return 0;return Math.max(0,Math.min(1,(740-p.y)/90));}
export function darkRoom4HitSize(t){
 if(t.id.startsWith('door04-entry-'))return {width:36,height:160,centered:false};
 if(t.id==='door04-reference-console')return {width:105,height:340,centered:false};
 if(t.id==='door04-test-console')return {width:82,height:270,centered:false};
 return {width:62,height:390,centered:false};
}
