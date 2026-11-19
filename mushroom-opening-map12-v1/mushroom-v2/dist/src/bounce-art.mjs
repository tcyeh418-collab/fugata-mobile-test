// Shared existing Map1 bounce art. Keeps every level's collision and physics unchanged.
export const BOUNCE_ART=Object.freeze({frame:[64,48],scale:2,anchor:[32,48],frames:3});
const image=typeof Image==='function'?new Image():null;
if(image)image.src=new URL('../assets/bounce-plant-v1/sheet.png',import.meta.url).href;
const states=new WeakMap;
export function bounceFrame(age,reduced=false){return reduced||age<0||age>=.24?0:age<.10?1:2;}
export function drawBouncePlant(r,g){
 const m=g.level.MUSHROOM;if(!m||m.x<0||m.x>(g.level.worldWidth??Infinity))return false;
 const x=m.x-r.camera;if(x+64<0||x-64>r.canvas.width)return false;
 let s=states.get(g);if(!s||g.time<s.time){s={count:g.bounceCount,time:g.time,at:-Infinity};states.set(g,s);}
 if(s.count!==g.bounceCount){s.count=g.bounceCount;s.at=g.time;}s.time=g.time;
 const c=r.c,frame=bounceFrame(g.time-s.at,r.reduced);c.save();c.imageSmoothingEnabled=false;
 if(image?.complete&&image.naturalWidth)c.drawImage(image,frame*64,0,64,48,Math.round(x)-64,m.y-96,128,96);
 else { // Readable pixel fallback with the same idle top, width and foot anchor.
  c.fillStyle='#e6ce9c';c.fillRect(x-11,m.capY+30,22,m.y-m.capY-30);c.fillStyle='#b93932';c.fillRect(x-50,m.capY+10,100,22);c.fillRect(x-42,m.capY+4,84,6);c.fillRect(x-30,m.capY,60,4);c.fillStyle='#ffe3b2';c.fillRect(x-26,m.capY+9,12,6);c.fillRect(x+8,m.capY+4,12,6);c.fillRect(x+29,m.capY+16,10,5);
 }c.restore();return true;
}
