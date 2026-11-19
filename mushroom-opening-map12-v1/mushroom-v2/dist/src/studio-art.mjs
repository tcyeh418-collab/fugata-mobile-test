import {createArtworkBank} from './map4-image-bank.mjs';
import {drawStudioMotion} from './studio-motion.mjs';
import {drawStatePlayer} from './render3.mjs?rev=map5-20261020-r1';
export const STUDIO_FRAME=Object.freeze({width:1280,height:720,groundY:590,playerX:435.2,leroyX:595.2,djX:835.2});
export const STUDIO_LAYERS=Object.freeze(['architecture','floor','rug','modular-wall','left-recording','right-recording','drum-kit']);
export function studioViewport(width,height=720){const scale=Math.min(width/1280,height/720);return {scale,x:(width-1280*scale)/2,y:(height-720*scale)/2};}
const bank=createArtworkBank(new URL('../assets/studio-v2/',import.meta.url),name=>name+'.png'),loaded=bank.load;
export function studioArtStatus(){const layers=bank.status(STUDIO_LAYERS),people=bank.status(['leroy','miss-dj-bear-beat']);const extras=bank.status(['fallback-room','crt-screen-v3','module-led-a-v3','module-led-b-v3']);return{ready:(layers.ready||!!loaded('fallback-room'))&&people.ready,layered:layers.ready,failed:extras.failed,images:extras.requested,loaded:extras.loaded+layers.loaded+people.loaded};}
export const retryStudioArt=bank.retry;
const npcFrames=new Map();
function npc(c,key,x,height){const im=loaded(key);if(!im)return false;const s=height/512;let frame=npcFrames.get(key);if(!frame){frame=document.createElement('canvas');frame.width=Math.round(448*s/2)*2;frame.height=Math.round(576*s/2)*2;const ctx=frame.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(im,0,0,frame.width,frame.height);npcFrames.set(key,frame);}c.drawImage(frame,Math.round((x-224*s)/2)*2,Math.round((590-548*s)/2)*2,frame.width,frame.height);return true;}

export function drawStudioArt(r,g){const {c}=r,W=r.canvas.width,H=r.canvas.height,v=studioViewport(W,H),cam=r.camera;
 c.fillStyle='#0b1320';c.fillRect(0,0,W,H);c.save();c.translate(v.x,v.y);c.scale(v.scale,v.scale);c.imageSmoothingEnabled=false;
 const all=STUDIO_LAYERS.map(n=>loaded(n)),fallback=loaded('fallback-room');loaded('leroy');loaded('miss-dj-bear-beat');
 if(all.every(Boolean)){for(const im of all)c.drawImage(im,0,0,1280,720);}
 else if(fallback)c.drawImage(fallback,0,0,1280,720);
 else{c.fillStyle='#1c2a3d';c.fillRect(0,0,1280,590);c.fillStyle='#665b48';c.fillRect(0,590,1280,130);c.fillStyle='#b8b8a0';c.fillRect(570,310,370,130);}
 const mode=g.source?.mode??g.mode,active=mode==='studio-talk';
 // Decoration has no audio/beat link. Freeze in every Dance-related state and reduced motion.
 drawStudioMotion(c,r.clock,loaded,{enabled:active&&!r.reduced&&!globalThis.document?.hidden&&(all.every(Boolean)||!!fallback)});

 if(!npc(c,'leroy',595.2,216)){c.fillStyle='#141c22';c.fillRect(575,410,40,180);c.fillStyle='#bca283';c.fillRect(578,374,34,36);}
 if(!npc(c,'miss-dj-bear-beat',835.2,204)){c.fillStyle='#171d26';c.fillRect(815,420,40,170);c.fillStyle='#c6ab91';c.fillRect(818,386,34,34);}
 r.camera=0;drawStatePlayer(r,{...g,player:{...g.player,x:435.2},isGiant:g.isGiant},false);r.camera=cam;
 c.font='16px monospace';c.fillStyle='#d8b981';c.fillText('LOGIC CODE',92,283);c.restore();
}
