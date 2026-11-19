// One fixed world panorama. Source: 21 continuous panels, shared320, stride1840.
// Native2x grid, content1024 native +4px bleed on each side. No repeated facade bank.
const ROOT=new URL('../assets/map4-city-continuous-v2/',import.meta.url);
const entries=new Map(),failed=new Set(),decoded=new Set();
// Same approved coefficients as Map1 local-playtest-v9 / public-test-v2 environment-v4.
// Map4 remains at night: use Map1 atmosphereColor(0), never its daytime progression.
export const CITY_SOFTENING=Object.freeze({strength:.85,blur:.8*.85,saturation:1-(1-.62)*.85,contrast:1-(1-.72)*.85,brightness:1+.06*.85,tintAlpha:35,fogAlpha:86,color:Object.freeze([62,82,111])});
const softened=new WeakMap();let softenedCount=0,prepareMs=0,fogEnabled=true;
export function setCityFogEnabled(value){fogEnabled=value!==false;return fogEnabled;}
export function cityFogStatus(){return{enabled:fogEnabled,cached:softenedCount,prepareMs,settings:CITY_SOFTENING};}
function soften(im){if(softened.has(im))return softened.get(im);let cv;if(typeof OffscreenCanvas==='function')cv=new OffscreenCanvas(im.naturalWidth,im.naturalHeight);else if(typeof document!=='undefined'){cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;}else return im;const q=cv.getContext('2d'),t=performance.now(),s=CITY_SOFTENING;q.filter=`blur(${s.blur}px) saturate(${s.saturation}) contrast(${s.contrast}) brightness(${s.brightness})`;q.drawImage(im,0,0);q.filter='none';q.fillStyle=`rgba(${s.color.join(',')},${s.tintAlpha/255})`;q.fillRect(0,0,cv.width,cv.height);softened.set(im,cv);softenedCount++;prepareMs+=performance.now()-t;return cv;}

export const CITY_BACKGROUND=Object.freeze({worldWidth:38000,scale:2,tileWidth:2048,count:19,bleed:4,lastContent:1136});
function load(i){if(typeof Image==='undefined')return null;let im=entries.get(i);if(!im){im=new Image();entries.set(i,im);im.decoding='async';im.onload=()=>im.decode().then(()=>{soften(im);decoded.add(i);},()=>failed.add(i));im.onerror=()=>failed.add(i);im.src=new URL(`map4-${String(i).padStart(2,'0')}.png`,ROOT).href;}return decoded.has(i)?im:null;}
export function cityBackgroundStatus(){for(let i=0;i<19;i++)load(i);return{ready:decoded.size===19,requested:entries.size,loaded:decoded.size,failed:[...failed],worldWidth:38000,fog:cityFogStatus()};}
export function drawContinuousCity(r,{fog=fogEnabled}={}){const c=r.c,W=r.canvas.width,cam=Math.round(r.camera/2)*2;c.save();c.imageSmoothingEnabled=false;
 // Complete fallback under every tile, including decoded/error gaps and level edges.
 const sky=c.createLinearGradient(0,0,0,720);sky.addColorStop(0,'#293c80');sky.addColorStop(.65,'#6c627d');sky.addColorStop(1,'#253c52');c.fillStyle=sky;c.fillRect(0,0,W,720);
 const first=Math.max(0,Math.floor(cam/2048)),last=Math.min(18,Math.floor((cam+W)/2048));
 for(let i=first;i<=last;i++){const im=load(i);if(!im)continue;const content=i===18?1136:2048;c.drawImage(fog?soften(im):im,4,0,content/2,360,i*2048-cam,0,content,720);}if(fog){const s=CITY_SOFTENING,veil=c.createLinearGradient(0,320,0,620);veil.addColorStop(0,`rgba(${s.color.join(',')},0)`);veil.addColorStop(1,`rgba(${s.color.join(',')},${s.fogAlpha/255})`);c.fillStyle=veil;c.fillRect(0,320,W,400);}c.restore();}
