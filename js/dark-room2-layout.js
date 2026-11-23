import {darkRoom1Projection,darkRoom1FloorProjection,darkRoom1Point,darkRoom1Walls} from './dark-room1-layout.js';

// Use the approved Room1 art coordinate system, shifted into Room2 world space.
export const DARK_ROOM2=Object.freeze({width:2520,height:1080,worldOffsetX:765,
  assetRoot:'assets/art/fugata/room02/dark-v1/',entry:{x:860,y:400},
  terminal:{x:600,y:825},towerAnchors:[{x:1010,y:770},{x:1390,y:745},{x:1730,y:790},{x:2050,y:850}]});

export function isDarkRoom2State(state){return state.gameProgress.currentRoom===2&&state.room02Presentation?.kind==='dark-v1';}
export function darkRoom2Projection(width,height){const p=darkRoom1Projection(width,height);return {...p,offsetX:p.offsetX-765*p.scaleX};}
export function darkRoom2FloorProjection(sceneScale=1){const p=darkRoom1FloorProjection(sceneScale);return {...p,offsetX:p.offsetX-765*p.scaleX};}
export {darkRoom1Point as darkRoom2Point};
export function darkRoom2ArtToWorld(point,sceneScale=1){const p=darkRoom2FloorProjection(sceneScale);return {x:(point.x-p.offsetX)/p.scaleX,y:(point.y-p.offsetY)/p.scaleY};}

export function configureDarkRoom2(state,{arrive=true}={}){
  state.room02Presentation={kind:'dark-v1',sceneScale:1};
  syncDarkRoom2SceneScale(state,1);
  if(arrive)Object.assign(state.player,DARK_ROOM2.entry);
}
export function syncDarkRoom2SceneScale(state,sceneScale){
  state.room02Presentation.sceneScale=sceneScale;
  Object.assign(state.subjectTerminal,darkRoom2ArtToWorld(DARK_ROOM2.terminal,sceneScale));
  state.echoTowers.forEach((tower,i)=>Object.assign(tower,darkRoom2ArtToWorld(DARK_ROOM2.towerAnchors[i],sceneScale)));
}
export function darkRoom2MovementScale(state){return {x:.5,y:1.5*(state.room02Presentation.sceneScale||1)/.7};}
export function darkRoom2Walls(state){
  return darkRoom1Walls({room01Presentation:state.room02Presentation,door01:state.door02})
    .map(w=>({...w,id:w.id.replace('room1','room2').replace('door-01','door-02'),x:w.x+765}));
}
export function darkRoom2ExitTrigger(state,base){
  const s=state.room02Presentation.sceneScale||1,point=p=>darkRoom2ArtToWorld(p,s);
  return {...base,x:point({x:2300,y:700}).x,minX:point({x:2300,y:700}).x+state.player.radius,
    maxX:point({x:2448,y:700}).x-state.player.radius,
    minY:point({x:2370,y:650}).y,maxY:point({x:2370,y:700}).y,
    perspective:{vanishingPoint:point({x:2370,y:670}),duration:.55,minScale:.88,fadeStart:.6}};
}
export function darkRoom2DoorDepth(state){
  if(!isDarkRoom2State(state)||state.door02.status!=='open')return 0;
  const foot=darkRoom1Point(state.player,darkRoom2FloorProjection(state.room02Presentation.sceneScale||1));
  if(foot.x<2330||foot.x>2418)return 0;
  return Math.max(0,Math.min(1,(740-foot.y)/90));
}
export function darkRoom2HitSize(target){return target.id==='subject-terminal'?{width:110,height:380}:{width:60,height:460};}
