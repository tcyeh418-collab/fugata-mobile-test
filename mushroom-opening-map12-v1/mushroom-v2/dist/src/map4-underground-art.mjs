import {drawCityDrainOutfall} from './map4-ground-art.mjs';
// City drainage cutaway: back wall and sump are scenery, not collision surfaces.
const ROOT=new URL('../assets/map4-city-revision-v4/',import.meta.url);let image=null,failed=false;
function load(){if(typeof Image==='undefined')return null;if(!image){image=new Image();image.onerror=()=>failed=true;image.src=new URL('shaft-wall.png',ROOT).href;}return image.complete&&image.naturalWidth?image:null;}
export function cityUndergroundStatus(){return{ready:!!load(),requested:image?1:0,failed:failed?['shaft-wall']:[]};}
function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),y,w,h);}
export function drawCityGap(r,gap){const c=r.c,x=gap.x-r.camera,w=gap.width;if(x+w<0||x>r.canvas.width)return;const im=load();c.save();c.imageSmoothingEnabled=false;c.beginPath();c.rect(x,590,w,130);c.clip();box(c,x,590,w,130,'#080d17');
 // Recessed, low contrast wet masonry. Every course is fixed in world space.
 for(let row=0;row<6;row++){const yy=604+row*18;box(c,x+8,yy,w-16,2,'#202b36');for(let xx=gap.x-40+(row%2)*32;xx<gap.x+w;xx+=64){box(c,xx-r.camera,yy+2,2,16,'#1b2732');if((Math.floor(xx/32)+row)%3===0)box(c,xx-r.camera+4,yy+4,24,2,'#152532');}}
 // Dark arches in the far wall expose depth, with no walkable lip over the opening.
 const count=Math.max(1,Math.floor(w/240)),spacing=w/count;
 for(let i=0;i<count;i++){const cx=x+(i+.5)*spacing,aw=Math.min(104,Math.max(40,w-52)),left=Math.round((cx-aw/2)/2)*2;box(c,left,642,aw,72,'#040811');for(let step=0;step<6;step++){const inset=(6-step)*4;box(c,left+inset,618+step*4,aw-inset*2,6,'#050a13');box(c,left+inset-4,618+step*4,4,4,'#27313c');box(c,left+aw-inset,618+step*4,4,4,'#1c2935');}box(c,left-4,642,4,60,'#27313b');box(c,left+aw,642,4,60,'#1c2935');}
 // Narrow service pipe behind the shaft; muted, no gold pickup-like highlights.
 box(c,x+10,610,w-20,6,'#263440');box(c,x+10,610,w-20,2,'#3b454c');for(let wx=Math.floor(gap.x/128)*128;wx<gap.x+w;wx+=128){box(c,wx-r.camera,608,4,10,'#444a50');box(c,wx-r.camera,610,2,6,'#55585a');}
 // Existing painted concrete abutments frame both sides, never bridge the hole.
 if(im){const edge=Math.min(40,Math.floor((w-24)/4)*2);c.drawImage(im,0,4,32,60,x+2,596,edge,120);c.save();c.translate(x+w-2,596);c.scale(-1,1);c.drawImage(im,0,4,32,60,0,0,edge,120);c.restore();}else for(const side of [x,x+w-16]){box(c,side,590,16,130,'#292e38');for(let yy=600;yy<720;yy+=20)box(c,side,yy,16,2,'#45434a');}
 // Sump is below screen-edge depth; dark water does not imply a safe surface.
 box(c,x+8,704,w-16,16,'#0c1c29');const phase=r.reduced?0:Math.floor((r.clock??0)*3)%4*2;for(let wx=gap.x+18;wx<gap.x+w-14;wx+=44){box(c,wx-r.camera+phase,708,18,2,'#263b48');box(c,wx-r.camera+12-phase,716,12,2,'#1b303f');}
 // Open mouth: charcoal cut edge below the intact sidewalk, and short exposed slabs.
 box(c,x+4,590,w-8,10,'#03070e');for(const side of [x,x+w-6]){box(c,side,590,6,12,'#8b8780');box(c,side,602,6,24,'#444953');box(c,side,626,4,94,'#171f2b');box(c,side,600,6,2,'#575762');}
 drawCityDrainOutfall(r,gap);c.restore();}
