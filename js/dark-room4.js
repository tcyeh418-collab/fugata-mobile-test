import {room04VoiceStyle,room04ReviewResult,isRoom04Review} from './room04-review.js';
import {createDarkSceneArt} from './dark-scene-art.js';
import {drawDarkNameplate} from './dark-room-nameplate.js';
import {DARK_ROOM4,darkRoom4Projection,darkRoom4FloorProjection,darkRoom4Point,darkRoom4ArtToWorld,
 darkRoom4DoorDepth,syncDarkRoom4SceneScale} from './dark-room4-layout.js';
import {drawGameAvatar} from './character/game-avatar.js';
import {drawNpc} from './character/npc-v3.js';
import {room04CarriedCapsule} from './room04-carry.js';
import {room04InteractionFrame} from './room04-atlas.js';
import {currentDialogueEntry} from './dialogue.js';
export const DARK_ROOM4_ART=Object.freeze({background:DARK_ROOM4.assetRoot+'background-clean-v1.png',foreground:DARK_ROOM4.assetRoot+'foreground-occlusion-v1.png',
 capsuleBlue:DARK_ROOM4.assetRoot+'voice-capsule-blue-v2.png',capsuleAmber:DARK_ROOM4.assetRoot+'voice-capsule-amber-v2.png',capsuleMint:DARK_ROOM4.assetRoot+'voice-capsule-mint-v2.png',
 station:DARK_ROOM4.assetRoot+'voice-station-v1.png',capsule:DARK_ROOM4.assetRoot+'voice-capsule-v1.png',loom:DARK_ROOM4.assetRoot+'arrangement-desk-v1.png',
 loomFront:DARK_ROOM4.assetRoot+'arrangement-front-v1.png',reference:DARK_ROOM4.assetRoot+'reference-console-v1.png',test:DARK_ROOM4.assetRoot+'test-console-v1.png',
 gate:'assets/art/fugata/room01/dark-v1/celestial-door-closed-v1.png',
 leroyInteraction:'assets/art/fugata/room04/leroy-interaction-atlas-v1.png',pinxinInteraction:'assets/art/fugata/room04/pinxin-interaction-atlas-v1.png'});
export function createDarkRoom4Renderer(canvas,{reducedMotion=false}={}){
 const ctx=canvas.getContext('2d'),art=createDarkSceneArt(ctx,DARK_ROOM4_ART);let floor;
 const point=p=>darkRoom4Point(p,floor),plate=(...a)=>drawDarkNameplate(ctx,...a);
 const anchor=a=>point(darkRoom4ArtToWorld(a));
 function capsule(x,y,height,width,active=false,voice=null){const style=room04VoiceStyle(voice);art.sprite(style.asset,x,y,height,width);if(active)art.glow(x,y-height*.48,width*.8,style.color+'40');}
 function station(s,v){const p=point(v.originalPosition);art.sprite('station',p.x,p.y,120,180);
  if(v.currentLocation==='pedestal')capsule(p.x,p.y-79,143,58,v.isPlaying,v);
  plate(v.displayLabel,p.x,p.y,room04VoiceStyle(v).color,17);
 }
 function loom(s){const p=anchor(DARK_ROOM4.loom);art.sprite('loom',p.x,p.y,190,760);
  for(const slot of s.door04Slots){const a=point(slot.hitPoint),available=isRoom04Review(s)||slot.index<({reference:2,pair:2,trio:3,quartet:4}[s.door04.stage]||4),playing=slot.visualState==='testing',result=room04ReviewResult(s,slot),locked=isRoom04Review(s)?result==='correct':slot.index<s.door04.confirmedEntryCount;
   ctx.save();ctx.beginPath();ctx.ellipse(a.x,a.y,40,12,0,0,Math.PI*2);ctx.fillStyle='#080e16';ctx.fill();
   ctx.strokeStyle=playing?'#f6dd9c':result==='incorrect'?'#ff6c67':locked?'#7fdfa1':available?'#a68c61':'#53575c';ctx.lineWidth=result?5:3;if(result){ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=14;}ctx.stroke();
   ctx.textAlign='center';ctx.fillStyle=available?'#eddfc3':'#7e8792';ctx.restore();
   const voice=s.door04Capsules.find(v=>v.id===slot.assignedVoiceId);if(voice)capsule(a.x,a.y+2,105,42,voice.isPlaying||playing,voice);
  }
  // Draw the registered front layer using the FULL desk's crop and transform.
  // Independent alpha trimming would shift this apron and hide the dock tops.
  const b=art.assets.loom.bounds,im=art.assets.loomFront.image,source=art.assets.loom.image;
  if(b&&art.ready('loomFront')){const k=Math.min(190/b.height,760/b.width),w=b.width*k,h=b.height*k,rx=im.naturalWidth/source.naturalWidth,ry=im.naturalHeight/source.naturalHeight;
   ctx.drawImage(im,b.x*rx,b.y*ry,b.width*rx,b.height*ry,p.x-w/2,p.y-h,w,h);}
  for(const slot of s.door04Slots){const a=point(slot.hitPoint),v=s.door04Capsules.find(v=>v.id===slot.assignedVoiceId),result=room04ReviewResult(s,slot),color=v?room04VoiceStyle(v).color:'#b5a888';
   ctx.save();ctx.fillStyle='#0b111a';ctx.fillRect(a.x-54,a.y+22,108,28);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.strokeRect(a.x-54,a.y+22,108,28);ctx.restore();
   art.text(`${slot.index+1} · ${v?room04VoiceStyle(v).name:'空'}`,a.x,a.y+42,color,17);
   if(result)art.text(result==='correct'?'✓':'×',a.x+45,a.y+42,result==='correct'?'#7fdfa1':'#ff6c67',18);
  }
  plate('聲部編排台',p.x,p.y,'#ead9ba',18);
 }
 function console(s,key,entity,label,height,width){const p=point(entity);art.sprite(key,p.x,p.y,height,width);
  const active=key==='reference'?s.audio.door04ReferencePlaying:['preparing','testing'].includes(s.door04.status);
  if(active)art.glow(p.x,p.y-height*.5,55,'#ead59b2c');plate(label,p.x,p.y,active?'#f5dfa8':'#ead9ba',17);
 }
 function actor(s,c,player){const p=point(c),depth=player?darkRoom4DoorDepth(s):0,k=(player?1.68:1.8)*(1-depth*.22);
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(k,k);
  if(player){ctx.translate(-c.x,-c.y);
   if(s.room04Presentation.playerForm==='orb'){art.glow(c.x,c.y-12,23,'#c9abff55');ctx.fillStyle='#ddc7ff';ctx.beginPath();ctx.arc(c.x,c.y-12,11,0,Math.PI*2);ctx.fill();}
   else drawGameAvatar(ctx,s,{reducedMotion});
   if(s.door04.heldVoiceId&&s.room04Presentation.carryActor!=='leroy'){const a=room04CarriedCapsule(s,reducedMotion);capsule(a.x+a.width/2,a.y+a.height,a.height,a.width,false,s.door04Capsules.find(v=>v.id===s.door04.heldVoiceId));}
  }else{
   ctx.fillStyle='#02050b85';ctx.beginPath();ctx.ellipse(0,0,16,4,0,0,Math.PI*2);ctx.fill();
   const f=room04InteractionFrame(s,c),key=c.assetKey+'Interaction';let posed=false;
   if(f&&c.pose!=='idle'&&!f.containsCapsule&&art.ready(key)){const h=93/f.standingHeight;ctx.drawImage(art.assets[key].image,f.x,f.y,f.width,f.height,(f.x-f.footX)*h,(f.y-f.footY)*h,f.width*h,f.height*h);posed=true;}
   else drawNpc(ctx,c,93,reducedMotion||s.roomTransition.active);
   if(c.assetKey==='leroy'&&s.door04.heldVoiceId&&s.room04Presentation.carryActor==='leroy'&&!(posed&&f.containsCapsule))capsule(22,-45,24,10,false,s.door04Capsules.find(v=>v.id===s.door04.heldVoiceId));
  }
  ctx.restore();if(!player)art.text(c.displayName,p.x,p.y-184,'#ddc697',15);
 }
 function doorway(s){const d=s.door04,t=d.status==='open'?1:d.status==='opening'?d.openingProgress:0;
  ctx.save();ctx.globalAlpha=1-t;art.sprite('gate',2370,729,370,180);ctx.restore();
  if(t===1){art.glow(2370,675,80,'#c4dfe325');art.text('↑',2370,790,'#e9d3a0',34);}
 }
 function dialogue(s){if(s.ui.dialogueInDom)return;const e=currentDialogueEntry(s);if(!s.dialogue.active||!e)return;
  const k=canvas.width/2520,x=canvas.width*.18,y=1080-265*k,w=canvas.width*.64,h=218*k;
  ctx.fillStyle='#08101af5';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#af9161';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
  ctx.save();ctx.translate(x+30*k,y+39*k);ctx.scale(k,k);ctx.fillStyle='#e2bc7e';ctx.font='600 21px system-ui';ctx.fillText(e.speaker,0,0);
  ctx.fillStyle='#f0e8d8';ctx.font='23px system-ui';e.text.split('\n').forEach((line,i)=>ctx.fillText(line,0,40+i*30));
  ctx.fillStyle='#bfb299';ctx.font='17px system-ui';ctx.fillText('Space／Enter 繼續',0,155);ctx.restore();
 }
 return {render(s){
  const rect=canvas.closest('.canvas-frame').getBoundingClientRect(),p=darkRoom4Projection(rect.width||1920,rect.height||916);
  if(s.room04Presentation.sceneScale!==p.sceneScale)syncDarkRoom4SceneScale(s,p.sceneScale);floor=darkRoom4FloorProjection(p.sceneScale);
  if(canvas.width!==p.width||canvas.height!==1080){canvas.width=p.width;canvas.height=1080;}canvas.style.height=`${p.displayHeight}px`;
  Object.assign(canvas.dataset,{cameraX:'0',projectionScale:String(p.scaleX),projectionScaleY:String(p.scaleY),projectionOffsetX:String(p.offsetX),projectionOffsetY:String(p.offsetY),
   darkRoom4ArtReady:String(art.allReady()),darkRoom4ArtErrors:art.errors().join(','),darkGameTime:String(s.elapsedTime)});
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,1080);ctx.save();ctx.translate(0,(1080-1080*p.sceneScale)/2);ctx.scale(p.sceneScale,p.sceneScale);
  art.plate('background');doorway(s);art.plate('foreground');
  const layers=s.door04Capsules.map(v=>({depth:v.originalPosition.y,draw:()=>station(s,v)}));
  layers.push({depth:darkRoom4ArtToWorld(DARK_ROOM4.loom).y,draw:()=>loom(s)},
   {depth:s.door04ReferenceConsole.y,draw:()=>console(s,'reference',s.door04ReferenceConsole,'參考聆聽台',190,300)},
   {depth:s.door04TestConsole.y,draw:()=>console(s,'test',s.door04TestConsole,'序列測試台',160,225)});
  for(const c of Object.values(s.room04Characters))layers.push({depth:c.y,draw:()=>actor(s,c,false)});
  layers.push({depth:s.player.y,draw:()=>actor(s,s.player,true)});layers.sort((a,b)=>a.depth-b.depth).forEach(l=>l.draw());
  if(darkRoom4DoorDepth(s)>0){ctx.save();ctx.beginPath();ctx.rect(2200,250,320,650);ctx.clip();art.plate('foreground');ctx.restore();}
  art.text(s.door04.status==='open'?'出口已開啟・往內走':s.door04.status==='opening'?'聲部交織・機關解鎖中':'編織之門・尚未開啟',2355,329,'#eddfc3',17);
  ctx.restore();dialogue(s);
 }};
}
