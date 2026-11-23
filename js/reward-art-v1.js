// Editable Canvas artwork shared by collection cards and all four wearable views.
// The same geometry works at icon scale and at the character's native 640×832 size.
const gold='#d3ad69',edge='#60452d',light='#f3ddb0',blue='#83cee7';
export function drawRewardIcon(ctx,id,x=0,y=0,size=160){
 ctx.save();ctx.translate(x,y);ctx.scale(size/160,size/160);ctx.lineJoin='round';ctx.lineCap='round';
 const path=(points,color,width=4)=>{ctx.beginPath();for(let i=0;i<points.length;i++){const [a,b]=points[i];i?ctx.lineTo(a,b):ctx.moveTo(a,b);}ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
 const circle=(a,b,r,fill,stroke=gold)=>{ctx.beginPath();ctx.arc(a,b,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke();};
 const rect=(a,b,w,h,fill,stroke=gold)=>{ctx.fillStyle=fill;ctx.fillRect(a,b,w,h);ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.strokeRect(a,b,w,h);};
 const star=(a,b,r)=>{ctx.beginPath();for(let i=0;i<8;i++){const t=i*Math.PI/4-Math.PI/2,k=i%2?r*.3:r;const q=[a+Math.cos(t)*k,b+Math.sin(t)*k];i?ctx.lineTo(...q):ctx.moveTo(...q);}ctx.closePath();ctx.fillStyle=light;ctx.fill();ctx.strokeStyle=gold;ctx.lineWidth=2;ctx.stroke();};
 if(id==='melody-brooch'){
  circle(80,80,42,'#182b3a');circle(80,80,32,'#283b48',edge);star(80,80,38);circle(80,80,11,blue);path([[38,112],[120,49]],gold,3);circle(39,112,4,light);circle(120,49,4,light);
 }else if(id==='echo-headphones'){
  ctx.beginPath();ctx.arc(80,77,47,Math.PI,0);ctx.strokeStyle=edge;ctx.lineWidth=17;ctx.stroke();ctx.strokeStyle=gold;ctx.lineWidth=10;ctx.stroke();
  for(const a of [28,112]){rect(a,76,20,43,'#142230');rect(a+5,83,10,28,'#48677b',edge);path([[a+3,76],[a+17,76]],light,2);}path([[49,48],[60,40],[79,36]],light,3);
 }else if(id==='synth-patch'){
  for(const [i,c]of ['#d5a665','#619aaa','#b87559'].entries()){
   ctx.beginPath();ctx.moveTo(43+i*9,32);ctx.bezierCurveTo(5+i*8,142,145-i*8,150,119-i*8,42);ctx.strokeStyle=edge;ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=6;ctx.stroke();
   rect(37+i*9,24,10,25,gold,edge);path([[42+i*9,24],[42+i*9,14]],light,4);rect(113-i*8,29,10,25,gold,edge);path([[118-i*8,29],[118-i*8,19]],light,4);
  }
 }else if(id==='voices-recorder'){
  path([[51,47],[43,22],[112,22],[110,47]],gold,5);rect(35,44,90,86,'#273440');rect(43,53,74,35,'#101d26');
  for(const [i,c]of ['#66cbe8','#e4be66','#72caa2','#b191e1'].entries()){rect(49+i*17,59,10,23,c,edge);}
  circle(59,108,12,'#101d26');circle(59,108,4,gold);circle(97,108,12,'#101d26');circle(97,108,4,gold);path([[73,108],[83,108]],gold,3);circle(117,125,3,'#f2c5a2');
 }else if(id==='rhythm-sticks'){
  for(const flip of [-1,1]){ctx.save();ctx.translate(80,83);ctx.rotate(flip*.32);rect(-5,-50,10,103,'#ae7d46',edge);rect(-5,2,10,23,'#142b3d',gold);circle(0,-54,7,light);path([[-2,-37],[-2,-8]],light,2);star(0,13,6);ctx.restore();}
 }else if(id==='core-pendant'){
  path([[38,24],[45,50],[80,103],[115,50],[122,24]],gold,4);circle(80,102,31,'#132d41');
  ctx.save();ctx.translate(80,102);ctx.rotate(-.4);ctx.beginPath();ctx.ellipse(0,0,34,12,0,0,Math.PI*2);ctx.strokeStyle=gold;ctx.lineWidth=4;ctx.stroke();ctx.rotate(1.2);ctx.beginPath();ctx.ellipse(0,0,30,13,0,0,Math.PI*2);ctx.stroke();ctx.restore();circle(80,102,12,blue);star(80,102,9);
 }
 ctx.restore();
}

// Anchored to the torso rather than hands: instruments and carried puzzles remain intact.
export function wearablePlacement(id,direction='front',frame=1){
 const side=direction==='left'||direction==='right',back=direction==='back',right=direction==='right';
 const bob=[0,-2,1,-2][frame%4]??0;
 const positions={
  'melody-brooch':{x:side?(right?342:297):367,y:278,size:39,visible:!back&&(!side||right)},
  'echo-headphones':{x:side?309:320,y:112,size:170,visible:true},
  'synth-patch':{x:side?(right?351:292):320,y:270,size:145,visible:!back},
  'voices-recorder':{x:side?(right?351:292):(back?237:403),y:465,size:94,visible:!side||right},
  'rhythm-sticks':{x:side?(right?348:285):(back?413:227),y:467,size:108,visible:!side||!right},
  'core-pendant':{x:side?(right?346:295):320,y:263,size:75,visible:!back},
 };
 const p=positions[id];return p?{...p,y:p.y+bob,side,back}:null;
}
export function drawEquippedRewards(ctx,profile,{direction='front',frame=1,x=0,y=0,scale=1,foot=[320,808]}={}){
 if(!profile?.equipped)return;
 ctx.save();ctx.translate(x-foot[0]*scale,y-foot[1]*scale);ctx.scale(scale,scale);
 for(const id of Object.values(profile.equipped)){
  const p=wearablePlacement(id,direction,frame);
  if(p?.back&&['synth-patch','core-pendant'].includes(id)){
   ctx.beginPath();ctx.moveTo(280,204);ctx.quadraticCurveTo(320,230,360,204);ctx.strokeStyle=gold;ctx.lineWidth=id==='synth-patch'?6:3;ctx.stroke();
  }
  if(!p?.visible)continue;
  ctx.save();ctx.translate(p.x,p.y);
  if(id==='echo-headphones'){
   // Head band follows the hair silhouette; ear cups remain visible from behind.
   ctx.strokeStyle=edge;ctx.lineWidth=13;ctx.beginPath();ctx.ellipse(0,0,p.side?27:72,72,0,Math.PI,Math.PI*2);ctx.stroke();ctx.strokeStyle=gold;ctx.lineWidth=7;ctx.stroke();
   for(const a of p.side?[0]:[-69,69]){ctx.fillStyle='#172b3e';ctx.fillRect(a-9,24,18,40);ctx.strokeStyle=gold;ctx.lineWidth=4;ctx.strokeRect(a-9,24,18,40);ctx.fillStyle=blue;ctx.fillRect(a-3,32,5,23);}
  }else{
   if(p.side)ctx.scale(.48,1);
   drawRewardIcon(ctx,id,-p.size/2,-p.size/2,p.size);
  }
  ctx.restore();
 }
 ctx.restore();
}
