import {cityGroundStatus} from './map4-ground-art.mjs';
export {drawCityGround} from './map4-ground-art.mjs';
import {cityUndergroundStatus} from './map4-underground-art.mjs';
import {STATIC_PLATFORMS} from './map4.mjs';
import {drawContinuousCity,cityBackgroundStatus} from './map4-city-background.mjs';
// Map4 presentation: opaque masonry plinths and open structural eaves.
const ROOT=new URL('../assets/map4-city-revision-v4/',import.meta.url);
export const CITY_STYLES=Object.freeze({'m4-first-step':'arcade','m4-exit-a':'arcade','m4-exit-b':'arcade','m4-exit-c':'arcade','m4-practice-a':'mall','m4-practice-b':'mall','m4-practice-high':'mall','m4-practice-return':'mall','m4-magnet-a':'maintenance','m4-magnet-b':'maintenance','m4-crusher-watch':'maintenance','m4-late-a':'sign'});
export const CITY_KITS=Object.freeze(['arcade','mall','maintenance','sign','studio','falling']);
export const BUILDING_KITS=Object.freeze(['podium','canopy','falling']);
export const CITY_STRUCTURE=Object.freeze({'m4-first-step':'podium','m4-exit-a':'podium','m4-exit-b':'eave','m4-exit-c':'eave','m4-practice-a':'podium','m4-practice-b':'eave','m4-practice-high':'eave','m4-practice-return':'eave','m4-magnet-a':'podium','m4-magnet-b':'podium','m4-crusher-watch':'eave','m4-late-a':'podium'});
const images=new Map(),failed=new Set();
function load(key){if(typeof Image==='undefined')return null;if(!images.has(key)){const im=new Image();images.set(key,im);im.onerror=()=>failed.add(key);im.src=new URL(key+'.png',ROOT).href;}const im=images.get(key);return im.complete&&im.naturalWidth?im:null;}
export function cityArtStatus(){const background=cityBackgroundStatus(),underground=cityUndergroundStatus(),ground=cityGroundStatus();return{ready:BUILDING_KITS.map(load).every(Boolean)&&background.ready&&underground.ready&&ground.ready,failed:[...failed,...background.failed.map(i=>'background-'+i),...underground.failed,...ground.failed],requested:images.size+background.requested+underground.requested+ground.requested,cacheEntries:0,background};}
const snap=n=>Math.round(n/2)*2;
const noise=n=>{const v=Math.sin(n*137.19+63.71)*41713.13;return v-Math.floor(v);};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
export function cityStyle(s){return CITY_STYLES[s.id]??(s.id?.startsWith('m4-fall-')?'falling':null);}
export function drawCityBackdrop(r){cityArtStatus();drawContinuousCity(r);drawCityBuildings(r);}
// Backing is fully opaque wherever a solid exists. Open areas under eaves are air,
// not glass: no large fake facade is inserted over existing storefronts.
export function drawCityBuildings(r){const c=r.c,im=load('podium');for(const s of STATIC_PLATFORMS){const x=s.x-r.camera,h=590-s.y-24;if(x+s.width<0||x>r.canvas.width||h<=0)continue;c.save();c.imageSmoothingEnabled=false;if(CITY_STRUCTURE[s.id]==='podium'){rect(c,x,s.y+24,s.width,h,'#494954');if(im){const sh=Math.max(1,im.naturalHeight-12);for(let yy=s.y+24;yy<590;yy+=sh*2)for(let xx=x;xx<x+s.width;xx+=im.naturalWidth*2){const w=Math.min(im.naturalWidth*2,x+s.width-xx),hh=Math.min(sh*2,590-yy);c.drawImage(im,0,12,w/2,hh/2,xx,yy,w,hh);}}rect(c,x,s.y+24,4,h,'#737078');rect(c,x+s.width-4,s.y+24,4,h,'#292e3b');rect(c,x,586,s.width,4,'#242936');}
 else{for(const dx of [8,s.width-20]){rect(c,x+dx,s.y+24,12,h,'#424450');rect(c,x+dx,s.y+24,3,h,'#8a827b');rect(c,x+dx+8,s.y+24,4,h,'#2b3140');for(let yy=s.y+46;yy<586;yy+=28)rect(c,x+dx+2,yy,8,2,'#5f5c64');rect(c,x+dx-3,584,18,6,'#5f5c62');}}c.restore();}}
function fascia(r,s,key,x,y){const c=r.c,im=load(key),w=s.width;c.save();c.imageSmoothingEnabled=false;rect(c,x,y,w,24,key==='podium'?'#5b5960':'#383c47');if(im){const cap=8,edge=16,sh=Math.min(12,im.naturalHeight);c.drawImage(im,0,0,cap,sh,x,y,edge,24);c.drawImage(im,im.naturalWidth-cap,0,cap,sh,x+w-edge,y,edge,24);for(let dx=edge;dx<w-edge;dx+=64){const tw=Math.min(64,w-edge-dx);c.drawImage(im,cap,0,tw/2,sh,x+dx,y,tw,24);}}rect(c,x,y,w,2,'#c9c1ab');rect(c,x,y+2,w,2,'#8e8b85');rect(c,x,y+22,w,2,'#252d39');c.restore();}
export function drawCityPlatform(r,s,{state='stable',timer=0,warningDelay=1}={}){const kind=cityStyle(s);if(!kind)return false;const x=s.x-r.camera,y=s.y;if(x+s.width<0||x>r.canvas.width)return true;const c=r.c,shake=state==='warning'?snap(Math.sin(timer*80)*4):0,key=kind==='falling'?'falling':CITY_STRUCTURE[s.id]==='podium'?'podium':'canopy';fascia(r,s,key,x+shake,y);if(key==='canopy'){for(const dx of [26,s.width-42]){rect(c,x+dx,y+24,16,6,'#393b45');rect(c,x+dx+2,y+30,12,4,'#a9936c');}}if(kind==='falling'){for(const dx of [6,s.width-14])rect(c,x+dx+shake,y+8,8,6,state==='warning'?'#e7c18a':'#9f8768');if(state==='warning'){rect(c,x+shake,y,s.width,3,'#efdcab');for(let j=0;j<4;j++){const dx=s.width*(j+1)/5;rect(c,x+dx+shake,y+7,2,12,'#d0af82');rect(c,x+dx,y+27+(1-timer/warningDelay)*12,2,2,'#b4aa96');}}}return true;}
