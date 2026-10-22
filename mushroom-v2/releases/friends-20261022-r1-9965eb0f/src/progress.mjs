import {CARD_IDS,chapterRun,physicalProgress,totalPhysical,emptyBuffs,rescueSummary} from './chapter.mjs?rev=map5-20261020-r1';
export const PROGRESS_KEY='logiccode.mushroom.v2.progress.2';
export const CARD_DEFAULTS=Object.freeze({hasMushroomArtCard01:false,hasMushroomArtCard02:false,hasMushroomArtCard03:false,artCard01WallpaperURL:null,artCard02WallpaperURL:null,artCard03WallpaperURL:null});
const defaults=()=>({version:2,collectionRevision:2,physicalSchemaVersion:0,...Object.fromEntries([2,3,4,5].flatMap(id=>[[`map${id}Clear`,false],[`map${id}Best`,0],[`map${id}Last`,0],[`map${id}Current`,null],[`map${id}EntryRun`,null]])),advancedDanceCleared:false,totalPhysicalSpores:0,chapterClear:false,finalResult:null,map5Final:null,runState:{isGiant:false,giantShield:0,nextMapId:1,physicalSporeProgress:physicalProgress(),totalPhysicalSpores:0,bonusSpores:0,buffs:emptyBuffs()},...CARD_DEFAULTS});
const wallpaperURL=url=>{try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
export class ProgressStore{
 constructor(storage,{qa=false,onError=()=>{}}={}){this.storage=storage;this.key=PROGRESS_KEY+(qa?'.qa':'');this.onError=onError;this.data=this.read();}
 read(){try{const parsed=JSON.parse(this.storage.getItem(this.key)||'null');if(parsed?.version!==2)return defaults();const data={...defaults(),...parsed};for(const id of CARD_IDS){data[`hasMushroomArtCard${id}`]=parsed[`hasMushroomArtCard${id}`]===true;data[`artCard${id}WallpaperURL`]=wallpaperURL(parsed[`artCard${id}WallpaperURL`]);}if(data.advancedDanceCleared)data.hasMushroomArtCard03=true;data.runState={...defaults().runState,...parsed.runState};const history={...data.runState.physicalSporeProgress};for(const id of [2,3,4])if(!history[id]&&data[`map${id}Clear`])history[id]={collected:data[`map${id}Last`],total:20};data.runState.physicalSporeProgress=physicalProgress(history);data.totalPhysicalSpores=totalPhysical(history);data.runState.totalPhysicalSpores=data.totalPhysicalSpores;if(data.finalResult)data.finalResult={...data.finalResult,...rescueSummary(data.map5Final??(data.finalResult.physicalSporeProgress?{physicalSporeProgress:data.finalResult.physicalSporeProgress,bonusSpores:data.finalResult.bonus}:data.runState))};data.collectionRevision=2;return data;}catch{return defaults();}}
 save(){try{this.storage.setItem(this.key,JSON.stringify(this.data));return true;}catch{this.onError('此瀏覽器無法保存進度；請保持分頁開啟');return false;}}
 capture(game){
  if(game.mapId<1||game.mapId>5)return;
  for(const id of CARD_IDS)this.data[`hasMushroomArtCard${id}`] ||= game[`hasMushroomArtCard${id}`]===true;
  this.data.advancedDanceCleared ||= game.advancedDanceCleared===true;
  if(game.mapId===4&&game.advancedDanceCleared)this.data.hasMushroomArtCard03=true;
  const run=chapterRun(game,game.chapterCarry??this.data.runState);
  for(const id of CARD_IDS)run[`hasMushroomArtCard${id}`]=this.data[`hasMushroomArtCard${id}`];
  this.data.runState=run;this.data.totalPhysicalSpores=run.totalPhysicalSpores;
  const clear=['result','chapter-clear','coming-soon'].includes(game.mode);
  if(game.mapId>=2){this.data[`map${game.mapId}Current`]=clear?null:game.snapshot?.()??null;if(clear){this.data[`map${game.mapId}Clear`]=true;this.data[`map${game.mapId}Last`]=game.count;this.data[`map${game.mapId}Best`]=Math.max(this.data[`map${game.mapId}Best`]??0,game.count);}}
  if(game.mode==='chapter-clear'){this.data.map5Final=game.snapshot();this.data.chapterClear=true;this.data.finalResult={...game.rescue,physicalSporeProgress:run.physicalSporeProgress,artCards:Object.fromEntries(CARD_IDS.map(id=>[id,this.data[`hasMushroomArtCard${id}`]])),score:game.score};}
  this.save();
 }
 get cardCount(){return CARD_IDS.filter(id=>this.data[`hasMushroomArtCard${id}`]).length;}
}
