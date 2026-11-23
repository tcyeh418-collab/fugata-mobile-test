import {REWARDS,rewardById,loadRewards,saveRewards,unlockRewards,equipReward,acknowledgeReward,rewardStorage,createRewardObserver,emptyRewards} from './rewards.js';
import {drawRewardIcon,drawEquippedRewards,preloadRewardArt,rewardArtStatus} from './reward-art.js';
import {drawWalk,loadWalkArt,WALK} from './character/walk-v14.js';
import {DEFAULT_CHARACTER} from './character/model.js';
import {ART_TRIAL_REVISION} from './art-trial-version.js';
import {CHAPTER_ORDER,isIntegratedState} from './chapter-route.js';

export function createRewardCollection({getState,input,canvas,sourceStorage,preview=false,demo=false}){
 const store=rewardStorage(sourceStorage,{preview,demo});
 const loaded=loadRewards(store);let profile=loaded.profile,error=loaded.error,selection=REWARDS[0].id,direction='front',mode='collection',activeAward=null,drawTicket=0,signature='',openTrigger=null;
 if(demo)profile=unlockRewards(emptyRewards(),REWARDS.map(r=>r.id),{notify:false});
 const observe=createRewardObserver({skipInitialCompletions:preview});let demoOpened=false;
 const sheet=document.createElement('dialog');sheet.className='reward-dialog';sheet.setAttribute('aria-labelledby','reward-title');
 sheet.innerHTML=`<header class="reward-header"><div><small>FUGATA / JOURNEY COLLECTION</small><h2 id="reward-title">旅途收藏</h2><p class="reward-intro"></p></div><button type="button" data-close aria-label="關閉旅途收藏">✕</button></header>
 <div class="reward-layout"><section class="reward-items" aria-label="通關紀念品"><div class="reward-grid"></div><p class="reward-count"></p></section>
 <section class="reward-detail" aria-label="配件與角色預覽"><div class="reward-hero"><canvas width="200" height="200" aria-label="配件圖樣"></canvas><div><small class="reward-place"></small><h3></h3><p class="reward-copy"></p></div></div>
 <div class="reward-avatar"><canvas width="320" height="350" role="img" aria-label="目前角色穿戴預覽"></canvas><p>穿上旅程的紀念</p></div>
 <div class="reward-directions" role="group" aria-label="預覽角色方向"></div><p class="reward-slot-note"></p>
 <div class="reward-actions"><button type="button" data-equip></button><button type="button" data-keep>先收進收藏</button></div></section></div>
 <footer class="reward-footer"><p role="status" class="reward-status"></p><button type="button" data-retry hidden>重試儲存</button><small>${demo?'配件試裝展示 · 不會解鎖實際收藏':preview?'預覽版收藏 · 與正式遊玩分開保存':'解鎖收藏會保留，重新開始旅程也不會失去。'}</small></footer>`;
 document.body.append(sheet);
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../css/rewards.css',import.meta.url).href+'?v='+ART_TRIAL_REVISION;document.head.append(css);
 const grid=sheet.querySelector('.reward-grid'),portrait=sheet.querySelector('.reward-avatar canvas');
 const buttons=[];
 for(const parent of [document.querySelector('.character-tools'),document.querySelector('#chapter-complete .album-panel'),document.querySelector('.title-console')]){
  if(!parent)continue;const b=document.createElement('button');b.type='button';b.className='reward-open';b.textContent='旅途收藏';b.onclick=()=>open('collection',b);parent.append(b);buttons.push(b);
 }
 const displayRewards=isIntegratedState(getState())?CHAPTER_ORDER.map(room=>REWARDS.find(r=>r.door===`door${String(room).padStart(2,'0')}`)):REWARDS;
 for(const r of displayRewards){
  const card=document.createElement('button');card.type='button';card.dataset.reward=r.id;card.className='reward-card';
  const icon=document.createElement('canvas');icon.width=160;icon.height=160;icon.setAttribute('aria-hidden','true');drawRewardIcon(icon.getContext('2d'),r.id);
  const title=document.createElement('strong');title.textContent=r.name;const state=document.createElement('span');card.append(icon,title,state);
  card.onclick=()=>{selection=r.id;paint();};grid.append(card);
 }
 void preloadRewardArt().then(()=>{
  for(const card of grid.children){const c=card.querySelector('canvas'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);drawRewardIcon(g,card.dataset.reward);}
  if(sheet.open)paint();
 });
 for(const [id,label]of [['front','正面'],['left','左側'],['right','右側'],['back','背面']]){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.direction=id;b.onclick=()=>{direction=id;paint();};sheet.querySelector('.reward-directions').append(b);
 }
 function write(){try{saveRewards(store,profile);error=null;}catch{error='尚未儲存：這次遊玩仍可使用配件，請按「重試儲存」再保存。';}status();}
 function status(){sheet.querySelector('.reward-status').textContent=error||(demo?'試裝已套用，不寫入收藏':'收藏已保存');sheet.querySelector('[data-retry]').hidden=!error;}
 sheet.querySelector('[data-retry]').onclick=()=>write();
 function close(){
  if(activeAward){profile=acknowledgeReward(profile,activeAward);write();activeAward=null;}
  getState().ui.rewardsOpen=false;if(sheet.open)sheet.close();input.reset();drawTicket++;
  if(getState().phase==='game')canvas.focus({preventScroll:true});else openTrigger?.focus();
 }
 sheet.querySelector('[data-close]').onclick=close;sheet.querySelector('[data-keep]').onclick=close;
 sheet.addEventListener('cancel',e=>{e.preventDefault();close();});
 sheet.querySelector('[data-equip]').onclick=()=>{profile=equipReward(profile,selection);getState().rewards=profile;write();paint();};
 function open(nextMode,trigger){
  const s=getState();if(sheet.open||document.querySelector('dialog[open]')||s.roomTransition.active||s.dialogue.active)return;
  mode=nextMode;openTrigger=trigger||null;activeAward=mode==='award'?profile.pending[0]:null;
  if(activeAward)selection=activeAward;
  direction='front';s.ui.rewardsOpen=true;input.reset();sheet.dataset.mode=mode;
  sheet.querySelector('#reward-title').textContent=mode==='award'?'獲得旅途紀念':'旅途收藏';
  sheet.querySelector('.reward-intro').textContent=mode==='award'?'這段聲音，現在也成為你的模樣。':'六個房間，六件隨身帶走的聲音。';
  sheet.querySelector('[data-keep]').textContent=mode==='award'?'收好，繼續旅程':'完成穿戴';
  sheet.showModal();paint();sheet.querySelector('[data-close]').focus();
 }
 async function paintPortrait(){
  const ticket=++drawTicket,c=getState().character||DEFAULT_CHARACTER,ctx=portrait.getContext('2d');
  ctx.clearRect(0,0,portrait.width,portrait.height);
  try{await Promise.all([loadWalkArt(c),preloadRewardArt()]);if(ticket!==drawTicket||!sheet.open)return;
   const opts={direction,frame:1,x:160,y:329,scale:.38};drawWalk(ctx,c,opts);drawEquippedRewards(ctx,profile,{...opts,foot:WALK.foot});
   sheet.querySelector('.reward-avatar p').textContent='目前穿戴 · '+({front:'正面',left:'左側',right:'右側',back:'背面'}[direction]);
  }catch{if(ticket===drawTicket)sheet.querySelector('.reward-avatar p').textContent='角色暫時無法載入，關閉後重開即可重試。';}
 }
 function paint(){
  const r=rewardById(selection),owned=profile.unlocked.includes(r.id),equipped=profile.equipped[r.slot]===r.id;
  for(const card of grid.children){const id=card.dataset.reward,on=Object.values(profile.equipped).includes(id),unlocked=profile.unlocked.includes(id);
   card.dataset.locked=String(!unlocked);card.setAttribute('aria-pressed',String(id===selection));card.querySelector('span').textContent=on?'已穿戴':unlocked?'已收藏':'待解鎖';
  }
  sheet.querySelector('.reward-count').textContent=`旅途紀念 ${profile.unlocked.length} / ${REWARDS.length}`;
  const icon=sheet.querySelector('.reward-hero canvas'),g=icon.getContext('2d');g.clearRect(0,0,200,200);drawRewardIcon(g,r.id,0,0,200);
  sheet.querySelector('.reward-place').textContent=(owned?'已解鎖':'通關獎勵')+' / '+r.place;
  sheet.querySelector('h3').textContent=r.name;sheet.querySelector('.reward-copy').textContent=owned?r.copy:r.clue+'後獲得。';
  sheet.querySelector('.reward-slot-note').textContent=r.slot==='neck'?'頸掛 patch 線與星核吊墜擇一穿戴。':r.slot==='leftHip'||r.slot==='rightHip'?'收在腰側，保留你原本手持的樂器。':'配件只影響外觀，隨時可以取下。';
  const equip=sheet.querySelector('[data-equip]');equip.disabled=!owned;equip.textContent=!owned?'尚未解鎖':equipped?'取下配件':'立即穿戴';
  for(const b of sheet.querySelector('.reward-directions').children)b.setAttribute('aria-pressed',String(b.dataset.direction===direction));
  getState().rewards=profile;status();void paintPortrait();
 }
 return {render(s){
  s.rewards=profile;
  const earned=observe(s),next=unlockRewards(profile,earned);
  if(next.unlocked.length!==profile.unlocked.length){profile=next;s.rewards=profile;write();}
  const busy=s.phase==='game'&&(s.dialogue.active||s.tutorialOpen||s.ui.room04ReferenceOpen||s.ui.feedbackDialogOpen||s.roomTransition.active
   ||['checking','opening'].includes(s.door01.status)&&s.gameProgress.currentRoom===1
   ||['checking','opening'].includes(s.door02.status)&&s.gameProgress.currentRoom===2
   ||s.door03.status==='previewing'&&s.gameProgress.currentRoom===3
   ||['preparing','testing','reference-playing'].includes(s.door04.status)&&s.gameProgress.currentRoom===4
   ||['testing','completion-spinning','completion-hold','launching','opening'].includes(s.door05.status)&&s.gameProgress.currentRoom===5
   ||['confirming','relay-playing','relay-replay','reference-playing','reconstructing'].includes(s.door06.status)&&s.gameProgress.currentRoom===6);
  for(const b of buttons)b.disabled=Boolean(busy);
  canvas.dataset.rewardsUnlocked=String(profile.unlocked.length);canvas.dataset.rewardsEquipped=Object.values(profile.equipped).join(',');canvas.dataset.rewardsOpen=String(sheet.open);
  canvas.dataset.rewardArtReady=String(rewardArtStatus().ready.length===REWARDS.length);canvas.dataset.rewardArtErrors=rewardArtStatus().errors.join(',');
  if(sheet.open&&s.phase!=='game'&&s.phase!=='ending'&&s.phase!=='title')close();
  if(sheet.open)return;
  if(demo&&!demoOpened&&s.phase==='game'&&!busy&&!document.querySelector('dialog[open]')){demoOpened=true;open('collection');return;}
  // Wait for successful opening/audio animations to finish before celebrating.
  const r=rewardById(profile.pending[0]);
  if(r&&!busy&&!document.querySelector('dialog[open]')&&s.phase==='game'&&s[r.door]?.status==='open')open('award');
  const nextSignature=`${s.phase}:${profile.unlocked.length}`;if(nextSignature!==signature){signature=nextSignature;for(const b of buttons)b.textContent=`旅途收藏 ${profile.unlocked.length}/6`;}
 },open};
}
