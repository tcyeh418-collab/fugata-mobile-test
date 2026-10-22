import {LEROY,SECRET,SPRINT,PROJECTILE,GAPS} from './map2.mjs?rev=map5-20261020-r1';
export function drawMap2Details(r,game){
 const c=r.c,cam=r.camera;
 const lx=LEROY.x-cam;
 if(lx>-180&&lx<r.canvas.width+180){
  r.rect(lx-105,424,210,8,'#9a9d7c');r.rect(lx-97,432,7,158,'#4d6657');r.rect(lx+90,432,7,158,'#4d6657');
  r.rect(lx+35,550,96,40,'#4e6557');r.line(lx+40,563,lx+125,563,'#bdba91',2);r.rect(lx+58,543,32,8,'#c7c09b');
  // Leroy is a human placeholder drummer, separate from the mushroom silhouette.
  r.ellipse(lx,584,26,5,'#0d292f77');r.rect(lx-15,549,12,39,'#263d40');r.rect(lx+4,549,12,39,'#263d40');
  r.rect(lx-21,500,42,54,'#ae705a');r.rect(lx-26,505,9,39,'#d2ab85');r.rect(lx+18,505,9,39,'#d2ab85');
  r.ellipse(lx,484,18,21,'#d6b18a');r.rect(lx-19,468,38,10,'#3f5f53');r.rect(lx-24,476,48,5,'#4f7762');
  r.line(lx-18,542,lx+32,514,'#eddbad',4);r.line(lx+24,542,lx-13,515,'#eddbad',4);
  c.fillStyle='#e7d9b7';c.font='12px monospace';c.textAlign='center';c.fillText('LEROY',lx,450);c.textAlign='left';
  if(game.mode==='leroy-gift'){r.glow(lx+60,490,60,'#efdc9155');r.line(lx+43,504,lx+75,469,'#ffdf9e',5);r.line(lx+45,469,lx+76,504,'#ffdf9e',5);}
 }
 for(const emitter of game.emitters){const x=emitter.x-cam;if(x<-100||x>r.canvas.width+100)continue;
  r.rect(x-22,558,44,32,'#33504c');r.rect(x-42,561,35,17,'#88937a');r.ellipse(x-42,569,5,10,'#172f35');
  const telegraph=emitter.phase==='telegraph';r.ellipse(x+2,550,8,8,telegraph?'#ffd18a':'#7e8b67');
  if(telegraph){r.glow(x,546,76,'#ffbe754a');c.fillStyle='#f5ca91';c.font='19px monospace';c.fillText('!',x-5,523);r.line(x-135,573,x-63,573,'#f3c481',2);}
 }
 for(const p of game.projectiles){const x=p.x-cam;r.glow(x,p.y,32,'#eb9d6b42');r.rect(x-11,p.y-9,22,18,'#edac7d');r.rect(x-8,p.y-6,5,12,'#ffe1a7');r.line(x+16,p.y,x+35,p.y,'#e4bd8055',2);}
 const sx=SECRET.x-cam;
 if(sx>-150&&sx<r.canvas.width+150){
  r.glow(sx,578,90,'#a7d1b53a');r.ellipse(sx,590,45,8,'#162f37');r.ellipse(sx,587,45,5,'#9da88a');
  for(let j=-2;j<=2;j++)r.line(sx-32,587+j,sx+32,587+j,'#365f5c');
  r.rect(sx+52,501,6,89,'#718a6e');r.rect(sx+40,493,30,21,'#203f44');
  r.ellipse(sx+55,502,5,5,'#d1ddb0');r.glow(sx+55,502,40,'#d5e7b72a');
  c.fillStyle='#d6deba';c.font='12px monospace';c.textAlign='center';c.fillText('↓  地底的節拍',sx,550);c.textAlign='left';
 }
 const start=SPRINT.restartX-cam;
 if(start>-150&&start<r.canvas.width+150){
  r.rect(start-45,577,90,13,'#d3bb82');c.fillStyle='#254440';c.font='10px monospace';c.fillText('START →',start-30,587);
  r.rect(start-60,490,5,100,'#829981');r.rect(start-60,482,120,31,'#21464b');c.fillStyle='#e4d29b';c.fillText('30s WATERWAY',start-53,502);
 }
 for(const gap of GAPS.filter(g=>g.speedGate)){
  const edge=gap.x-cam;if(edge<-500||edge>r.canvas.width+200)continue;
  for(let dx=-155;dx<-15;dx+=28){r.line(edge+dx,578,edge+dx+14,584,'#e2c68c',3);r.line(edge+dx+14,584,edge+dx,590,'#e2c68c',3);}
  r.line(edge+gap.width+28,590,edge+gap.width+28,533,'#8f9e80',3);r.rect(edge+gap.width+28,534,28,17,'#c29a69');
 }
 if(game.player.x>SPRINT.start-200&&game.player.x<SPRINT.end+200){
  const start=Math.floor(cam/500)*500;for(let x=start;x<cam+r.canvas.width;x+=500){r.line(x-cam,606,x-cam+85,606,'#dcc38c66',2);r.line(x-cam+72,600,x-cam+85,606,'#dcc38c66',2);}
 }
}
