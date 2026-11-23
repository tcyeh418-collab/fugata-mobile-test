import {drawRewardIcon as drawLegacyIcon,wearablePlacement as legacyPlacement} from './reward-art-v1.js';

// Independent transparent production art, retained separately from the first study.
export const REWARD_ART=Object.freeze(Object.fromEntries([
 'melody-brooch','echo-headphones','synth-patch','voices-recorder','rhythm-sticks','core-pendant',
].map(id=>[id,`assets/art/fugata/rewards/dark-v2/${id}.png`])));
const images=new Map();let loading;
export function rewardArtStatus(){return {ready:[...images].filter(([,a])=>a.ready).map(([id])=>id),errors:[...images].filter(([,a])=>a.failed).map(([id])=>id)};}
export function preloadRewardArt(){
 if(loading)return loading;
 if(typeof Image==='undefined')return Promise.resolve();
 loading=Promise.all(Object.entries(REWARD_ART).map(([id,src])=>new Promise(resolve=>{
  const image=new Image(),a={image,ready:false,failed:false,bounds:null};images.set(id,a);
  image.onload=()=>{
   try{
    const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
    const pixels=g.getImageData(0,0,c.width,c.height).data;let l=c.width,t=c.height,r=-1,b=-1;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>24){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    if(r<l)throw Error('Empty equipment sprite');
    a.bounds={x:l,y:t,width:r-l+1,height:b-t+1};a.ready=true;
   }catch{a.failed=true;}resolve();
  };
  image.onerror=()=>{a.failed=true;resolve();};image.src=src;
 })));
 return loading;
}
function drawSprite(ctx,id,x,y,width,height){
 const a=images.get(id);if(!a?.ready)return false;
 const b=a.bounds,k=Math.min(width/b.width,height/b.height),w=b.width*k,h=b.height*k;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(a.image,b.x,b.y,b.width,b.height,x+(width-w)/2,y+(height-h)/2,w,h);ctx.restore();return true;
}
export function drawRewardIcon(ctx,id,x=0,y=0,size=160){
 void preloadRewardArt();
 if(!drawSprite(ctx,id,x+size*.055,y+size*.055,size*.89,size*.89))drawLegacyIcon(ctx,id,x,y,size);
}
export function wearablePlacement(id,direction='front',frame=1){
 const p=legacyPlacement(id,direction,frame);if(!p)return null;
 const sizes={'melody-brooch':33,'echo-headphones':167,'synth-patch':126,'voices-recorder':86,'rhythm-sticks':105,'core-pendant':83};
 return {...p,size:sizes[id]??p.size};
}
function neckClasp(ctx,id){
 ctx.save();ctx.beginPath();ctx.moveTo(280,204);ctx.quadraticCurveTo(320,226,360,204);
 ctx.strokeStyle='#493525';ctx.lineWidth=id==='synth-patch'?7:4;ctx.stroke();ctx.strokeStyle='#b38c50';ctx.lineWidth=id==='synth-patch'?3:1.5;ctx.stroke();ctx.restore();
}
function headphones(ctx,p){
 const a=images.get('echo-headphones');
 if(!a?.ready){drawLegacyIcon(ctx,'echo-headphones',-p.size/2,-p.size/2,p.size);return;}
 const b=a.bounds;
 if(!p.side){
  // Separate the display artwork into a band and small ear cups. A complete
  // inventory silhouette would otherwise put oversized cups over the eyes.
  ctx.save();ctx.imageSmoothingEnabled=true;
  ctx.drawImage(a.image,b.x,b.y,b.width,b.height*.5,-80,-82,160,82);
  for(const sign of [-1,1]){
   ctx.fillStyle='#8f6c3c';ctx.fillRect(sign*69-3,-1,6,25);
   ctx.drawImage(a.image,b.x+b.width*(sign<0?0:.57),b.y+b.height*.51,b.width*.43,b.height*.49,sign*69-13,17,26,48);
  }
  ctx.restore();return;
 }
 ctx.save();ctx.strokeStyle='#302c29';ctx.lineWidth=12;ctx.beginPath();ctx.ellipse(-4,-8,25,65,0,Math.PI,Math.PI*2);ctx.stroke();ctx.strokeStyle='#a98a56';ctx.lineWidth=4;ctx.stroke();
 ctx.drawImage(a.image,b.x+b.width*.67,b.y+b.height*.48,b.width*.33,b.height*.52,-14,16,29,50);ctx.restore();
}
export function drawEquippedRewards(ctx,profile,{direction='front',frame=1,x=0,y=0,scale=1,foot=[320,808]}={}){
 if(!profile?.equipped)return;
 void preloadRewardArt();
 ctx.save();ctx.translate(x-foot[0]*scale,y-foot[1]*scale);ctx.scale(scale,scale);
 for(const id of Object.values(profile.equipped)){
  const p=wearablePlacement(id,direction,frame);
  if(p?.back&&['synth-patch','core-pendant'].includes(id))neckClasp(ctx,id);
  if(!p?.visible)continue;
  ctx.save();ctx.translate(p.x,p.y);
  if(id==='echo-headphones')headphones(ctx,p);
  else{
   if(p.side)ctx.scale(.62,1);
   if(!drawSprite(ctx,id,-p.size/2,-p.size/2,p.size,p.size))drawLegacyIcon(ctx,id,-p.size/2,-p.size/2,p.size);
  }
  ctx.restore();
 }
 ctx.restore();
}
