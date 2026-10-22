import {BEAR,PROJECTILE,GIANT} from './map3.mjs?rev=map5-20261020-r1';
export function drawStatePlayer(r,game,invulnerable){
 const p=game.player;if(!game.isGiant&&!p.crouching){r.player(p,invulnerable);return;}
 const c=r.c,x=p.x-r.camera,scale=game.isGiant?GIANT.visualScale:1,sy=scale*(p.crouching?(game.isGiant ? .28 : .45):1);
 c.save();c.translate(x,p.y);c.scale(scale,sy);c.translate(-x,-p.y);r.player(p,invulnerable);c.restore();
 if(game.isGiant){r.ellipse(x,p.y-28,36,54,'#b8dcb317');r.line(x-28,p.y-6,x-28,p.y-45,'#c6dca9',2);r.line(x+28,p.y-6,x+28,p.y-45,'#c6dca9',2);}
}
export function drawMap3Details(r,g){
 const c=r.c,cam=r.camera,bx=BEAR.x-cam;
 if(bx>-240&&bx<r.canvas.width+240){
  r.rect(bx-130,427,255,163,'#294f50');r.rect(bx-119,438,105,105,'#172f37');
  for(let i=0;i<5;i++){r.rect(bx-114+i*20,443,15,90,'#8d9c83');for(let j=0;j<3;j++)r.ellipse(bx-107+i*20,458+j*22,4,4,'#35565a');}
  r.line(bx-107,502,bx-48,538,'#cf926a',3);r.line(bx-67,502,bx-7,547,'#d9c98a',3);r.rect(bx-111,548,88,26,'#112f38');
  const voltage=g.mode==='reactor'||g.bearBeatEventCompleted;r.rect(bx-104,555,voltage?74:18,10,voltage?'#d6d9a2':'#6c8a76');
  r.ellipse(bx+45,489,22,22,'#aa8167');r.ellipse(bx+26,469,10,11,'#aa8167');r.ellipse(bx+65,469,10,11,'#aa8167');r.ellipse(bx+45,493,12,10,'#d0b28b');r.ellipse(bx+38,485,2,3,'#17383a');r.ellipse(bx+53,485,2,3,'#17383a');r.rect(bx+21,512,48,52,'#726e85');r.rect(bx+24,563,16,27,'#334b51');r.rect(bx+52,563,16,27,'#334b51');r.line(bx+19,477,bx+70,477,'#b3c5a1',5);r.rect(bx+16,477,7,21,'#314b54');r.rect(bx+67,477,7,21,'#314b54');
  c.fillStyle='#e6dab2';c.font='12px monospace';c.fillText('MISS DJ BEAR BEAT',bx-105,408);
  if(g.mode==='reactor'){r.glow(bx-45,475,100,'#cfdf9760');r.rect(bx-60,455,34,40,'#e2cf95');c.fillStyle='#284b49';c.font='26px monospace';c.fillText('ϟ',bx-53,485);}
 }
 for(const e of g.emitters){const x=e.x-cam;if(x<-100||x>r.canvas.width+100)continue;const kind=e.sequence[e.index%e.sequence.length],y=kind==='low'?PROJECTILE.lowY:PROJECTILE.highY;
  r.rect(x-20,560,40,30,'#34545a');r.line(x,560,x,y,'#9ca48a',8);r.rect(x-38,y-9,35,18,kind==='low'?'#ce946d':'#91bdd0');
  r.ellipse(x,535,7,7,e.phase==='telegraph'?'#f6d58e':'#6d907b');
  c.fillStyle=kind==='low'?'#f2c18f':'#b8dce6';c.font='19px monospace';c.fillText(kind==='low'?'↑':'↓',x-10,518);
  if(e.phase==='telegraph'){r.glow(x,y,65,'#f8d28c3b');r.line(x-145,y,x-48,y,kind==='low'?'#e8b780':'#a9d4dd',2);}
 }
 for(const p of g.projectiles){const x=p.x-cam;if(x<-60||x>r.canvas.width+60)continue;r.glow(x,p.y,28,p.kind==='low'?'#ecaa773b':'#9dcfe83b');r.rect(x-12,p.y-7,24,14,p.kind==='low'?'#f2b07c':'#a5d7e5');r.line(x+17,p.y,x+33,p.y,'#c9d6b8',2);}
 for(const b of g.breakables){const x=b.x-cam;if(x<-150||x>r.canvas.width+150)continue;
  if(b.broken){r.rect(x,b.y-5,25,5,'#a49c78');r.rect(x+42,b.y-9,17,9,'#7a8b74');continue;}
  const dx=b.shake>0?Math.sin(b.shake*75)*4:0,y=b.y-b.height,special=b.kind==='special';
  r.rect(x+dx,y,b.width,b.height,special?'#65818a':'#836e53');r.rect(x+dx+5,y+5,b.width-10,b.height-10,special?'#304e5a':'#9a8766');
  r.line(x+dx+4,y+4,x+dx+b.width-4,y+b.height-4,special?'#edce86':'#bdb088',3);r.line(x+dx+b.width-4,y+4,x+dx+4,y+b.height-4,special?'#edce86':'#bdb088',3);
  if(special){r.glow(x+b.width/2,y+20,70,'#d6c48228');r.rect(x+dx+b.width/2-17,y+20,34,38,'#182f3c');c.font='29px monospace';c.fillStyle='#eed49a';c.fillText('ϟ',x+dx+b.width/2-10,y+48);}
 }
 if(g.cardPickup){const x=g.cardPickup.x-cam;r.glow(x,g.cardPickup.y,50,'#e3d8a84d');r.rect(x-17,g.cardPickup.y-20,34,34,'#c9ba8b');r.ellipse(x,g.cardPickup.y-3,11,11,'#274b4c');}
}
