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
 }
 for(const p of game.projectiles){const x=p.x-cam;r.rect(x-11,p.y-9,22,18,'#edac7d');r.rect(x-8,p.y-6,5,12,'#ffe1a7');}
 const sx=SECRET.x-cam;
 if(sx>-150&&sx<r.canvas.width+150){
  r.glow(sx,578,90,'#a7d1b53a');r.ellipse(sx,590,45,8,'#162f37');r.ellipse(sx,587,45,5,'#9da88a');
  for(let j=-2;j<=2;j++)r.line(sx-32,587+j,sx+32,587+j,'#365f5c');
  r.rect(sx+52,501,6,89,'#718a6e');r.rect(sx+40,493,30,21,'#203f44');
  r.ellipse(sx+55,502,5,5,'#d1ddb0');r.glow(sx+55,502,40,'#d5e7b72a');
  c.fillStyle='#d6deba';c.font='12px monospace';c.textAlign='center';c.fillText('↓  地底的節拍',sx,550);c.textAlign='left';
 }
}
