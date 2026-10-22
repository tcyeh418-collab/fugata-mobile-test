import {drawMap5Details} from './render5.mjs?rev=map5-20261020-r1';
import {drawStudio} from './studio.mjs?rev=map5-20261020-r1';
import {drawMap4Details} from './render4.mjs?rev=map5-20261020-r1';
import {drawMap3Details,drawStatePlayer} from './render3.mjs?rev=map5-20261020-r1';
import {CONFIG as C} from './map.mjs?rev=map5-20261020-r1';
import {drawMap2Details} from './render2.mjs?rev=map5-20261020-r1';
import {drawLedgeArchitecture} from './landmarks.mjs?rev=map5-20261020-r1';
let W=1280; const H=720;
const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.camera=0;this.clock=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
 rect(x,y,w,h,color){this.c.fillStyle=color;this.c.fillRect(x,y,w,h);}
 line(x,y,x2,y2,color,width=1){const c=this.c;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
 ellipse(x,y,rx,ry,color){const c=this.c;c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 glow(x,y,r,color){const c=this.c;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 mushroom(x,y,scale=1,red=true,face=false){const c=this.c;c.save();c.translate(x,y);c.scale(scale,scale);this.glow(0,-25,90,'#b7d29c12');this.rect(-11,-34,22,34,'#dad9b8');this.ellipse(0,-1,15,4,'#8d9673');this.rect(-7,-34,5,29,'#f2e8c4');c.fillStyle=red?'#c66c58':'#dcd8af';c.beginPath();c.moveTo(-39,-31);c.bezierCurveTo(-36,-79,31,-81,39,-31);c.quadraticCurveTo(0,-19,-39,-31);c.fill();this.ellipse(0,-30,39,7,red?'#e8a282':'#9baf91');for(const [a,b,r] of [[-20,-44,7],[3,-57,9],[23,-42,5]])this.ellipse(a,b,r,r*.55,red?'#f3deba':'#f5efce');if(face){this.ellipse(-5,-15,1.8,2.4,'#24413c');this.ellipse(6,-15,1.8,2.4,'#24413c');}c.restore();}
 warehouse(x,y,w,h,seed){const c=this.c;this.rect(x,y,w,h,'#29494b');this.rect(x+7,y+6,w-14,h-6,'#335252');this.rect(x,y-8,w,8,'#466361');this.rect(x-9,y-5,w+18,4,'#789082');for(let j=0;j<4;j++){const wx=x+35+j*(w-55)/4;this.rect(wx,y+35,45,46,'#1d3c42');this.rect(wx+3,y+38,39,20,'#5c7970');this.line(wx+22,y+35,wx+22,y+81,'#314e50',3);this.line(wx,y+58,wx+45,y+58,'#314e50',3);}this.rect(x+w*.27,y+h-110,w*.43,110,'#243f42');for(let k=0;k<9;k++)this.line(x+w*.27,y+h-105+k*11,x+w*.7,y+h-105+k*11,'#41605b');this.rect(x+w-30,y+5,9,h-5,'#60776b');this.rect(x+w-29,y+10,3,h-5,'#829383');for(let row=0;row<4;row++)for(let col=0;col<9;col++){if(noise(seed+row*9+col)>.4)this.rect(x+col*26+(row%2)*12,y+h-17-row*13,23,10,'#795e4c66');}c.fillStyle='#a6b49a55';c.font='12px monospace';c.fillText(`倉 W-${String(seed%20+1).padStart(2,'0')}`,x+26,y+115);}
 backdrop(){const c=this.c,t=this.clock,cam=this.camera;const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#1c4149');sky.addColorStop(.55,'#547a78');sky.addColorStop(1,'#a0a58a');c.fillStyle=sky;c.fillRect(0,0,W,H);
 this.glow(1000-cam*.015,150,240,'#d5c99a25');
 // Background: harbor silhouettes, cranes and distant mountain ridge.
 c.beginPath();c.moveTo(0,310);for(let x=0;x<=W+60;x+=60)c.lineTo(x,270+noise(Math.floor((x+cam*.06)/60))*42);c.lineTo(W,470);c.lineTo(0,470);c.fillStyle='#436b6d';c.fill();
 for(let i=Math.floor(cam*.13/480)-1;i<(cam*.13+W)/480+1;i++){const x=i*480-cam*.13;this.rect(x,345,260,83,'#355c62');for(let j=0;j<6;j++)this.rect(x+j*43,350,2,75,'#6c8b7c35');this.line(x+300,360,x+300,166,'#355c62',6);this.line(x+300,170,x+450,190,'#355c62',6);this.line(x+300,170,x+230,214,'#355c62',3);this.line(x+300,205,x+440,190,'#355c62',2);this.line(x+436,190,x+436,290,'#355c62',2);this.rect(x+431,287,10,6,'#355c62');}
 this.rect(0,423,W,110,'#517d7c');for(let i=0;i<60;i++){const x=((i*89-cam*.2)%W+W)%W;this.rect(x,430+noise(i)*80,15+noise(i+2)*68,1,'#b9c4a128');}
 // Midground warehouses, pipes and brickwork at a slower parallax rate.
 for(let i=Math.floor(cam*.56/690)-1;i<(cam*.56+W)/690+1;i++){const x=i*690-cam*.56;this.warehouse(x,238+noise(i)*90,490,270-noise(i)*50,Math.abs(i));this.rect(x+520,395,100,100,'#47655b');this.line(x+530,398,x+610,485,'#71846a',2);this.line(x+610,398,x+530,485,'#71846a',2);}
 const fog=c.createLinearGradient(0,400,0,600);fog.addColorStop(0,'#6e998811');fog.addColorStop(1,'#173a4077');c.fillStyle=fog;c.fillRect(0,300,W,300);
 }
 ground(s){const x=s.x-this.camera;if(x>W+50||x+s.width<-50)return;const c=this.c;this.rect(x,s.y,s.width,170,'#263e3a');this.rect(x,s.y,s.width,9,'#a3b098');this.rect(x,s.y+9,s.width,9,'#4e6658');this.rect(x,s.y+18,s.width,145,'#34463d');this.line(x,s.y+1,x+s.width,s.y+1,'#e6d7aa',2);
 const start=Math.max(s.x,Math.floor(this.camera/160)*160);for(let wx=start;wx<Math.min(s.x+s.width,this.camera+W+160);wx+=160){const sx=wx-this.camera;const n=noise(wx);this.line(sx,s.y+43,sx+55,s.y+40,'#78907933');this.line(sx+55,s.y+40,sx+72,s.y+53,'#78907933');if(n>.25){this.ellipse(sx+45,s.y+7,35+n*25,2,'#bfd2b28c');this.ellipse(sx+45,s.y+8,28+n*25,1,'#78a2a099');}for(let b=0;b<5;b++)this.line(sx+b*7,s.y,sx+b*7-5,s.y-6-noise(wx+b)*14,'#6e8c63',2);}
 // Drain edge: a readable pale rim and amber warning stripe.
 for(const edge of [s.x,s.x+s.width])if(edge>0&&edge<(this.worldWidth??C.worldWidth)){const ex=edge-this.camera;this.rect(ex-6,s.y,12,115,'#7d8d77');for(let k=0;k<4;k++)this.rect(ex-5,s.y+4+k*20,10,8,'#d5b378');}
 }
 platform(s){const x=s.x-this.camera;if(x>W+40||x+s.width<-40)return;this.rect(x,s.y,s.width,s.height,'#425a50');this.rect(x,s.y,s.width,5,'#c5c8a3');this.rect(x,s.y+5,s.width,4,'#7a9270');this.line(x+10,s.y+16,x+s.width-10,s.y+16,'#9ea685',1);if(s.style)drawLedgeArchitecture(this,s);if(s.upper&&!s.style){this.line(x+25,s.y+24,x+25,590,'#26453c',5);this.line(x+s.width-25,s.y+24,x+s.width-25,590,'#26453c',5);this.line(x+25,s.y+24,x+s.width-25,590,'#526852',2);}}
 signal(cp,active){const x=cp.x-this.camera;if(x<-60||x>W+60)return;this.rect(x-4,cp.y-104,8,104,'#62786a');this.rect(x-14,cp.y-114,28,43,'#193b3e');this.ellipse(x,cp.y-100,7,7,active?'#d6e8ac':'#657b65');this.ellipse(x,cp.y-83,4,4,active?'#edbd83':'#4e6459');if(active)this.glow(x,cp.y-100,65,'#d9eeb633');this.rect(x-20,cp.y-60,40,19,'#31534b');this.c.fillStyle='#d2d5ad';this.c.font='10px monospace';this.c.textAlign='center';this.c.fillText(cp.id,x,cp.y-46);this.c.textAlign='left';}
 player(p,invulnerable){const c=this.c,x=p.x-this.camera,y=p.y;if(invulnerable&&Math.floor(this.clock*12)%2===0)c.globalAlpha=.45;this.ellipse(x,y+1,21,4,'#102d3270');c.save();c.translate(x,y);const stride=p.grounded?Math.sin(this.clock*19)*Math.min(4,Math.abs(p.vx)/60):0;this.rect(-9+stride,-10,7,10,'#e5dcbd');this.rect(3-stride,-10,7,10,'#e5dcbd');this.rect(-13,-32,26,24,'#e6dec1');this.rect(-13,-31,7,22,'#c2c7a7');this.ellipse(p.facing*5-4,-22,1.8,2.5,'#173a3c');this.ellipse(p.facing*5+5,-22,1.8,2.5,'#173a3c');c.fillStyle='#e6c694';c.beginPath();c.moveTo(-24,-31);c.bezierCurveTo(-21,-62,20,-63,25,-31);c.quadraticCurveTo(0,-22,-24,-31);c.fill();this.ellipse(0,-30,25,4,'#f1dec0');this.ellipse(-11,-41,5,3,'#fcf0cc');this.ellipse(8,-48,6,3,'#fcf0cc');this.rect(-15,-18,5,13,'#638776');c.restore();c.globalAlpha=1;}
 spore(s){const x=s.x-this.camera;if(s.collected||x<-40||x>W+40)return;const c=this.c,y=s.y+(this.reduced?0:Math.sin(this.clock*2+s.x)*4);this.glow(x,y,36,'#f6dfa847');c.fillStyle='#fff0b6';c.beginPath();c.moveTo(x,y-10);c.quadraticCurveTo(x+2,y-2,x+8,y);c.quadraticCurveTo(x+2,y+2,x,y+10);c.quadraticCurveTo(x-2,y+2,x-8,y);c.quadraticCurveTo(x-2,y-2,x,y-10);c.fill();this.ellipse(x,y,2,2,'#fffef0');}
 draw(game,dt){const {GROUND,PLATFORMS,CHECKPOINTS,GAPS,MUSHROOM,FINISH,movingAt}=game.level;this.worldWidth=game.level.worldWidth??C.worldWidth;W=this.canvas.width;this.clock+=this.reduced?0:dt;const c=this.c;
 if(game.mode==='title')this.camera=0;
 else if(['intro','opening'].includes(game.mode))this.camera=0;
 else if(!['result','coming-soon'].includes(game.mode))this.camera+=(Math.max(0,Math.min(this.worldWidth-W,game.player.x-W*.34))-this.camera)*Math.min(1,dt*5);
 this.backdrop();
 for(const gap of GAPS){const x=gap.x-this.camera;this.rect(x,610,gap.width,110,'#143e48');this.rect(x,610,gap.width,3,'#77a7a0');for(let j=0;j<8;j++){const off=Math.sin(this.clock*2+j)*8;this.line(x+12+off,625+j*9,x+gap.width-12+off,625+j*9,'#91b7a13a');}}
 // Gameplay layer and static props are drawn at exact collision coordinates.
 for(const s of GROUND)this.ground(s);
 if(game.level.SOLIDS)for(const s of game.level.SOLIDS){if(!s.ceiling){this.rect(s.x-this.camera,s.y,s.width,s.height,'#38574c');continue;}const x=s.x-this.camera;if(x+s.width<0||x>W)continue;this.warehouse(x,s.y,s.width,s.height,6);this.line(x,s.y+s.height,x+s.width,s.y+s.height,'#c2c49b',5);}
 for(const s of PLATFORMS)s.ground?this.ground(s):this.platform(s);
 for(const ferry of game.level.movingPlatformsAt?.(game.time)??[movingAt(game.time)].filter(Boolean)){this.platform(ferry);for(let i=0;i<4;i++)this.ellipse(ferry.x-this.camera+30+i*55,ferry.y+24,23,8,'#193e40');}
 for(let i=Math.floor(this.camera/900);i<(this.camera+W)/900+1;i++){const wx=i*900+330,x=wx-this.camera;if(GAPS.some(g=>wx>g.x-60&&wx<g.x+g.width+60))continue;this.mushroom(x,590,.18+noise(i)*.28,i%3===0);this.rect(x+70,568,54,22,'#4f6855');this.line(x+72,570,x+120,588,'#839075',1);}
 this.mushroom(MUSHROOM.x-this.camera,MUSHROOM.y,1.3,true);this.glow(MUSHROOM.x-this.camera,510,100,'#ed99742a');
 for(const cp of CHECKPOINTS)this.signal(cp,!!game.checkpoint&&game.checkpoint.x>=cp.x);
 for(const s of game.spores)this.spore(s);
 if(game.mapId===2)drawMap2Details(this,game);
 if(game.mapId===3)drawMap3Details(this,game);
 if(game.mapId>=4&&game.falling)drawMap4Details(this,game);
 if(game.mapId===5)drawMap5Details(this,game);
 if(game.mapId===0)drawStudio(this,game);
 const end=FINISH.x-this.camera;this.rect(end+40,410,10,180,'#85947b');this.rect(end+40,410,160,8,'#b2b69a');this.rect(end+181,410,10,180,'#85947b');this.glow(end+114,492,100,'#e3da9a30');c.fillStyle='#dedbb7';c.font='12px monospace';c.fillText('港區出口 →',end+64,455);
 if(game.mode==='title'){this.mushroom(W*.79,583,W<800?2:3.1,true,true);this.mushroom(W*.94,587,1.2,false);for(let i=0;i<12;i++)this.spore({x:840+noise(i)*370,y:310+noise(i+20)*220});}
 else {
  if(game.mapId===2&&game.drumsticksRemaining>0&&Math.abs(game.player.vx)>80&&!this.reduced){for(const offset of [24,44]){c.save();c.globalAlpha=.12;this.player({...game.player,x:game.player.x-offset*game.player.facing},false);c.restore();}}
  drawStatePlayer(this,game,game.invulnerable>0);
 }
 // Foreground reeds, rails, hanging cable and atmospheric motes.
 const cam=this.camera;for(let i=Math.floor(cam*1.12/450)-1;i<(cam*1.12+W)/450+1;i++){const x=i*450-cam*1.12;for(let j=0;j<9;j++)this.line(x+j*13,720,x+j*13-20,653-noise(i+j)*45,'#153731',3);}
 this.line(0,684,W,684,'#102e2e99',5);this.line(0,696,W,696,'#5b76624d',2);
 for(let i=0;i<30;i++){const x=((i*197-this.clock*(5+i%3)-cam*.8)%W+W)%W,y=90+noise(i)*540+Math.sin(this.clock*.7+i)*10;this.ellipse(x,y,1,1,'#d9d7a752');}
 const vignette=c.createRadialGradient(W/2,360,Math.min(260,W/3),W/2,360,Math.max(650,W*.64));vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#0b252d99');c.fillStyle=vignette;c.fillRect(0,0,W,H);
 if(game.mode==='intro'){let fade=game.intro<.5?1-game.intro*2:game.intro>2&&game.intro<3?1-Math.abs(game.intro-2.5)*2:0;c.fillStyle=`rgba(9,27,31,${fade})`;c.fillRect(0,0,W,H);}
 }
}
