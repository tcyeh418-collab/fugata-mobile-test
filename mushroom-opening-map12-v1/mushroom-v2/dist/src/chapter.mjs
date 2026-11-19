export const TOTAL_PHYSICAL=100;
export const CARD_IDS=['01','02','03'];
export const emptyBuffs=()=>({drumsticks:0,magnet:0,kickSpring:0,limit:0});
export function physicalProgress(value={}){return Object.fromEntries([1,2,3,4,5].map(id=>{const old=value[id]??{};return[id,{collected:Math.max(0,Math.min(20,Math.floor(Number(old.collected)||0))),total:20,...(Array.isArray(old.ids)?{ids:[...new Set(old.ids)].slice(0,20)}:{})}];}));}
export const totalPhysical=progress=>Object.values(physicalProgress(progress)).reduce((sum,p)=>sum+p.collected,0);
export function chapterRun(game,carry={}){
 const own=game.runState??{},history=physicalProgress({...carry.physicalSporeProgress,...own.physicalSporeProgress,[game.mapId]:{collected:game.count,total:20,ids:game.spores.filter(s=>s.collected).map(s=>s.id)}});
 return {...carry,...own,hp:game.player.hp,physicalSporeProgress:history,totalPhysicalSpores:totalPhysical(history),bonusSpores:Math.max(0,Number(own.bonusSpores??carry.bonusSpores)||0),buffs:game.mode==='result'||game.mode==='chapter-clear'?emptyBuffs():{...(own.buffs??emptyBuffs())},nextMapId:game.mode==='result'?game.mapId+1:game.mapId};
}
export function nextMapRun(run={}){return {...structuredClone(run),buffs:emptyBuffs()};}
export const RESCUE_TIERS=Object.freeze({tier2:50,tier3:83});
export function rescueSummary(run={}){const physical=totalPhysical(run.physicalSporeProgress),bonus=Math.max(0,Math.floor(Number(run.bonusSpores)||0)),energy=physical+bonus;return {physical,bonus,energy,tier:energy>=RESCUE_TIERS.tier3?3:energy>=RESCUE_TIERS.tier2?2:1};}
export function wallpaperRewards(data){return CARD_IDS.filter(id=>data[`hasMushroomArtCard${id}`]===true).map(id=>({id,url:data[`artCard${id}WallpaperURL`]??null}));}
