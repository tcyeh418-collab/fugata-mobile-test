import {darkRoom1Projection,darkRoom1FloorProjection,darkRoom1Point,darkRoom1Walls} from './dark-room1-layout.js';

// Independent art anchors; the existing nine-step rhythm and audio clock stay intact.
export const DARK_ROOM5=Object.freeze({width:2520,height:1080,worldOffsetX:3470,
 assetRoot:'assets/art/fugata/room05/dark-v1/',entry:{x:3550,y:260},
 terminals:[{x:535,y:710},{x:535,y:830},{x:535,y:950}],
 ring:{x:1280,y:835,rx:410,ry:110},test:{x:1970,y:800},final:{x:2075,y:950},
 relays:[{x:1810,y:660},{x:1950,y:660},{x:2090,y:660}],
 characters:{leroy:{x:800,y:975},pinxin:{x:2290,y:965}},bounds:[3528,4258,70,569]});
export function isDarkRoom5State(s){return s.gameProgress.currentRoom===5&&s.room05Presentation?.kind==='dark-v1';}
export function darkRoom5Projection(w,h){const p=darkRoom1Projection(w,h);return {...p,offsetX:p.offsetX-DARK_ROOM5.worldOffsetX*p.scaleX};}
export function darkRoom5FloorProjection(scale=1){const p=darkRoom1FloorProjection(scale);return {...p,offsetX:p.offsetX-DARK_ROOM5.worldOffsetX*p.scaleX};}
export {darkRoom1Point as darkRoom5Point};
export function darkRoom5ArtToWorld(p,scale=1){const f=darkRoom5FloorProjection(scale);return {x:(p.x-f.offsetX)/f.scaleX,y:(p.y-f.offsetY)/f.scaleY};}
export function darkRoom5RingPoint(angle){const r=DARK_ROOM5.ring;return darkRoom5ArtToWorld({x:r.x+Math.cos(angle)*r.rx,y:r.y+Math.sin(angle)*r.ry});}
export function configureDarkRoom5(s,{arrive=true}={}){
 Object.assign(s.room05Presentation??={},{kind:'dark-v1',sceneScale:1});syncDarkRoom5SceneScale(s,1);
 if(arrive)Object.assign(s.player,DARK_ROOM5.entry);
}
export function syncDarkRoom5SceneScale(s,scale){
 s.room05Presentation.sceneScale=scale;
 s.door05Terminals.forEach((t,i)=>Object.assign(t,darkRoom5ArtToWorld(DARK_ROOM5.terminals[i]),{interactionRadius:70}));
 s.door05Nodes.forEach(n=>Object.assign(n,darkRoom5RingPoint(n.angle),{interactionRadius:42}));
 s.door05Relays.forEach((r,i)=>Object.assign(r,darkRoom5ArtToWorld(DARK_ROOM5.relays[i])));
 Object.assign(s.door05TestConsole,darkRoom5ArtToWorld(DARK_ROOM5.test),{interactionRadius:85});
 Object.assign(s.door05FinalConsole,darkRoom5ArtToWorld(DARK_ROOM5.final),{interactionRadius:85});
}
export function darkRoom5MovementScale(s){return {x:.5,y:1.5*(s.room05Presentation.sceneScale||1)/.7};}
export function darkRoom5Walls(s){return darkRoom1Walls({room01Presentation:s.room05Presentation,door01:s.door05})
 .map(w=>({...w,x:w.x+DARK_ROOM5.worldOffsetX,id:w.id.replace('room1','room5').replace('door-01','door-05')}));}
export function darkRoom5ExitTrigger(s,base){const scale=s.room05Presentation.sceneScale||1,p=a=>darkRoom5ArtToWorld(a,scale);
 return {...base,x:p({x:2300,y:700}).x,minX:p({x:2300,y:700}).x+s.player.radius,maxX:p({x:2448,y:700}).x-s.player.radius,
 minY:p({x:2370,y:650}).y,maxY:p({x:2370,y:700}).y,
 perspective:{vanishingPoint:p({x:2370,y:670}),duration:.55,minScale:.88,fadeStart:.6}};
}
export function darkRoom5DoorDepth(s){if(!isDarkRoom5State(s)||s.door05.status!=='open')return 0;
 const p=darkRoom1Point(s.player,darkRoom5FloorProjection(s.room05Presentation.sceneScale||1));
 return p.x<2330||p.x>2418?0:Math.max(0,Math.min(1,(740-p.y)/90));}
export function darkRoom5HitSize(t){
 if(t.id.startsWith('door05-rhythm-node-'))return {width:27,height:90,centered:true};
 if(t.id.startsWith('door05-terminal-'))return {width:85,height:300,centered:false};
 return {width:95,height:380,centered:false};
}
