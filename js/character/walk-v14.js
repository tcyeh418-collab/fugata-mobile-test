// Registry-driven full-person frames. The filename is retained as a compatibility
// import for older tests and modules; both v14 and v15 sources are supported here.
import {OUTFIT_REGISTRY,defaultOutfit,outfitFramePath,outfitFrameUrl,selectableOutfit,sexForTemplate} from './outfit-registry.js';

export const WALK_ART_SET='walk-v14';
export const WALK=Object.freeze({
 width:OUTFIT_REGISTRY.canvas[0],height:OUTFIT_REGISTRY.canvas[1],foot:OUTFIT_REGISTRY.anchor,
 scale:0.125,frameSeconds:OUTFIT_REGISTRY.frameDurationMs/1000,
});
export const HELD_PATHS=Object.freeze({sticks:'drumsticks',violin:'violin',modular:'modular-synth',macbook:'macbook',guitar:'guitar',keyboard:'mini-keyboard',sax:'saxophone',mic:'microphone',score:'music-book',none:'none'});
export const DIRECTIONS=OUTFIT_REGISTRY.directions;
export const MAX_WALK_CACHE=64;

const images=new Map(),pending=new Map();
let latestLoad=0,latestKeep=new Set();
let createImage=()=>new Image();

export function walkPreset(template='boy',nickname='',instrument='none',outfitId){
 const sex=sexForTemplate(template),outfit=selectableOutfit(outfitId,sex)??defaultOutfit(sex);
 return {version:1,artSet:`walk-v${outfit.assetVersion}`,nickname,sex,template:sex==='female'?'girl':'boy',body:'regular',hair:sex==='female'?'long':'crop',hairColor:'espresso',skin:'porcelain',expression:'smile',outfit:outfit.id,hat:'none',glasses:'none',instrument:instrument in HELD_PATHS?instrument:'none'};
}
export function characterOutfit(c){return selectableOutfit(c?.outfit,sexForTemplate(c?.template));}
export function supportsWalk(c){
 const outfit=characterOutfit(c),item=HELD_PATHS[c?.instrument];
 const compatibleArtSet=!c?.artSet||c.artSet==='walk-v14'||c.artSet==='walk-v15';
 return Boolean(compatibleArtSet&&outfit&&item&&outfit.itemIds.includes(item));
}
export function supportNotice(c){
 if(c?.loadNotice)return c.loadNotice;
 if(supportsWalk(c))return '四方向完整人物動畫｜服裝與器材已載入';
 return '角色設定不相容，請重新選擇造型。';
}
export function framePath(c,direction='front',frame=0,hideInstrument=false){
 const outfit=characterOutfit(c);if(!outfit)throw new Error('角色服裝未開放。');
 const item=HELD_PATHS[hideInstrument?'none':c.instrument]??'none';
 return outfitFramePath(outfit,item,direction,frame);
}
export function frameSourcePath(c,direction='front',frame=0,hideInstrument=false){
 const outfit=characterOutfit(c);if(!outfit)throw new Error('角色服裝未開放。');
 return `${outfit.sourceRoot.replace('../../','')}${framePath(c,direction,frame,hideInstrument)}`;
}
function frameUrl(c,direction='front',frame=0,hideInstrument=false){
 const outfit=characterOutfit(c);if(!outfit)throw new Error('角色服裝未開放。');
 const item=HELD_PATHS[hideInstrument?'none':c.instrument]??'none';
 return outfitFrameUrl(outfit,item,direction,frame);
}
function cacheKey(spec){return frameUrl(spec.character,spec.direction,spec.frame,spec.hideInstrument);}
function enforceLimit(protectedKeys=latestKeep){
 for(const key of images.keys()){
  if(images.size<=MAX_WALK_CACHE)break;
  if(!protectedKeys.has(key))images.delete(key);
 }
 for(const key of images.keys()){
  if(images.size<=MAX_WALK_CACHE)break;
  images.delete(key);
 }
}
async function load(key){
 if(images.has(key)){const image=images.get(key);images.delete(key);images.set(key,image);return image;}
 if(pending.has(key))return pending.get(key);
 const promise=new Promise((resolve,reject)=>{
  const image=createImage();
  image.onload=()=>{images.set(key,image);enforceLimit();resolve(image);};
  image.onerror=()=>reject(new Error('角色動畫素材載入失敗，請重試。'));
  image.src=key;
 }).finally(()=>pending.delete(key));
 pending.set(key,promise);return promise;
}
async function loadRequests(specs,{retain=true}={}){
 const request=++latestLoad,keys=[...new Set(specs.map(cacheKey))];
 if(retain)latestKeep=new Set(keys);
 await Promise.all(keys.map(load));
 if(retain&&request===latestLoad){for(const key of [...images.keys()])if(!latestKeep.has(key))images.delete(key);}
 else if(retain){for(const key of keys)if(!latestKeep.has(key))images.delete(key);}
 enforceLimit();
 return specs.map(spec=>images.get(cacheKey(spec)));
}
export function gameplayFrameRequests(c){
 if(!supportsWalk(c))return [];
 return [false,true].flatMap(hideInstrument=>DIRECTIONS.flatMap(direction=>OUTFIT_REGISTRY.frameNames.map((_,frame)=>({character:c,direction,frame,hideInstrument}))));
}
// Entering play loads only the chosen outfit's selected item and empty hands.
export async function loadWalkArt(c){
 const requests=gameplayFrameRequests(c);if(!requests.length)return;
 await loadRequests(requests);
}
// Creator loads one idle frame for the active preview and one per visible card.
export async function loadCreatorWalkArt(selected,direction,candidates=[]){
 const specs=[{character:selected,direction,frame:1,hideInstrument:false},...candidates.map(character=>({character,direction:'front',frame:1,hideInstrument:false}))];
 const loaded=await loadRequests(specs);
 return {portrait:loaded[0],thumbnails:loaded.slice(1)};
}
export async function loadWalkPortrait(c){
 if(!supportsWalk(c))return;
 return (await loadRequests([{character:c,direction:'front',frame:1,hideInstrument:false}]))[0];
}
export function walkFrame(state,reducedMotion=false){
 const player=state.player,transition=state.roomTransition;
 return player.moving&&!state.dialogue?.active&&(!transition?.active||transition.phase==='door-perspective')&&!reducedMotion?Math.floor((player.walkTime||0)/WALK.frameSeconds)%4:1;
}
export function drawWalk(ctx,c,{direction='front',frame=1,hideInstrument=false,x=0,y=0,scale=1}={}){
 const image=images.get(frameUrl(c,direction,frame,hideInstrument));if(!image)return false;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(image,x-WALK.foot[0]*scale,y-WALK.foot[1]*scale,WALK.width*scale,WALK.height*scale);ctx.restore();return true;
}

// Small diagnostics surface used by integration tests; production callers only read it.
export function walkCacheInfo(){return {size:images.size,pending:pending.size,limit:MAX_WALK_CACHE,keys:[...images.keys()]};}
export function configureWalkImageLoaderForTests(factory){createImage=factory??(()=>new Image());images.clear();pending.clear();latestKeep=new Set();latestLoad=0;}
