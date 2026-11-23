import {createDarkSceneArt} from './dark-scene-art.js';
import {drawDarkNameplate} from './dark-room-nameplate.js';
import {DARK_ROOM5,darkRoom5Projection,darkRoom5FloorProjection,darkRoom5Point,darkRoom5ArtToWorld,
 darkRoom5RingPoint,darkRoom5DoorDepth,syncDarkRoom5SceneScale} from './dark-room5-layout.js';
import {drawGameAvatar} from './character/game-avatar.js';
import {drawNpc} from './character/npc-v3.js';
import {currentDialogueEntry} from './dialogue.js';
export const DARK_ROOM5_ART=Object.freeze({background:DARK_ROOM5.assetRoot+'background-clean-v1.png',
 ring:DARK_ROOM5.assetRoot+'rhythm-disk-v1.png',
 foreground:'assets/art/fugata/room04/dark-v1/foreground-occlusion-v1.png',
 terminal:'assets/art/fugata/room04/dark-v1/reference-console-v1.png',
 test:'assets/art/fugata/room03/dark-v1/sequencer-v1.png',
 final:'assets/art/fugata/room04/dark-v1/test-console-v1.png',
 relay:'assets/art/fugata/room04/dark-v1/voice-capsule-v1.png',
 gate:'assets/art/fugata/room01/dark-v1/celestial-door-closed-v1.png'});
const PHASES={foundation:{label:'基礎',color:'#79cfee'},drive:{label:'推進',color:'#e4b86a'},sprint:{label:'衝刺',color:'#bd9ae8'}};
export function createDarkRoom5Renderer(canvas,{reducedMotion=false}={}){
 const ctx=canvas.getContext('2d'),art=createDarkSceneArt(ctx,DARK_ROOM5_ART);let floor;
 const point=p=>darkRoom5Point(p,floor),anchor=p=>point(darkRoom5ArtToWorld(p));
 const plate=(...args)=>drawDarkNameplate(ctx,...args);
 function terminal(s,t){const p=point(t),phase=PHASES[t.phaseId],complete=s.door05.completedPhaseIds.includes(t.phaseId),unlocked=s.door05.unlockedPhaseIds.includes(t.phaseId),playing=s.door05.referencePlayingPhaseId===t.phaseId;
  ctx.save();ctx.globalAlpha=unlocked?1:.55;art.sprite('terminal',p.x,p.y,135,220);ctx.restore();
  if(playing||complete)art.glow(p.x,p.y-70,65,phase.color+'38');
  plate(`${phase.label}聆聽台`,p.x,p.y,phase.color,18);
  art.text(complete?'✓ 已鎖定':unlocked?(playing?'♪ 播放中':'E 聆聽'):'完成前一階段後解鎖',p.x+160,p.y-30,unlocked?phase.color:'#a4a7ab',15);
 }
 function ring(s){const r=DARK_ROOM5.ring,center=point(darkRoom5ArtToWorld(r));
  // This low floor plate follows the floor projection; upright machines retain uniform scale.
  const disk=art.assets.ring,b=disk.bounds,h=310/s.room05Presentation.sceneScale;
  if(art.ready('ring')&&b)ctx.drawImage(disk.image,b.x,b.y,b.width,b.height,center.x-500,center.y-h/2,1000,h);
  const door=s.door05,rotating=['completion-spinning','completion-hold'].includes(door.status);
  for(const n of s.door05Nodes){const p=point(n),pulse=door.status==='testing'&&door.testStep===n.stepNumber||Boolean(door.referencePlayingPhaseId)&&door.referenceStep===n.stepNumber,
   rejected=n.visualState==='rejected'&&n.isSelected,color=rejected?'#f17d72':pulse?'#fff0bc':n.isConfirmed?'#83dcb0':n.isSelected?PHASES[door.activePhaseId].color:'#8b785b';
   ctx.save();if(pulse||n.isSelected||n.isConfirmed){ctx.shadowColor=color;ctx.shadowBlur=pulse?25:12;}
   ctx.beginPath();ctx.ellipse(p.x,p.y,34,18,0,0,Math.PI*2);ctx.fillStyle=pulse?'#87774c':'#0e1820';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=color;ctx.stroke();ctx.restore();
   art.text(String(n.stepNumber),p.x,p.y+8,n.isSelected||pulse||n.isConfirmed?'#f7ead1':'#bbaf96',23);
   if(n.isConfirmed)art.text('✓',p.x,p.y-25,'#83dcb0',18);
   if(rotating){const e=point(darkRoom5RingPoint(n.angle+door.wheelAngle));art.glow(e.x,e.y,32,'#b9e9f777');}
  }
  art.text('九拍節奏環',center.x,center.y+190,'#d0bb91',18);
 }
 function console(s,key,t,label,h,w){const p=point(t),active=key==='test'?s.door05.status==='testing':s.door05.completedPhaseIds.length===3;
  art.sprite(key,p.x,p.y,h,w);if(active)art.glow(p.x,p.y-h*.5,65,'#c9dfa53c');plate(label,p.x,p.y,'#ead9ba',18);
  if(key==='test'){for(let i=0;i<9;i++){ctx.fillStyle=s.door05.testStep===i+1?'#ffe7a6':'#56616b';ctx.fillRect(p.x-72+i*17,p.y-75,10,5);}}
 }
 function relay(s,t){const p=point(t),complete=s.door05.completedPhaseIds.includes(t.phaseId),phase=PHASES[t.phaseId];
  art.sprite('relay',p.x,p.y,95,40);if(complete)art.glow(p.x,p.y-46,44,phase.color+'66');
  plate(`${phase.label} ${complete?'✓':'·'}`,p.x,p.y,complete?phase.color:'#a29a8d',16);
 }
 function energy(s){if(!['launching','opening','open'].includes(s.door05.status))return;
  ctx.save();ctx.lineWidth=3;ctx.strokeStyle='#b9d9c488';ctx.shadowBlur=10;ctx.shadowColor='#a9e6dd';ctx.beginPath();
  const c=point(darkRoom5ArtToWorld(DARK_ROOM5.ring)),f=point(s.door05FinalConsole);ctx.moveTo(c.x,c.y);ctx.lineTo(f.x,f.y-25);ctx.lineTo(2370,740);ctx.stroke();ctx.restore();
 }
 function actor(s,c,player){const p=point(c),depth=player?darkRoom5DoorDepth(s):0,k=(player?1.68:1.8)*(1-depth*.22);
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
  const rect=canvas.closest('.canvas-frame').getBoundingClientRect(),p=darkRoom5Projection(rect.width||1920,rect.height||916);
  if(s.room05Presentation.sceneScale!==p.sceneScale)syncDarkRoom5SceneScale(s,p.sceneScale);floor=darkRoom5FloorProjection(p.sceneScale);
  if(canvas.width!==p.width||canvas.height!==1080){canvas.width=p.width;canvas.height=1080;}canvas.style.height=`${p.displayHeight}px`;
  Object.assign(canvas.dataset,{cameraX:'0',projectionScale:String(p.scaleX),projectionScaleY:String(p.scaleY),projectionOffsetX:String(p.offsetX),projectionOffsetY:String(p.offsetY),
   darkRoom5ArtReady:String(art.allReady()),darkRoom5ArtErrors:art.errors().join(','),darkGameTime:String(s.elapsedTime),door05SelectedSteps:s.door05.selectedAccentsByPhase[s.door05.activePhaseId].join(',')});
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,1080);ctx.save();ctx.translate(0,(1080-1080*p.sceneScale)/2);ctx.scale(p.sceneScale,p.sceneScale);
  art.plate('background');ctx.save();ctx.globalAlpha=1-(s.door05.status==='open'?1:s.door05.status==='opening'?s.door05.openingProgress:0);art.sprite('gate',2370,729,370,180);ctx.restore();art.plate('foreground');energy(s);ring(s);
  const layers=s.door05Terminals.map(t=>({depth:t.y,draw:()=>terminal(s,t)}));
  layers.push(...s.door05Relays.map(t=>({depth:t.y,draw:()=>relay(s,t)})),
   {depth:s.door05TestConsole.y,draw:()=>console(s,'test',s.door05TestConsole,'節奏測試台',120,260)},
   {depth:s.door05FinalConsole.y,draw:()=>console(s,'final',s.door05FinalConsole,'最終節奏驅動',170,240)});
  for(const c of Object.values(s.companions||{}))if(c&&typeof c==='object'&&c.assetKey)layers.push({depth:c.y,draw:()=>actor(s,c,false)});
  layers.push({depth:s.player.y,draw:()=>actor(s,s.player,true)});layers.sort((a,b)=>a.depth-b.depth).forEach(l=>l.draw());
  if(darkRoom5DoorDepth(s)>0){ctx.save();ctx.beginPath();ctx.rect(2200,250,320,650);ctx.clip();art.plate('foreground');ctx.restore();}
  art.text(s.door05.status==='open'?'出口已開啟・往內走':'引擎之門・尚未開啟',2355,329,'#eddfc3',17);
  if(s.door05.status==='open')art.text('↑',2370,790,'#e9d3a0',34);
  ctx.restore();dialogue(s);
 }};
}
