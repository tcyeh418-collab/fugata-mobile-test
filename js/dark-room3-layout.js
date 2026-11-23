import {darkRoom1Projection,darkRoom1FloorProjection,darkRoom1Point,darkRoom1Walls} from './dark-room1-layout.js';

export const DARK_ROOM3=Object.freeze({width:2520,height:1080,worldOffsetX:1725,
  assetRoot:'assets/art/fugata/room03/dark-v1/',entry:{x:1805,y:400},
  modules:{sequencer:{x:650,y:680},'oscillator-vco':{x:1150,y:680},'filter-vcf':{x:1650,y:680},
    'envelope-adsr':{x:600,y:930},effect:{x:1100,y:930},'amp-vca':{x:1700,y:930}},
  monitor:{x:1990,y:855},speaker:{x:2170,y:915},moduleHeight:220,moduleWidth:310});
export function isDarkRoom3State(s){return s.gameProgress.currentRoom===3&&s.room03Presentation?.kind==='dark-v1';}
export function darkRoom3ModuleHeight(id){return DARK_ROOM3.modules[id].y<800?190:220;}
export function darkRoom3Projection(w,h){const p=darkRoom1Projection(w,h);return {...p,offsetX:p.offsetX-1725*p.scaleX};}
export function darkRoom3FloorProjection(scale=1){const p=darkRoom1FloorProjection(scale);return {...p,offsetX:p.offsetX-1725*p.scaleX};}
export {darkRoom1Point as darkRoom3Point};
export function darkRoom3ArtToWorld(p,scale=1){const f=darkRoom3FloorProjection(scale);return {x:(p.x-f.offsetX)/f.scaleX,y:(p.y-f.offsetY)/f.scaleY};}
export function configureDarkRoom3(s,{arrive=true}={}){
  s.room03Presentation={kind:'dark-v1',sceneScale:1};syncDarkRoom3SceneScale(s,1);
  for(const [key,x]of [['leroy',430],['pinxin',2070]]){
    const p=darkRoom3ArtToWorld({x,y:960});Object.assign(s.room03Characters[key],p,{targetX:p.x,targetY:p.y});
  }
  if(arrive)Object.assign(s.player,DARK_ROOM3.entry);
}
export function syncDarkRoom3SceneScale(s,scale){
  s.room03Presentation.sceneScale=scale;
  for(const m of s.door03Modules){
    const a=DARK_ROOM3.modules[m.id];Object.assign(m,darkRoom3ArtToWorld(a));m.interactionRadius=92;
    const foot=darkRoom1Point(m,darkRoom3FloorProjection(scale));
    for(const [ports,side]of [[m.inputPorts,-1],[m.outputPorts,1]])ports.forEach((p,i)=>{
      // Reach from the ground beside a cabinet; pick the actual panel socket.
      // Separating these points avoids demanding that players stand inside it.
      Object.assign(p,darkRoom3ArtToWorld({x:foot.x+side*185,y:foot.y+8-i*12},scale));
      p.hitPoint=darkRoom3ArtToWorld({x:foot.x+side*93,y:foot.y-65+(i-(ports.length-1)/2)*30},scale);
      p.interactionRadius=64;
    });
  }
  Object.assign(s.door03PatchMonitor,darkRoom3ArtToWorld(DARK_ROOM3.monitor));s.door03PatchMonitor.interactionRadius=85;
  Object.assign(s.door03Speaker,darkRoom3ArtToWorld(DARK_ROOM3.speaker));
}
export function darkRoom3MovementScale(s){return {x:.5,y:1.5*(s.room03Presentation.sceneScale||1)/.7};}
export function darkRoom3Walls(s){return darkRoom1Walls({room01Presentation:s.room03Presentation,door01:s.door03})
  .map(w=>({...w,x:w.x+1725,id:w.id.replace('room1','room3').replace('door-01','door-03')}));}
export function darkRoom3ExitTrigger(s,base){const scale=s.room03Presentation.sceneScale||1,p=a=>darkRoom3ArtToWorld(a,scale);
  return {...base,x:p({x:2300,y:700}).x,minX:p({x:2300,y:700}).x+s.player.radius,maxX:p({x:2448,y:700}).x-s.player.radius,
    minY:p({x:2370,y:650}).y,maxY:p({x:2370,y:700}).y,
    perspective:{vanishingPoint:p({x:2370,y:670}),duration:.55,minScale:.88,fadeStart:.6}};
}
export function darkRoom3DoorDepth(s){if(!isDarkRoom3State(s)||s.door03.status!=='open')return 0;
  const p=darkRoom1Point(s.player,darkRoom3FloorProjection(s.room03Presentation.sceneScale||1));
  if(p.x<2330||p.x>2418)return 0;return Math.max(0,Math.min(1,(740-p.y)/90));}
export function darkRoom3HitSize(t,scale=1){
  if(t.moduleId)return {width:12,height:36*scale,centered:true};
  return {width:t.id==='door03-patch-monitor'?65:105,height:(t.id==='door03-patch-monitor'?230:330)*scale,centered:false};
}
