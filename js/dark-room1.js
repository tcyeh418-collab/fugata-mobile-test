import {DARK_ROOM1,darkRoom1Projection,darkRoom1Point,darkRoom1FloorProjection,
  darkRoom1DoorDepth,syncDarkRoom1SceneScale} from './dark-room1-layout.js';
import {drawGameAvatar} from './character/game-avatar.js';
import {drawNpc} from './character/npc-v3.js';
import {heldFragment} from './state.js';
import {currentDialogueEntry} from './dialogue.js';

export const DARK_ROOM1_ASSETS=Object.freeze({
  background:'background-clean-v1.png',station:'melody-station-empty-v1.png',
  capsule:'melody-capsule-v1.png',replay:'theme-gramophone-v1.png',
  gate:'celestial-door-closed-v1.png',foreground:'foreground-occlusion-v1.png',
});

export function createDarkRoom1Renderer(canvas,{reducedMotion=false}={}) {
  const ctx=canvas.getContext('2d');
  const assets=Object.fromEntries(Object.entries(DARK_ROOM1_ASSETS).map(([key,file])=>{
    const image=new Image();
    const asset={image,bounds:null,failed:false};
    image.onload=()=>{
      // Trim transparent padding at draw time only; source images stay intact.
      if(key==='background'||key==='foreground')return;
      const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
      const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
      const pixels=g.getImageData(0,0,c.width,c.height).data;
      let x0=c.width,y0=c.height,x1=0,y1=0;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>24){
        x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
      }
      if(x1>=x0&&y1>=y0)asset.bounds={x:x0,y:y0,width:x1-x0+1,height:y1-y0+1};
    };
    image.onerror=()=>{asset.failed=true;};
    image.src=DARK_ROOM1.assetRoot+file;
    return [key,asset];
  }));
  const ready=a=>a.image.complete&&a.image.naturalWidth>0&&!a.failed;
  let projection,floorProjection;
  function sprite(key,x,y,height,maxWidth=Infinity){
    const a=assets[key];if(!ready(a)||!a.bounds)return;
    const b=a.bounds,s=Math.min(height/b.height,maxWidth/b.width),w=b.width*s,h=b.height*s;
    ctx.drawImage(a.image,b.x,b.y,b.width,b.height,x-w/2,y-h,w,h);
  }
  function shadow(x,y,w){ctx.save();ctx.fillStyle='#02050ba8';ctx.beginPath();ctx.ellipse(x,y,w,w*.19,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  function text(label,x,y,color='#eddfc3',size=18){
    ctx.save();ctx.textAlign='center';ctx.font=`500 ${size}px system-ui,sans-serif`;
    ctx.lineWidth=5;ctx.strokeStyle='#07101c';ctx.strokeText(label,x,y);ctx.fillStyle=color;ctx.fillText(label,x,y);ctx.restore();
  }
  function glow(x,y,r,color){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
  }
  function doorway(state){
    const door=state.door01;
    // Measured on the clean plate: the real arch remains visible around the leaf.
    const progress=door.status==='open'?1:door.status==='opening'?door.openingProgress:0;
    ctx.save();ctx.globalAlpha=1-progress;
    sprite('gate',2370,729,370,180);
    ctx.restore();
    if(door.status==='checking')glow(2370,620,82,'#eacb7370');
    else if(door.status==='rejected')glow(2370,620,85,'#f3766655');
    else if(progress>0)glow(2370,675,90,'#c4dfe325');
    // Draw the status above the foreground arch in render(), not beneath it.
    if(progress===1)text('↑',2370,790,'#e9d3a0',34);
  }
  function station(state,fragment){
    const point=darkRoom1Point(fragment.originalPosition??fragment,floorProjection);
    const {x,y}=point;
    const inserted=state.door01.insertedFragmentId===fragment.id&&['opening','open'].includes(state.door01.status);
    const empty=fragment.isHeld||inserted;
    sprite('station',x,y,252,224);
    if(!empty){
      const lift=fragment.isPlaying&&!reducedMotion?Math.sin(state.elapsedTime*2.8)*3:0;
      sprite('capsule',x,y-25+lift,52,43);
      if(fragment.isPlaying){
        glow(x,y-51,66,'#b9cff045');
      }
    }
    text(fragment.displayLabel,x,y+32,fragment.isPlaying?'#d6efff':'#ead9ba');
    if(empty)text(inserted?'旋律已提交':'音匣已取出',x,y+54,'#a9bac8',14);
  }
  function replay(state){
    const d=state.room01ThemeReplay;
    const {x,y}=darkRoom1Point({...d.interactionPoint,y:d.interactionPoint.y+20},floorProjection);
    sprite('replay',x,y,191,170);
    if(d.playing)glow(x,y-75,80,'#f1c97b38');
    text('Fugata 主題',x,y+32,'#efcc8d',18);
    if(d.playing)text('完整曲播放中',x,y+54,'#ecdfc0',14);
  }
  function actor(state,character,isPlayer){
    const p=darkRoom1Point(character,floorProjection);
    const depth=isPlayer?darkRoom1DoorDepth(state):0;
    const scale=(isPlayer?1.68:1.8)*(1-depth*.22);
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale);
    if(isPlayer){
      ctx.translate(-character.x,-character.y);
      drawGameAvatar(ctx,state,{reducedMotion});
      const carried=heldFragment(state);
      if(carried)sprite('capsule',character.x+21,character.y-34,31,25);
    }else{
      shadow(0,0,16);drawNpc(ctx,character,93,reducedMotion||state.roomTransition.active);
    }
    ctx.restore();
    if(!isPlayer)text(character.displayName,p.x,p.y-184,'#ddc697',15);
  }
  function dialogue(state){
    if(state.ui.dialogueInDom)return;
    const entry=currentDialogueEntry(state);if(!state.dialogue.active||!entry)return;
    const scale=canvas.width/2520;
    const box={x:canvas.width*.18,y:canvas.height-265*scale,w:canvas.width*.64,h:218*scale};
    ctx.fillStyle='#08101af5';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.strokeStyle='#af9161';ctx.lineWidth=2;ctx.strokeRect(box.x,box.y,box.w,box.h);
    ctx.save();ctx.translate(box.x+30*scale,box.y+39*scale);ctx.scale(scale,scale);
    ctx.fillStyle='#e2bc7e';ctx.font='600 21px system-ui';ctx.fillText(entry.speaker,0,0);
    ctx.fillStyle='#f0e8d8';ctx.font='23px system-ui';
    entry.text.split('\n').forEach((line,i)=>ctx.fillText(line,0,40+i*30));
    ctx.fillStyle='#bfb299';ctx.font='17px system-ui';ctx.fillText('Space／Enter 繼續',0,155);ctx.restore();
  }
  return {render(state){
    const frame=canvas.closest('.canvas-frame').getBoundingClientRect();
    projection=darkRoom1Projection(frame.width||1920,frame.height||916);
    if(state.room01Presentation?.sceneScale!==projection.sceneScale)syncDarkRoom1SceneScale(state,projection.sceneScale);
    floorProjection=darkRoom1FloorProjection(projection.sceneScale);
    if(canvas.width!==projection.width||canvas.height!==1080){canvas.width=projection.width;canvas.height=1080;}
    canvas.style.height=`${projection.displayHeight}px`;
    Object.assign(canvas.dataset,{
      cameraX:'0',projectionScale:String(projection.scaleX),projectionScaleY:String(projection.scaleY),
      projectionOffsetX:String(projection.offsetX),projectionOffsetY:String(projection.offsetY),
      darkArtReady:String(Object.values(assets).every(ready)),
      darkThemePlaying:String(state.room01ThemeReplay.playing),
      darkGameTime:String(state.elapsedTime),
      darkArtErrors:Object.entries(assets).filter(([,a])=>a.failed).map(([key])=>key).join(','),
    });
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
    const s=projection.sceneScale,top=(1080-1080*s)/2;
    ctx.save();ctx.translate(0,top);ctx.scale(s,s);
    if(ready(assets.background))ctx.drawImage(assets.background.image,0,0,2520,1080);
    else{ctx.fillStyle='#101823';ctx.fillRect(0,0,2520,1080);}
    doorway(state);
    // Foreground masonry is behind an actor standing in front of the threshold.
    // Only entering the actual open aperture puts its lip in front of the actor.
    if(ready(assets.foreground))ctx.drawImage(assets.foreground.image,0,0,2520,1080);
    const layers=state.fragments.map(f=>({depth:f.originalPosition?.y??f.y,draw:()=>station(state,f)}));
    layers.push({depth:state.room01ThemeReplay.interactionPoint.y+20,draw:()=>replay(state)});
    for(const c of Object.values(state.room01Characters))layers.push({depth:c.y,draw:()=>actor(state,c,false)});
    layers.push({depth:state.player.y,draw:()=>actor(state,state.player,true)});
    layers.sort((a,b)=>a.depth-b.depth).forEach(item=>item.draw());
    if(ready(assets.foreground)&&darkRoom1DoorDepth(state)>0){
      ctx.save();ctx.beginPath();ctx.rect(2200,250,320,650);ctx.clip();
      ctx.drawImage(assets.foreground.image,0,0,2520,1080);ctx.restore();
    }
    const status=state.door01.status;
    text(status==='open'?'出口已開啟・往內走':status==='opening'?'機關解鎖中':status==='checking'?'旋律驗證中':
      status==='rejected'?'旋律尚未吻合':heldFragment(state)?'E 提交旋律':'主題之門・尚未開啟',
      2355,329,status==='rejected'?'#ffb7a0':'#eddfc3',17);
    ctx.restore();dialogue(state);
  }};
}
