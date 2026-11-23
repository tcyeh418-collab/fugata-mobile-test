import {createDarkSceneArt} from './dark-scene-art.js';
import {drawDarkNameplate} from './dark-room-nameplate.js';
import {DARK_ROOM6,darkRoom6Projection,darkRoom6FloorProjection,darkRoom6Point,
 darkRoom6DoorDepth,syncDarkRoom6SceneScale} from './dark-room6-layout.js';
import {drawGameAvatar} from './character/game-avatar.js';
import {drawNpc} from './character/npc-v3.js';
import {currentDialogueEntry} from './dialogue.js';
export const DARK_ROOM6_ART=Object.freeze({background:DARK_ROOM6.assetRoot+'background-clean-v1.png',core:DARK_ROOM6.assetRoot+'memory-core-v1.png',
 foreground:'assets/art/fugata/room04/dark-v1/foreground-occlusion-v1.png',
 relayBase:'assets/art/fugata/room01/dark-v1/melody-station-empty-v1.png',relay:'assets/art/fugata/room01/dark-v1/melody-capsule-v1.png',
 reference:'assets/art/fugata/room04/dark-v1/reference-console-v1.png',
 station:'assets/art/fugata/room04/dark-v1/voice-station-v1.png',
 memoryBlue:'assets/art/fugata/room04/dark-v1/voice-capsule-blue-v2.png',
 memoryAmber:'assets/art/fugata/room04/dark-v1/voice-capsule-amber-v2.png',
 memoryViolet:'assets/art/fugata/room04/dark-v1/voice-capsule-v1.png',
 gate:'assets/art/fugata/room01/dark-v1/celestial-door-closed-v1.png'});
const RELAYS=[['主題','#79cfee'],['答句','#e4b86a'],['音色','#8bd7bd'],['聲部','#bd9ae8'],['節奏','#87c4db']];
const MEMORY_STYLES=[['memoryBlue','#79cfee'],['memoryAmber','#e4b86a'],['memoryViolet','#bd9ae8']];
export function createDarkRoom6Renderer(canvas,{reducedMotion=false}={}){
 const ctx=canvas.getContext('2d'),art=createDarkSceneArt(ctx,DARK_ROOM6_ART);let floor;
 const point=p=>darkRoom6Point(p,floor),plate=(...args)=>drawDarkNameplate(ctx,...args);
 function relay(s,r,i){const p=point(r),[label,color]=RELAYS[i],next=s.door06.stage==='relays'&&s.door06.activeRelayIndex===i,playing=s.door06.playingRelayId===r.relayId;
  ctx.save();ctx.globalAlpha=r.activated||next?1:.62;art.sprite('relayBase',p.x,p.y,85,150);art.sprite('relay',p.x,p.y-55,140,60);ctx.restore();
  if(next||playing||r.activated)art.glow(p.x,p.y-110,62,(r.activated?'#83dcb0':color)+(playing?'66':'28'));
  plate(`${String(i+1).padStart(2,'0')} · ${label}${r.activated?' ✓':''}`,p.x,p.y,r.activated?'#83dcb0':color,18);
 }
 function memory(s,m,i){const p=point(m),[key,color]=MEMORY_STYLES[i],available=s.door06.memoriesUnlocked,playing=m.isPlaying||s.door06.selectedMemoryId===m.id;
  ctx.save();ctx.globalAlpha=available?1:.52;art.sprite('station',p.x,p.y,85,135);art.sprite(key,p.x,p.y-60,115,47);ctx.restore();
  if(playing||m.visualState==='correct-locked')art.glow(p.x,p.y-105,54,color+'55');
  if(m.visualState==='rejected')art.glow(p.x,p.y-95,60,'#ef786766');
  plate(m.displayLabel,p.x,p.y,color,17);
 }
 function reference(s){const t=s.door06FinalReferenceConsole,p=point(t);art.sprite('reference',p.x,p.y,180,290);
  if(s.door06.finalReferencePlaying)art.glow(p.x,p.y-90,75,'#e4c88844');plate('最終參考聆聽台',p.x,p.y,'#e5cca0',18);
 }
 function core(s){const p=point(s.door06Core);art.sprite('core',p.x,p.y,225,390);
  if(s.door06.coreUnlocked)art.glow(p.x,p.y-115,100,s.door06.completed?'#b3e7d94a':'#8fcbf031');
  plate('Fugata 重構核心',p.x,p.y,'#e5cca0',18);
 }
 function cables(s){ctx.save();ctx.lineWidth=3;
  s.door06Relays.forEach((r,i)=>{ctx.beginPath();r.cablePath.forEach((v,j)=>{const p=point(v);j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});
   ctx.strokeStyle=r.activated?RELAYS[i][1]+'aa':'#a48a513c';ctx.shadowColor=RELAYS[i][1];ctx.shadowBlur=r.activated?10:0;ctx.stroke();});ctx.restore();
 }
 function actor(s,c,player){const p=point(c),depth=player?darkRoom6DoorDepth(s):0,k=(player?1.68:1.8)*(1-depth*.22);
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(k,k);
  if(player){ctx.translate(-c.x,-c.y);drawGameAvatar(ctx,s,{reducedMotion});}
  else{ctx.fillStyle='#02050b85';ctx.beginPath();ctx.ellipse(0,0,16,4,0,0,Math.PI*2);ctx.fill();drawNpc(ctx,c,93,reducedMotion||s.roomTransition.active);}
  ctx.restore();if(!player)art.text(c.assetKey==='leroy'?'Leroy':'Miss DJ Bear Beat',p.x,p.y-184,'#ddc697',15);
 }
 function dialogue(s){if(s.ui.dialogueInDom)return;const e=currentDialogueEntry(s);if(!s.dialogue.active||!e)return;
  const k=canvas.width/2520,x=canvas.width*.18,y=1080-265*k,w=canvas.width*.64,h=218*k;
  ctx.fillStyle='#08101af5';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#af9161';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
  ctx.save();ctx.translate(x+30*k,y+39*k);ctx.scale(k,k);ctx.fillStyle='#e2bc7e';ctx.font='600 21px system-ui';ctx.fillText(e.speaker,0,0);
  ctx.fillStyle='#f0e8d8';ctx.font='23px system-ui';e.text.split('\n').forEach((line,i)=>ctx.fillText(line,0,40+i*30));
  ctx.fillStyle='#bfb299';ctx.font='17px system-ui';ctx.fillText('Space／Enter 繼續',0,155);ctx.restore();
 }
 return {render(s){
  const rect=canvas.closest('.canvas-frame').getBoundingClientRect(),p=darkRoom6Projection(rect.width||1920,rect.height||916);
  if(s.room06Presentation.sceneScale!==p.sceneScale)syncDarkRoom6SceneScale(s,p.sceneScale);floor=darkRoom6FloorProjection(p.sceneScale);
  if(canvas.width!==p.width||canvas.height!==1080){canvas.width=p.width;canvas.height=1080;}canvas.style.height=`${p.displayHeight}px`;
  Object.assign(canvas.dataset,{cameraX:'0',projectionScale:String(p.scaleX),projectionScaleY:String(p.scaleY),projectionOffsetX:String(p.offsetX),projectionOffsetY:String(p.offsetY),
   darkRoom6ArtReady:String(art.allReady()),darkRoom6ArtErrors:art.errors().join(','),darkGameTime:String(s.elapsedTime)});
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,1080);ctx.save();ctx.translate(0,(1080-1080*p.sceneScale)/2);ctx.scale(p.sceneScale,p.sceneScale);
  art.plate('background');ctx.save();ctx.globalAlpha=1-(s.door06.status==='open'?1:s.door06.status==='opening'?s.door06.openingProgress:0);art.sprite('gate',2370,729,370,180);ctx.restore();art.plate('foreground');cables(s);
  const layers=s.door06Relays.map((r,i)=>({depth:r.y,draw:()=>relay(s,r,i)}));
  layers.push({depth:s.door06Core.y,draw:()=>core(s)},{depth:s.door06FinalReferenceConsole.y,draw:()=>reference(s)},
   ...s.door06Memories.map((m,i)=>({depth:m.y,draw:()=>memory(s,m,i)})));
  for(const c of Object.values(s.companions||{}))if(c&&typeof c==='object'&&c.assetKey)layers.push({depth:c.y,draw:()=>actor(s,c,false)});
  layers.push({depth:s.player.y,draw:()=>actor(s,s.player,true)});layers.sort((a,b)=>a.depth-b.depth).forEach(l=>l.draw());
  if(darkRoom6DoorDepth(s)>0){ctx.save();ctx.beginPath();ctx.rect(2200,250,320,650);ctx.clip();art.plate('foreground');ctx.restore();}
  art.text(s.door06.exitOpen?'重構完成・走向出口':'回歸之門・尚未開啟',2355,329,'#eddfc3',17);
  if(s.door06.exitOpen)art.text('↑',2370,790,'#e9d3a0',34);
  ctx.restore();dialogue(s);
 }};
}
