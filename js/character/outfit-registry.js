import {GENERATED_OUTFIT_REGISTRY} from './outfit-registry.generated.js';

const freezeList=value=>Object.freeze([...value]);
const freezeOutfit=entry=>Object.freeze({
  ...entry,
  ...(entry.itemIds?{itemIds:freezeList(entry.itemIds)}:{}),
  ...(entry.directions?{directions:freezeList(entry.directions)}:{}),
  ...(entry.frameNames?{frameNames:freezeList(entry.frameNames)}:{}),
  ...(entry.canvas?{canvas:freezeList(entry.canvas)}:{}),
  ...(entry.anchor?{anchor:freezeList(entry.anchor)}:{}),
});

export const OUTFIT_REGISTRY=Object.freeze({
  ...GENERATED_OUTFIT_REGISTRY,
  canvas:freezeList(GENERATED_OUTFIT_REGISTRY.canvas),
  anchor:freezeList(GENERATED_OUTFIT_REGISTRY.anchor),
  directions:freezeList(GENERATED_OUTFIT_REGISTRY.directions),
  frameNames:freezeList(GENERATED_OUTFIT_REGISTRY.frameNames),
  itemIds:freezeList(GENERATED_OUTFIT_REGISTRY.itemIds),
  outfits:Object.freeze(GENERATED_OUTFIT_REGISTRY.outfits.map(freezeOutfit)),
});

export const DEFAULT_OUTFIT_BY_SEX=Object.freeze({male:'casual-m',female:'musician-f'});
export const sexForTemplate=template=>template==='girl'?'female':'male';
export const templateForSex=sex=>sex==='female'?'girl':'boy';
export const outfitById=id=>OUTFIT_REGISTRY.outfits.find(entry=>entry.id===id)??null;
export const selectableOutfits=sex=>OUTFIT_REGISTRY.outfits.filter(entry=>entry.selectable&&(!sex||entry.sex===sex));
export function selectableOutfit(id,sex){
  const outfit=outfitById(id);
  return outfit?.selectable&&(!sex||outfit.sex===sex)?outfit:null;
}
export function defaultOutfit(sex){return selectableOutfit(DEFAULT_OUTFIT_BY_SEX[sex],sex);}
export function outfitFramePath(outfit,item,direction='front',frame=0){
  if(!outfit?.selectable)throw new Error('服裝未開放。');
  if(!outfit.itemIds.includes(item))throw new Error(`服裝 ${outfit.id} 不支援器材 ${item}。`);
  const safeDirection=outfit.directions.includes(direction)?direction:'front';
  const name=outfit.frameNames[((frame%outfit.frameNames.length)+outfit.frameNames.length)%outfit.frameNames.length];
  const parts=[outfit.sex];
  if(outfit.hasOutfitLayer)parts.push(outfit.id);
  parts.push(item,safeDirection,`${name}.png`);
  return parts.join('/');
}
export function outfitFrameUrl(outfit,item,direction='front',frame=0){
  return new URL(`${outfit.sourceRoot}${outfitFramePath(outfit,item,direction,frame)}`,import.meta.url).href;
}
