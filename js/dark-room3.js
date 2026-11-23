import {drawDarkNameplate} from './dark-room-nameplate.js';
import {createDarkSceneArt} from './dark-scene-art.js';
import {DARK_ROOM3,darkRoom3Projection,darkRoom3FloorProjection,darkRoom3Point,
  darkRoom3DoorDepth,syncDarkRoom3SceneScale,darkRoom3ModuleHeight} from './dark-room3-layout.js';
import {allDoor03Ports,DOOR03_SIGNAL_TYPES} from './door03-synth-data.js';
import {drawGameAvatar} from './character/game-avatar.js';
import {drawNpc} from './character/npc-v3.js';
import {currentDialogueEntry} from './dialogue.js';

export const DARK_ROOM3_ART=Object.freeze({background:DARK_ROOM3.assetRoot+'background-clean-v1.png',
  foreground:DARK_ROOM3.assetRoot+'foreground-occlusion-v1.png',
  'oscillator-vco':DARK_ROOM3.assetRoot+'vco-v1.png',sequencer:DARK_ROOM3.assetRoot+'sequencer-v1.png',
  'filter-vcf':DARK_ROOM3.assetRoot+'filter-v1.png',effect:DARK_ROOM3.assetRoot+'effect-v1.png',
  'envelope-adsr':DARK_ROOM3.assetRoot+'envelope-v1.png','amp-vca':DARK_ROOM3.assetRoot+'amplifier-v1.png',
  monitor:DARK_ROOM3.assetRoot+'monitor-v1.png',speaker:DARK_ROOM3.assetRoot+'speaker-v2.png',
  gate:'assets/art/fugata/room01/dark-v1/celestial-door-closed-v1.png'});
const PORT_NAMES={'audio':'音訊','pitch-cv':'音高','gate':'觸發','envelope-cv':'包絡'};
export function createDarkRoom3Renderer(canvas,{reducedMotion=false}={}){
  const ctx=canvas.getContext('2d'),art=createDarkSceneArt(ctx,DARK_ROOM3_ART);let floor;
  const point=p=>darkRoom3Point(p,floor);
  const nameplate=(...args)=>drawDarkNameplate(ctx,...args);
  function cable(a,b,color,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';
    const bend=Math.min(130,Math.max(45,Math.abs(b.x-a.x)*.18));
    const path=()=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x+60,a.y+bend,b.x-60,b.y+bend,b.x,b.y);};
    ctx.lineWidth=7;ctx.strokeStyle='#10151ce8';path();ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle=color;path();ctx.stroke();ctx.restore();
  }
  function cables(s){
    const ports=allDoor03Ports(s.door03Modules),find=id=>ports.find(p=>p.id===id);
    for(const e of s.door03.connectedEdges){const a=find(e.fromPortId),b=find(e.toPortId);if(a&&b)cable(point(a.hitPoint),point(b.hitPoint),DOOR03_SIGNAL_TYPES[e.signalType].color,.88);}
    const fixed=ports.find(p=>p.fixed),speaker=point(s.door03Speaker);
    if(fixed)cable(point(fixed.hitPoint),{x:speaker.x-35,y:speaker.y-35},'#b9a376',s.door03.speakerActive?.9:.5);
    if(s.door03.candidateEdge){const e=s.door03.candidateEdge,a=find(e.fromPortId),b=find(e.toPortId);if(a&&b)cable(point(a.hitPoint),point(b.hitPoint),'#f4a38b',.8);}
    const selected=find(s.door03.selectedOutputPortId);
    if(selected){const hover=find(s.interaction?.hoverId),end=hover?point(hover.hitPoint):point(s.player);
      cable(point(selected.hitPoint),{x:end.x,y:end.y-(hover?0:50)},DOOR03_SIGNAL_TYPES[selected.signalType].color,.68);}
  }
  function module(s,m){const {x,y}=point(m),height=darkRoom3ModuleHeight(m.id);art.sprite(m.id,x,y,height,310);
    if(m.isInspecting||m.isActive)art.glow(x,y-height*.55,65,m.isInspecting?'#d5e6f329':'#e5c88e21');
    if(m.id==='envelope-adsr'&&s.door03.adsrVisible){
      ctx.save();ctx.strokeStyle='#f3d38a';ctx.lineWidth=2;const phase=reducedMotion?.5:(Math.sin(s.door03.adsrAnimationElapsed*2)+1)/2;
      const cx=x-58+phase*98;ctx.beginPath();ctx.moveTo(cx,y-height*.75);ctx.lineTo(cx,y-height*.46);ctx.stroke();ctx.restore();
    }
    nameplate(m.displayName,x,y,m.isInspecting?'#d5efff':m.isActive?'#f0d393':'#ead9ba');
  }
  function sockets(s){
    const connected=new Set(s.door03.connectedEdges.flatMap(e=>[e.fromPortId,e.toPortId]));
    for(const m of s.door03Modules)for(const p of [...m.inputPorts,...m.outputPorts]){
      const {x,y}=point(p.hitPoint),color=DOOR03_SIGNAL_TYPES[p.signalType].color;
      ctx.save();ctx.fillStyle='#0b111b';ctx.strokeStyle=color;ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.stroke();
      if(connected.has(p.id)||p.fixed){ctx.fillStyle=color;ctx.fillRect(x-3,y-3,6,6);}
      ctx.textAlign=p.type==='input'?'right':'left';ctx.font='500 13px system-ui';ctx.lineWidth=4;ctx.strokeStyle='#0a1018';ctx.fillStyle='#f0e5d1';
      const label=p.fixed?'固定輸出':PORT_NAMES[p.signalType]+(p.type==='input'?'入':'出'),tx=x+(p.type==='input'?-15:15);
      ctx.strokeText(label,tx,y+5);ctx.fillText(label,tx,y+5);ctx.restore();
    }
  }
  function actor(s,c,player){const p=point(c),depth=player?darkRoom3DoorDepth(s):0,scale=(player?1.68:1.8)*(1-depth*.22);
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale);
    if(player){ctx.translate(-c.x,-c.y);drawGameAvatar(ctx,s,{reducedMotion});}
    else{ctx.fillStyle='#02050b85';ctx.beginPath();ctx.ellipse(0,0,16,4,0,0,Math.PI*2);ctx.fill();drawNpc(ctx,c,93,reducedMotion||s.roomTransition.active);}
    ctx.restore();if(!player)art.text(c.displayName,p.x,p.y-184,'#ddc697',15);
  }
  function doorway(s){const d=s.door03,progress=d.status==='open'?1:d.status==='opening'?d.openingProgress:0;
    ctx.save();ctx.globalAlpha=1-progress;art.sprite('gate',2370,729,370,180);ctx.restore();
    if(progress===1){art.glow(2370,675,80,'#c4dfe325');art.text('↑',2370,790,'#e9d3a0',34);}
  }
  function dialogue(s){if(s.ui.dialogueInDom)return;const e=currentDialogueEntry(s);if(!s.dialogue.active||!e)return;
    const scale=canvas.width/2520,x=canvas.width*.18,y=1080-265*scale,w=canvas.width*.64,h=218*scale;
    ctx.fillStyle='#08101af5';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#af9161';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
    ctx.save();ctx.translate(x+30*scale,y+39*scale);ctx.scale(scale,scale);ctx.fillStyle='#e2bc7e';ctx.font='600 21px system-ui';ctx.fillText(e.speaker,0,0);
    ctx.fillStyle='#f0e8d8';ctx.font='23px system-ui';e.text.split('\n').forEach((line,i)=>ctx.fillText(line,0,40+i*30));
    ctx.fillStyle='#bfb299';ctx.font='17px system-ui';ctx.fillText('Space／Enter 繼續',0,155);ctx.restore();
  }
  return {render(s){
    const rect=canvas.closest('.canvas-frame').getBoundingClientRect(),p=darkRoom3Projection(rect.width||1920,rect.height||916);
    if(s.room03Presentation.sceneScale!==p.sceneScale)syncDarkRoom3SceneScale(s,p.sceneScale);floor=darkRoom3FloorProjection(p.sceneScale);
    if(canvas.width!==p.width||canvas.height!==1080){canvas.width=p.width;canvas.height=1080;}canvas.style.height=`${p.displayHeight}px`;
    Object.assign(canvas.dataset,{cameraX:'0',projectionScale:String(p.scaleX),projectionScaleY:String(p.scaleY),projectionOffsetX:String(p.offsetX),
      projectionOffsetY:String(p.offsetY),darkRoom3ArtReady:String(art.allReady()),darkRoom3ArtErrors:art.errors().join(','),darkGameTime:String(s.elapsedTime)});
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,1080);ctx.save();ctx.translate(0,(1080-1080*p.sceneScale)/2);ctx.scale(p.sceneScale,p.sceneScale);
    art.plate('background');doorway(s);art.plate('foreground');cables(s);
    const layers=s.door03Modules.map(m=>({depth:m.y,draw:()=>module(s,m)}));
    layers.push({depth:s.door03PatchMonitor.y,draw:()=>{const a=point(s.door03PatchMonitor);art.sprite('monitor',a.x,a.y,145,200);
      nameplate('接線監聽器',a.x,a.y,'#ead9ba',17);art.text(s.door03.currentStageNumber?`階段 ${s.door03.currentStageNumber}／6`:'尚未接線',a.x,a.y+44,'#c5d2dc',14);}});
    layers.push({depth:s.door03Speaker.y,draw:()=>{const a=point(s.door03Speaker);art.sprite('speaker',a.x,a.y,210,125);
      if(s.door03.speakerActive)art.glow(a.x,a.y-100,60,'#d9eddd25');nameplate('揚聲器／輸出',a.x,a.y,'#ead9ba',16);}});
    for(const c of Object.values(s.room03Characters))layers.push({depth:c.y,draw:()=>actor(s,c,false)});
    layers.push({depth:s.player.y,draw:()=>actor(s,s.player,true)});layers.sort((a,b)=>a.depth-b.depth).forEach(l=>l.draw());
    sockets(s);
    if(darkRoom3DoorDepth(s)>0){ctx.save();ctx.beginPath();ctx.rect(2200,250,320,650);ctx.clip();art.plate('foreground');ctx.restore();}
    art.text(s.door03.status==='open'?'出口已開啟・往內走':s.door03.status==='opening'?'合成器啟動・機關解鎖中':'工坊之門・尚未開啟',2355,329,'#eddfc3',17);
    ctx.restore();dialogue(s);
  }};
}
