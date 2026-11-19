// Map4 city sidewalk cutaway. All texture origins are world anchored at native 2x.
// Shared raster textures from Map1; geometry is still owned by map4.mjs.
const ROOT=new URL('../assets/map4-city-ground-v5/',import.meta.url),images=new Map(),failed=new Set();
const FILES=['sidewalk-edge','foundation','runoff-water'];
function load(key){if(typeof Image==='undefined')return null;if(!images.has(key)){const im=new Image();images.set(key,im);im.onerror=()=>failed.add(key);im.src=new URL(key+'.png',ROOT).href;}const im=images.get(key);return im.complete&&im.naturalWidth?im:null;}
export function cityGroundStatus(){return{ready:FILES.map(load).every(Boolean),requested:images.size,failed:[...failed]};}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function tiles(r,key,left,right,y,h,offset=0){const c=r.c,im=load(key);if(!im)return;const tw=im.naturalWidth*2,th=im.naturalHeight*2;for(let wx=Math.floor((left-offset)/tw)*tw+offset;wx<right;wx+=tw)for(let yy=y;yy<y+h;yy+=th)c.drawImage(im,wx-r.camera,yy,tw,th);}
export function drawCityGround(r,s){const c=r.c,left=Math.max(s.x,Math.floor(r.camera/2)*2),right=Math.min(s.x+s.width,r.camera+r.canvas.width+2);if(right<=left)return;const x=left-r.camera,w=right-left;cityGroundStatus();c.save();c.imageSmoothingEnabled=false;c.beginPath();c.rect(s.x-r.camera,s.y,s.width,130);c.clip();
 // Opaque concrete foundation: background never bleeds through the walking surface.
 rect(c,x,590,w,130,'#292d38');c.save();c.beginPath();c.rect(x,656,w,64);c.clip();tiles(r,'foundation',left,right,656,64);rect(c,x,656,w,64,'#17213bd9');c.restore();
 // Front apron of the sidewalk, with low contrast staggered paving joints.
 rect(c,x,590,w,40,'#555764');for(let row=0;row<2;row++){const yy=594+row*16,offset=row*40;for(let wx=Math.floor((left-offset)/80)*80+offset;wx<right;wx+=80){rect(c,wx-r.camera,yy,78,14,((wx/40+row)%3===0)?'#62616a':'#585b66');rect(c,wx-r.camera,yy+12,78,2,'#414754');rect(c,wx-r.camera+2,yy,74,2,'#74717a');}}
 // Common Map1 stone edge, muted to the blue-purple city evening palette.
 c.save();c.beginPath();c.rect(x,590,w,12);c.clip();tiles(r,'sidewalk-edge',left,right,590,12);rect(c,x,590,w,12,'#27334980');c.restore();rect(c,x,590,w,2,'#b9b6ac');rect(c,x,602,w,2,'#434957');
 // Solid curb above a shallow roadside drain; channel stays below collision y590.
 rect(c,x,628,w,4,'#79777c');rect(c,x,632,w,8,'#3b4352');rect(c,x,640,w,16,'#182837');c.save();c.beginPath();c.rect(x,642,w,12);c.clip();const shift=(r.reduced?0:Math.floor((r.clock??0)*3)%32*2);tiles(r,'runoff-water',left,right,642,12,-shift);rect(c,x,642,w,12,'#14223cbb');c.restore();rect(c,x,654,w,4,'#111c2a');rect(c,x,658,w,2,'#4e5360');
 // Small drain grilles at fixed world locations, never masquerading as pickups.
 for(let wx=Math.floor(left/640)*640+160;wx<right;wx+=640){rect(c,wx-r.camera,636,64,20,'#202733');rect(c,wx-r.camera,636,64,2,'#6f7077');for(let j=4;j<60;j+=8){rect(c,wx-r.camera+j,640,4,12,'#101a25');rect(c,wx-r.camera+j+4,640,2,12,'#4d5360');}}
 // Foundation courses are quiet and darker than platforms or danger markers.
 for(const yy of [678,702]){rect(c,x,yy,w,2,'#222a38');for(let wx=Math.floor(left/160)*160+(yy===702?80:0);wx<right;wx+=160)rect(c,wx-r.camera,yy-18,2,18,'#242d3b');}
 c.restore();for(const ex of [s.x,s.x+s.width])if(ex>0&&ex<38000){rect(c,ex-r.camera-2,590,4,40,'#77747a');rect(c,ex-r.camera-2,630,4,26,'#363d4a');}}
// Drain outlets remain on the sides of black fall shafts, leaving the centre open.
export function drawCityDrainOutfall(r,gap){const c=r.c,x=gap.x-r.camera,w=gap.width;const phase=(r.reduced?0:Math.floor((r.clock??0)*7)%4);c.save();c.imageSmoothingEnabled=false;for(const side of [0,1]){const px=side?x+w-14:x+6;rect(c,px-2,636,12,14,'#141e2a');rect(c,px-2,636,12,2,'#686b72');rect(c,px,640,8,8,'#294356');for(let yy=648;yy<708;yy+=4){const fade=yy<672?'#3b5365':'#263746';rect(c,px+2+((yy/4+phase)%3===0?2:0),yy,4,4,fade);}rect(c,px+2,650+phase*12,2,6,'#6a7f89');}c.restore();}
