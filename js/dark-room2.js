import {createDarkSceneArt} from './dark-scene-art.js';
import {DARK_ROOM2,darkRoom2Projection,darkRoom2FloorProjection,darkRoom2Point,
  darkRoom2DoorDepth,syncDarkRoom2SceneScale} from './dark-room2-layout.js';
import {drawGameAvatar} from './character/game-avatar.js';
import {drawNpc} from './character/npc-v3.js';
import {currentDialogueEntry} from './dialogue.js';

export const DARK_ROOM2_ART=Object.freeze({background:DARK_ROOM2.assetRoot+'background-clean-v1.png',
  foreground:DARK_ROOM2.assetRoot+'foreground-occlusion-v1.png',tower:DARK_ROOM2.assetRoot+'echo-tower-v1.png',
  terminal:DARK_ROOM2.assetRoot+'subject-terminal-v1.png',gate:'assets/art/fugata/room01/dark-v1/celestial-door-closed-v1.png'});

export function createDarkRoom2Renderer(canvas,{reducedMotion=false}={}){
  const ctx=canvas.getContext('2d'),art=createDarkSceneArt(ctx,DARK_ROOM2_ART);
  let floor;
  const point=p=>darkRoom2Point(p,floor);
  function terminal(state){
    const d=state.subjectTerminal,{x,y}=point(d);
    art.sprite('terminal',x,y,250,320);
    if(d.isPlaying){
      art.glow(x-15,y-165,70,'#e4bb6c35');
      ctx.save();ctx.strokeStyle='#f5d491';ctx.lineWidth=2;
      for(let i=-5;i<=5;i++){const h=8+(d.visualLevel||0)*23+(reducedMotion?4:Math.sin(state.elapsedTime*4+i)*5);
        ctx.beginPath();ctx.moveTo(x-15+i*7,y-165-h);ctx.lineTo(x-15+i*7,y-165+h);ctx.stroke();}ctx.restore();
    }
    art.text('主題終端',x,y+32,'#eacb92');
    if(d.isPlaying)art.text('樂句主題播放中',x,y+54,'#f2dfb1',14);
  }
  function tower(state,t){
    const {x,y}=point(t),door=state.door02,selected=door.selectedTowerId===t.id;
    art.sprite('tower',x,y,300,180);
    const connected=t.isConnected,checking=selected&&door.status==='checking',rejected=selected&&door.status==='rejected';
    if(t.isPlaying||checking||rejected||connected){
      art.glow(x,y-155,70,rejected?'#e5907140':connected?'#b8d8ce35':'#e9cb8340');
      ctx.save();ctx.fillStyle=rejected?'#f8ad91':connected?'#c6e4dc':'#f5d48c';
      const level=reducedMotion ? .4 : Math.max(.18,t.visualLevel||.25);
      for(let i=-2;i<=2;i++){const h=14+level*25+(reducedMotion?0:Math.sin(state.elapsedTime*3+i)*4);
        ctx.fillRect(x+i*10-1,y-160-h,2,h*2);}ctx.restore();
    }
    art.text(t.displayLabel,x,y+31,rejected?'#ffb69b':t.isPlaying?'#f9e6be':'#e5d6bb');
    const status=rejected?'聲部尚未同步':checking?'驗證中':connected?'主題答句已接通':t.isPlaying?'聆聽中':'';
    if(status)art.text(status,x,y+53,rejected?'#ffb69b':'#c9d9dd',14);
  }
  function actor(state,c,isPlayer){
    const p=point(c),depth=isPlayer?darkRoom2DoorDepth(state):0,scale=(isPlayer?1.68:1.8)*(1-depth*.22);
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale);
    if(isPlayer){ctx.translate(-c.x,-c.y);drawGameAvatar(ctx,state,{reducedMotion});}
    else{ctx.fillStyle='#02050b85';ctx.beginPath();ctx.ellipse(0,0,16,4,0,0,Math.PI*2);ctx.fill();drawNpc(ctx,c,93,reducedMotion||state.roomTransition.active);}
    ctx.restore();if(!isPlayer)art.text(c.displayName,p.x,p.y-184,'#ddc697',15);
  }
  function door(state){
    const d=state.door02,p=d.status==='open'?1:d.status==='opening'?d.openingProgress:0;
    ctx.save();ctx.globalAlpha=1-p;art.sprite('gate',2370,729,370,180);ctx.restore();
    if(p>0)art.glow(2370,675,90,'#c4dfe325');
    if(p===1)art.text('↑',2370,790,'#e9d3a0',34);
  }
  function dialogue(state){
    if(state.ui.dialogueInDom)return;
    const entry=currentDialogueEntry(state);if(!state.dialogue.active||!entry)return;
    const s=canvas.width/2520,x=canvas.width*.18,y=1080-265*s,w=canvas.width*.64,h=218*s;
    ctx.fillStyle='#08101af5';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#af9161';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
    ctx.save();ctx.translate(x+30*s,y+39*s);ctx.scale(s,s);ctx.fillStyle='#e2bc7e';ctx.font='600 21px system-ui';ctx.fillText(entry.speaker,0,0);
    ctx.fillStyle='#f0e8d8';ctx.font='23px system-ui';entry.text.split('\n').forEach((line,i)=>ctx.fillText(line,0,40+i*30));
    ctx.fillStyle='#bfb299';ctx.font='17px system-ui';ctx.fillText('Space／Enter 繼續',0,155);ctx.restore();
  }
  return {render(state){
    const rect=canvas.closest('.canvas-frame').getBoundingClientRect(),p=darkRoom2Projection(rect.width||1920,rect.height||916);
    if(state.room02Presentation.sceneScale!==p.sceneScale)syncDarkRoom2SceneScale(state,p.sceneScale);
    floor=darkRoom2FloorProjection(p.sceneScale);
    if(canvas.width!==p.width||canvas.height!==1080){canvas.width=p.width;canvas.height=1080;}canvas.style.height=`${p.displayHeight}px`;
    Object.assign(canvas.dataset,{cameraX:'0',projectionScale:String(p.scaleX),projectionScaleY:String(p.scaleY),
      projectionOffsetX:String(p.offsetX),projectionOffsetY:String(p.offsetY),darkRoom2ArtReady:String(art.allReady()),
      darkRoom2ArtErrors:art.errors().join(','),darkGameTime:String(state.elapsedTime)});
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,1080);ctx.save();
    ctx.translate(0,(1080-1080*p.sceneScale)/2);ctx.scale(p.sceneScale,p.sceneScale);
    art.plate('background');door(state);art.plate('foreground');
    const layers=state.echoTowers.map(t=>({depth:t.y,draw:()=>tower(state,t)}));
    layers.push({depth:state.subjectTerminal.y,draw:()=>terminal(state)});
    for(const c of Object.values(state.room02Characters))layers.push({depth:c.y,draw:()=>actor(state,c,false)});
    layers.push({depth:state.player.y,draw:()=>actor(state,state.player,true)});
    layers.sort((a,b)=>a.depth-b.depth).forEach(l=>l.draw());
    if(darkRoom2DoorDepth(state)>0){ctx.save();ctx.beginPath();ctx.rect(2200,250,320,650);ctx.clip();art.plate('foreground');ctx.restore();}
    art.text(state.door02.status==='open'?'出口已開啟・往內走':state.door02.status==='opening'?'聲部同步・機關解鎖中':'回音之門・尚未開啟',2355,329,'#eddfc3',17);
    ctx.restore();dialogue(state);
  }};
}
