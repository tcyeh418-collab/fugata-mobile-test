// Stable puzzle identities survive a future change to the order of rooms.
export const REWARDS_KEY='fugata.rewards.v1';
export const REWARDS=Object.freeze([
 {id:'melody-brooch',puzzle:'melody',door:'door01',name:'旋律胸針',slot:'chest',place:'胸前',clue:'找到旋律主題',copy:'第一顆旋律的種子，留在旅人的胸前。',color:'#85d6ed'},
 {id:'echo-headphones',puzzle:'echo',door:'door02',name:'共鳴耳機',slot:'head',place:'頭部',clue:'辨認主題與回應',copy:'把主題與回音，收進同一段旅程。',color:'#dbb977'},
 {id:'synth-patch',puzzle:'synth',door:'door03',name:'頸掛 patch 線',slot:'neck',place:'頸部',clue:'完成合成器接線',copy:'親手接起的聲音，成為肩上的古銅導線。',color:'#df9c79'},
 {id:'voices-recorder',puzzle:'voices',door:'door04',name:'四聲錄音機',slot:'leftHip',place:'左腰',clue:'完成四聲部排列',copy:'藍、金、綠、紫，四種聲音都有了自己的位置。',color:'#9fcbb6'},
 {id:'rhythm-sticks',puzzle:'rhythm',door:'door05',name:'星紋鼓棒',slot:'rightHip',place:'右腰',clue:'啟動最終節奏驅動',copy:'特殊鼓棒收在腰側，記住你找到的重拍。',color:'#e5c48b'},
 {id:'core-pendant',puzzle:'core',door:'door06',name:'星核吊墜',slot:'neck',place:'頸部',clue:'完成 Fugata 核心重構',copy:'所有聲音回到起點，星核也成為你的紀念。',color:'#a7dfe5'},
].map(Object.freeze));
export const REWARD_SLOTS=Object.freeze(['chest','head','neck','leftHip','rightHip']);
export const rewardById=id=>REWARDS.find(r=>r.id===id);
export function emptyRewards(){return {version:1,unlocked:[],equipped:{},pending:[]};}
export function normalizeRewards(raw){
 const p=emptyRewards();if(!raw||raw.version!==1)return p;
 p.unlocked=REWARDS.filter(r=>Array.isArray(raw.unlocked)&&raw.unlocked.includes(r.id)).map(r=>r.id);
 p.pending=[...new Set(Array.isArray(raw.pending)?raw.pending:[])].filter(id=>p.unlocked.includes(id));
 for(const slot of REWARD_SLOTS){const id=raw.equipped?.[slot];if(p.unlocked.includes(id)&&rewardById(id)?.slot===slot)p.equipped[slot]=id;}
 return p;
}
export function completedRewardIds(state){return REWARDS.filter(r=>state[r.door]?.completed===true).map(r=>r.id);}
export function unlockRewards(profile,ids,{notify=true}={}){
 const next=normalizeRewards(profile);
 for(const r of REWARDS)if(ids.includes(r.id)&&!next.unlocked.includes(r.id)){next.unlocked.push(r.id);if(notify)next.pending.push(r.id);}
 return next;
}
export function equipReward(profile,id){
 const next=normalizeRewards(profile),r=rewardById(id);
 if(!r||!next.unlocked.includes(id))return next;
 if(next.equipped[r.slot]===id)delete next.equipped[r.slot];else next.equipped[r.slot]=id;
 return next;
}
export function acknowledgeReward(profile,id){const next=normalizeRewards(profile);next.pending=next.pending.filter(x=>x!==id);return next;}
export function loadRewards(storage){
 try{return {profile:normalizeRewards(JSON.parse(storage.getItem(REWARDS_KEY))),error:null};}
 catch{return {profile:emptyRewards(),error:'收藏暫時無法讀取；新的獎勵仍可在這次遊玩中取得。'};}
}
export function saveRewards(storage,profile){storage.setItem(REWARDS_KEY,JSON.stringify(normalizeRewards(profile)));}
// Local previews persist in their own namespace, never in the real collection.
export function rewardStorage(source,{preview=false,demo=false}={}){
 if(demo){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
 const key=k=>preview?'fugata.dark-preview.'+k:k;
 return {getItem:k=>source.getItem(key(k)),setItem:(k,v)=>source.setItem(key(k),v)};
}
// Test-room prerequisites are scaffolding, not earned rewards. Only later solves count.
export function createRewardObserver({skipInitialCompletions=false}={}){
 let lastState=null,baseline=new Set();
 return state=>{const ids=completedRewardIds(state);if(state!==lastState){lastState=state;baseline=new Set(skipInitialCompletions?ids:[]);}
  return ids.filter(id=>!baseline.has(id));};
}
