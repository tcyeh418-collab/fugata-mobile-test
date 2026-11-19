// Replace these local assets or paths; no gameplay changes are required.
export const STORY_CONFIG=Object.freeze({
 openingVideoPath:'./assets/video/mushroom_opening.mp4',
 endingTier1VideoPath:'./assets/video/mushroom_ending_tier1.mp4',
 endingTier2VideoPath:'./assets/video/mushroom_ending_tier2.mp4',
 endingTier3VideoPath:'./assets/video/mushroom_ending_tier3.mp4',
 openingDuration:10,endingDuration:8,videoStallTimeout:6,
 listenURL:null,albumInfoURL:null,
});
export const endingVideoPath=(tier,config=STORY_CONFIG)=>config[`endingTier${Math.max(1,Math.min(3,Math.floor(tier)||1))}VideoPath`];
export function publicURL(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
export const ALBUM_COPY=Object.freeze({album:'《Logic Code》以 Eurorack 模組合成器與爵士鼓為核心，\n從數位脈衝與有機生命之間的關係出發，\n展開一段關於生成、生命與循環的聲音旅程。',track:'《Mushroom 菇》的靈感來自高雄連日大雨後，\n城市道路附近意外長出大量野生蕈菇的事件。'});
