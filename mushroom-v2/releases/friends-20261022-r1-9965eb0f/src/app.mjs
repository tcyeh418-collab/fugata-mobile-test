import {mountDisplay,mountFullscreen} from './display.mjs';
import {toolboxState} from './toolbox.mjs';
import {StorySequence,StoryVideo} from './story.mjs?rev=story-20261021-r1';
import {STORY_CONFIG,endingVideoPath,ALBUM_COPY,publicURL} from './story-config.mjs?rev=story-20261021-r1';
import {drawStory,drawMyceliumSignal} from './story-render.mjs?rev=story-20261021-r1';
import {Map5Game} from './map5-game.mjs?rev=map5-20261020-r1';
import {Studio} from './studio.mjs?rev=map5-20261020-r1';
import {RoomTransition} from './transition.mjs';
import {renderSkills} from './skills.mjs';
import {QUESTIONS,answerDetails} from './quiz.mjs?rev=map5-20261020-r1';
import {nextMapRun,physicalProgress,totalPhysical,wallpaperRewards} from './chapter.mjs?rev=map5-20261020-r1';
import {Map4Game} from './map4-game.mjs?rev=map5-20261020-r1';
import {AdvancedDance} from './advanced-dance.mjs?rev=map5-20261020-r1';
import {POWER_UPS} from './map4.mjs?rev=map5-20261020-r1';
import {Map3Game} from './map3-game.mjs?rev=map5-20261020-r1';
import {BEAR_LINES} from './map3.mjs?rev=map5-20261020-r1';
import {GameSfx} from './sfx.mjs?rev=map5-20261020-r1';
import {Game} from './engine.mjs?rev=map5-20261020-r1';
import {Map2Game} from './map2-game.mjs?rev=map5-20261020-r1';
import {Renderer} from './render.mjs?rev=map5-20261020-r1';
import {MAPS,SAVE_KEY,CONFIG as C} from './map.mjs?rev=map5-20261020-r1';
import {LEROY_LINES} from './map2.mjs?rev=map5-20261020-r1';
import {BeginnerDance,DanceAudio} from './dance.mjs?rev=map5-20261020-r1';
import {ProgressStore} from './progress.mjs?rev=map5-20261020-r1';
const qa=false;
const storageKey=qa?`${SAVE_KEY}.qa`:SAVE_KEY;
const $=id=>document.getElementById(id);
let game=new Game();
const renderer=new Renderer($('game'));
// All maps share a fixed desktop world window; only its outer presentation scales.
const display=mountDisplay({host:$('stageHost'),stage:document.querySelector('.stage'),canvas:$('game')});
const input={left:false,right:false,jump:false,interact:false,crouch:false};
let last=0,accumulator=0,view='',toastUntil=0,sound=true,audio=null,lastSave=0,qaFreeze=false;
let presentation=null,story=null,map1ReadyPending=false;
let transition=null;
let dance=null,lastDanceBeat=-1,studio=null,lastQuizView='';
const panels={opening:'storyOpening',ending:'storyEnding',credits:'creditsPanel',album:'albumPanel','studio-talk':'studioTalk','qa':'quizPanel','qa-key':'quizKey','lock-notice':'lockPanel','rescue-confirm':'rescueConfirm',rescuing:'rescueSequence','chapter-clear':'finalResult',title:'title',intro:'intro',paused:'paused',result:'result','coming-soon':'coming',dialogue:'dialogue','leroy-gift':'gift','dance-preview':'dancePreview',dance:'dancePanel','secret-clear':'secretClear','sprint-retry':'sprintRetry','bear-dialogue':'dialogue',reactor:'reactor','art-card3':'card3','map4-preview':'map4Preview','map5-preview':'map5Preview',gacha:'gachaPanel','gacha-reward':'gachaReward','advanced-clear':'advancedClear'};
const directions={left:'←',up:'↑',down:'↓',right:'→'};
function clearInput(){for(const key of Object.keys(input))input[key]=false;}
const fullscreen=mountFullscreen({root:$('app'),button:$('fullscreen'),status:$('displayStatus'),onResize:()=>display.resize(),onChange:clearInput});
function toast(message){$('toast').textContent=message;toastUntil=performance.now()+2400;}
const store=new ProgressStore({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)},{qa,onError:toast});
const danceAudio=new DanceAudio({onError:toast});
const sfx=new GameSfx();
for(const event of ['pointerdown','keydown'])window.addEventListener(event,()=>{sfx.unlock();if(sound&&audio?.state==='suspended')void audio.resume().catch(()=>{});},{capture:true});
function tone(freq=440,duration=.1,delay=0){
 if(!sound)return;
 try{audio??=new AudioContext();if(audio.state==='suspended')void audio.resume().catch(()=>{});
  const osc=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+delay;
  osc.type='sine';osc.frequency.setValueAtTime(freq,at);osc.frequency.exponentialRampToValueAtTime(freq*.55,at+duration);
  gain.gain.setValueAtTime(.035,at);gain.gain.exponentialRampToValueAtTime(.001,at+duration);
  osc.connect(gain).connect(audio.destination);osc.start(at);osc.stop(at+duration);
 }catch{sound=false;}
}
function drumFill(){for(const [i,f]of [150,190,220,280,120].entries())tone(f,.1,i*.12);}
function setSound(value,unlock=true){sound=value;sfx.setEnabled(value);if(value&&unlock)sfx.unlock();danceAudio.setMuted(!sound);$('storyVideo').muted=!sound;$('sound').textContent=sound?'SOUND ON ◉':'SOUND OFF ◌';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'關閉音效':'開啟音效');}
setSound(true,false);
function readMap1Progress(){try{const p=JSON.parse(localStorage.getItem(storageKey)||'null');return p?.version===2?p:null;}catch{return null;}}
let map1Progress=readMap1Progress();
if(store.data.physicalSchemaVersion!==1){if(map1Progress?.map1Clear&&!store.data.runState.physicalSporeProgress?.[1]?.collected)store.data.runState.physicalSporeProgress[1]={collected:Math.min(20,map1Progress.last??0),total:20};store.data.totalPhysicalSpores=totalPhysical(store.data.runState.physicalSporeProgress);store.data.runState.totalPhysicalSpores=store.data.totalPhysicalSpores;store.data.physicalSchemaVersion=1;store.save();}
function saveMap1(){
 map1Progress={version:2,map1Clear:true,best:Math.max(map1Progress?.best||0,game.count),last:game.count};
 try{localStorage.setItem(storageKey,JSON.stringify(map1Progress));}catch{toast('此瀏覽器無法保存進度，仍可繼續遊玩');}
}
function changeGame(next){story?.cancel();story=null;storyVideo.stop();presentation=null;map1ReadyPending=false;toastUntil=0;$('toast').textContent='';danceAudio.stop();dance=null;studio=null;transition=null;$('roomFade').hidden=true;game=next;renderer.camera=0;clearInput();accumulator=0;view='';qaFreeze=false;}
function entryRun(id,fromPrevious=false){
 const key=`map${id}EntryRun`;
 if(fromPrevious||!store.data[key])store.data[key]=nextMapRun(store.data.runState);
 return nextMapRun(store.data[key]);
}
function carryIntoGame(carry){game.chapterCarry=structuredClone(carry);game.player.hp=Math.max(1,Math.min(3,Math.floor(carry.hp)||3));}
function startMap1(){const carry={hp:3,isGiant:false,giantShield:0,bonusSpores:0,physicalSporeProgress:physicalProgress()};for(const id of [2,3,4,5]){store.data[`map${id}EntryRun`]=null;store.data[`map${id}Current`]=null;}changeGame(new Game());game.start();carryIntoGame(carry);store.capture(game);}
// Map1 is procedural and already imported: its world/HUD/run initialize during the opening.
// The explicit ready gate also supports future asynchronous assets without a second loading screen.
const storyVideo=new StoryVideo($('storyVideo'),{timeout:STORY_CONFIG.videoStallTimeout,fallback:()=>{if(story)story.mode='placeholder';},playing:()=>{if(story)story.mode='video';},ended:()=>story?.finish()});
function beginOpening({waitForReady=false}={}){
 startMap1();game.mode='opening';presentation='opening';clearInput();
 const current=story=new StorySequence({duration:STORY_CONFIG.openingDuration,onComplete:()=>{storyVideo.stop();story=null;presentation=null;game.mode='intro';game.finishIntro();clearInput();renderer.camera=0;store.capture(game);}});
 map1ReadyPending=qa&&waitForReady;
 Promise.resolve().then(()=>{if(story===current&&!map1ReadyPending)current.markReady();});
 storyVideo.start(STORY_CONFIG.openingVideoPath,!sound);
}
function releaseOpeningReady(){map1ReadyPending=false;story?.markReady();}
function beginEnding(){
 if(game.mode!=='chapter-clear')return;
 store.capture(game);clearInput();presentation='ending';
 story=new StorySequence({kind:'ending',duration:STORY_CONFIG.endingDuration,ready:true,onComplete:()=>{storyVideo.stop();story=null;presentation=null;view='';clearInput();renderFinal();}});
 storyVideo.start(endingVideoPath(game.rescue.tier),!sound);
}
function skipStory(){if(!story)return;storyVideo.stop();story.mode='placeholder';story.skip();clearInput();}
function showCredits(){if(game.mode!=='chapter-clear'||presentation==='ending')return;presentation='credits';clearInput();}
function showAlbum(){if(presentation!=='credits')return;presentation='album';clearInput();}
$('openingSkip').onclick=skipStory;$('endingSkip').onclick=skipStory;
$('showCredits').onclick=showCredits;$('showAlbum').onclick=showAlbum;$('albumHome').onclick=home;
$('albumCopy').textContent=ALBUM_COPY.album;$('trackCopy').textContent=ALBUM_COPY.track;
$('albumActions').replaceChildren(...[['LISTEN TO LOGIC CODE',STORY_CONFIG.listenURL],['ALBUM INFO',STORY_CONFIG.albumInfoURL]].map(([label,url])=>{const href=publicURL(url),el=document.createElement(href?'a':'button');el.className='outline';el.textContent=label;if(href){el.href=href;el.target='_blank';el.rel='noopener noreferrer';}else{el.disabled=true;el.title='連結待提供';}return el;}));
function startMap2(resume=false,fromPrevious=false){
 const saved=store.data.map2Current,carry=entryRun(2,fromPrevious);
 changeGame(new Map2Game({hasMushroomArtCard01:store.data.hasMushroomArtCard01,runState:carry}));game.start();carryIntoGame(carry);
 if(resume)game.restore(saved);store.capture(game);
}
function startMap3(resume=false,fromPrevious=false){
 const saved=store.data.map3Current,carry=entryRun(3,fromPrevious);
 changeGame(new Map3Game({hasMushroomArtCard02:store.data.hasMushroomArtCard02,runState:carry}));game.start();carryIntoGame(carry);
 if(resume)game.restore(saved,store.data.runState?.nextMapId===3?store.data.runState:saved);store.capture(game);
}
function startMap4(resume=false,fromMap3=false){
 const saved=store.data.map4Current,carry={...entryRun(4,fromMap3),advancedDanceCleared:store.data.advancedDanceCleared,hasMushroomArtCard03:store.data.hasMushroomArtCard03};
 changeGame(new Map4Game({runState:carry}));game.start();carryIntoGame(carry);if(resume)game.restore(saved,store.data.runState?.nextMapId===4?store.data.runState:saved);game.advancedDanceCleared ||= store.data.advancedDanceCleared;store.capture(game);
}
function startMap4Preview(){startMap4(false,true);}
function startMap5(resume=false,fromPrevious=false){
 const saved=store.data.map5Current,carry=entryRun(5,fromPrevious),latest=structuredClone(store.data.runState);
 changeGame(new Map5Game({runState:carry}));game.start();carryIntoGame(carry);
 if(resume){if(saved)game.restore(saved,latest.nextMapId===5?latest:saved);else if(latest.rescued&&store.data.map5Final){game.restore(store.data.map5Final,latest);}else if(latest.rescued){game.initialCarry=latest;game.start();game.hasRescueKey=true;game.rescued=true;game.lockDiscovered=true;game.answers=(latest.quizAnswers??[]).slice(0,5).filter(a=>Number.isInteger(a)&&a>=0&&a<3);game.map4GachaUsed=latest.map5SupplyCrateUsed===true;game.gachaReward=latest.supplyReward??null;game.gachaRewardGranted=latest.supplyRewardGranted===true;const record=latest.physicalSporeProgress?.[5];if(Array.isArray(record?.ids))game.spores.forEach(s=>s.collected=record.ids.includes(s.id));else game.spores.slice(0,record?.collected??0).forEach(s=>s.collected=true);game.mode='chapter-clear';}}
 store.capture(game);
}
function startMap5Preview(){startMap5(false,true);}
function home(){
 if(game.mapId>=2&&game.mode!=='result'&&game.mode!=='coming-soon')store.capture(game);
 changeGame(new Game());game.mode='title';
}
function pause(){
 const before=game.mode;if(before==='studio-passage'){game.resumeMode='studio-passage';game.mode='paused';}else game.pause();
 if(before==='dance'&&game.mode==='paused')danceAudio.pause();
 if(before==='paused'&&game.mode==='dance')void danceAudio.resume();
 clearInput();
}
function roomFade(onBlack,onComplete){
 clearInput();accumulator=0;$('roomFade').hidden=false;$('roomFade').style.opacity='0';
 transition=new RoomTransition({onBlack,onComplete:()=>{transition=null;$('roomFade').hidden=true;clearInput();accumulator=0;onComplete();}});
}
function enterStudio(){
 if(transition)return;game.mode='studio-transition';
 roomFade(()=>{studio=new Studio(game.mapId,game);renderer.camera=Math.max(0,studio.player.x-$('game').width*.34);},()=>{game.mode='studio-talk';store.capture(game);});
}
function leaveSecret(){
 if(transition||!studio)return;const previous=game.mode;danceAudio.stop();dance=null;game.mode='studio-transition';
 roomFade(()=>{game.mode=previous;game.exitSecret();studio=null;game.mode='studio-transition';renderer.camera=Math.max(0,Math.min(game.level.worldWidth-$('game').width,game.player.x-$('game').width*.34));},()=>{game.mode='playing';store.capture(game);});
}
function retryDance(){
 if(game.mode!=='dance')return;
 dance=game.mapId===4?new AdvancedDance():new BeginnerDance();lastDanceBeat=-1;danceAudio.retry();clearInput();
}
function beginDance(){
 if(game.mode!=='dance-preview')return;
 dance=game.mapId===4?new AdvancedDance():new BeginnerDance();lastDanceBeat=-1;danceAudio.start();game.mode='dance';clearInput();
}
function danceInput(direction){
 if(game.mode!=='dance'||!dance||!danceAudio.musicStarted||danceAudio.paused)return;
 dance.input(direction,danceAudio.clock());
}
function syncDance(){
 const phase=dance.phase;
 $('danceStage').textContent=game.mapId===4?`Round ${dance.stage.id} / 6`:`Stage ${dance.stage.id} / 3`;
 const n=dance.stage.sequence.length;if($('danceCells').children.length!==n){$('danceCells').replaceChildren(...Array.from({length:n},()=>{const cell=document.createElement('div');cell.className='dance-cell';cell.append(document.createElement('b'),document.createElement('small'));return cell;}));}
 $('dancePhase').textContent=({preroll:'音樂前奏 · 兩小節，聽聽節拍',question:'題目 · 先看方向',demonstrate:'示範 · 看亮起的方向',countdown:'4 拍 Count-in',input:'跟著音樂，一拍一個方向','round-result':'結果保留拍',complete:'完成'})[phase.phase];
 const children=[...$('danceCells').children];
 for(let i=0;i<dance.stage.sequence.length;i++){
  const outcome=dance.cells[i],active=(phase.phase==='demonstrate'&&phase.demoIndex===i)||(phase.phase==='input'&&phase.inputIndex===i);
  children[i].className=`dance-cell ${outcome} ${active?'active':''}`;
  children[i].querySelector('b').textContent=phase.phase==='preroll'?'·':directions[dance.stage.sequence[i]];
  children[i].querySelector('small').textContent=outcome==='pending'?'':outcome.toUpperCase();
 }
 for(const b of document.querySelectorAll('[data-direction]'))b.disabled=phase.phase!=='input';
 $('danceCount').textContent=phase.phase==='preroll'?String(8-Math.floor(dance.clockMs/500)):phase.phase==='countdown'?phase.countInValue:phase.phase==='input'?'●':phase.phase==='round-result'?'✓':'♪';
 $('danceAudioStatus').textContent=sound?'120 BPM · 正式音樂':'120 BPM · 靜音（可開啟 SOUND）';
 $('audioRetry').hidden=!['blocked','error','resume-blocked'].includes(danceAudio.status);
 $('audioRetry').textContent=danceAudio.status==='resume-blocked'?'繼續舞會音訊':'重試音訊';
}
function sync(){
 const mode=presentation??game.mode;
 const key=`${game.mapId}:${mode}`;
 if(view!==key){
  view=key;clearInput();for(const id of new Set(Object.values(panels)))$(id).hidden=true;if(panels[mode])$(panels[mode]).hidden=false;
  if(game.mode==='result'){
   $('resultTitle').textContent=`Map ${game.mapId} Clear`;
   $('resultCount').textContent=`Spore ${game.count} / 20`;$('perfect').hidden=game.count!==20;
   $('resultSecret').hidden=game.mapId<2;
   $('resultSecret').textContent=game.mapId===4?(game.advancedDanceCleared?'Advanced Dance Clear ✓':'Advanced Dance ???'):game.mapId===3?(game.hasMushroomArtCard02?'Art Card #2 ✓':'Art Card #2 ???'):(game.hasMushroomArtCard01?'Secret Art Found ✓':'Secret Art ???');
   $('resultTime').textContent=`${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,'0')} · ${game.deaths} 次菌絲重組`;
   $('replay').textContent=`再次探索 Map ${game.mapId}`;
   if(game.mapId===1)saveMap1();store.capture(game);
   $('continue').focus({preventScroll:true});
  }
  if(game.mode==='coming-soon')$('comingTitle').textContent='下一段旅程';
  if(game.mode==='art-card3'){store.capture(game);$('card3Message').textContent=`${game.cardAlreadyCollected?'Already Collected · ':''}${store.cardCount} / 3`;$('card3Close').focus({preventScroll:true});}
  if(game.mode==='map5-preview')$('carry5Status').textContent=`HP ${game.player.hp} / 3 · ${game.isGiant?'GIANT / SHIELD 1':'NORMAL / SHIELD 0'} · Bonus Spores +${game.bonusSpores}`;
  if(game.mode==='gacha-reward'){$('rewardSymbol').textContent=game.gachaReward==='capsule'?'✦':({drumsticks:'╳',magnet:'∩',kickSpring:'↥',limit:'◇'})[game.gachaReward];$('gachaRewardName').textContent=game.gachaReward==='capsule'?'孢子 +2':POWER_UPS[game.gachaReward]?.name??'';$('gachaRewardEffect').textContent=({drumsticks:'30 秒 · 水平速度 +30%',magnet:'20 秒 · 吸取附近普通孢子',kickSpring:'20 秒 · 跳躍力 +38%',limit:'8 秒 · 免疫陷阱傷害，落水仍依原規則',capsule:'Bonus Spores · 不計入本關 20 顆'})[game.gachaReward];$('gachaConfirm').focus({preventScroll:true});}
  if(game.mode==='advanced-clear'){$('advancedCardMessage').textContent=`ART CARD #3 · ${store.cardCount} / 3`; $('advancedExit').focus({preventScroll:true});store.capture(game);}
  if(game.mode==='map4-preview')$('carryStatus').textContent=game.isGiant?'GIANT · Shield 1 / 1 · 巨大狀態已延續':'NORMAL · Shield 0 / 1';
  if(game.mode==='secret-clear'){
   store.capture(game);
   $('cardMessage').textContent=game.cardAlreadyCollected?`ART CARD #1 · Already Collected · ${store.cardCount} / 3`:`ART CARD #1 · ${store.cardCount} / 3`;
   $('secretExit').focus({preventScroll:true});
  }
  if(game.mode==='sprint-retry'){store.capture(game);$('sprintRetryReason').textContent=game.sprintRetryReason==='water'?'落水扣 1 HP，已收集的孢子仍保留。':game.sprintRetryReason==='death'?'菌絲已重組，散落的孢子就在起跑岸邊。':'時間到了。回到安全起跑岸，準備好再出發。';$('retrySprint').focus({preventScroll:true});}
  if(['dialogue','bear-dialogue'].includes(game.mode))$('dialogueNext').focus({preventScroll:true});
  if(game.mode==='dance-preview')$('danceReady').focus({preventScroll:true});
  if(mode==='chapter-clear'){store.capture(game);renderFinal();$('showCredits').focus({preventScroll:true});}
  if(mode==='credits')$('showAlbum').focus({preventScroll:true});
  if(mode==='album')$('albumHome').focus({preventScroll:true});
  if(game.mode==='studio-talk')$('studioContinue').focus({preventScroll:true});
  if(['playing','studio-passage'].includes(game.mode))$('game').focus({preventScroll:true});
 }
 const active=!presentation&&['playing','paused','result','dialogue','leroy-gift','sprint-retry','bear-dialogue','reactor','art-card3','map4-preview','map5-preview','gacha','gacha-reward'].includes(game.mode);
 $('hud').hidden=!active;$('sectionLabel').hidden=!active;$('touch').hidden=!['playing','studio-passage'].includes(game.mode);
 $('hp').textContent=Array.from({length:C.maxHP},(_,i)=>i<game.player.hp?'●':'○').join(' ');
 $('hp').setAttribute('aria-label',`HP ${game.player.hp} / ${C.maxHP}`);
 $('spores').textContent=`Spore ${game.count} / 20`;
 $('progress').style.width=`${game.player.x/(game.level.worldWidth??C.worldWidth)*100}%`;
 const section=game.level.sectionAt(game.player.x);
 $('sectionNumber').textContent=`0${section.id} — ${section.name}`;$('sectionEnglish').textContent=section.english;
 $('respawn').hidden=game.respawn<=0;
 $('toast').style.opacity=game.mode==='playing'&&performance.now()<toastUntil?'1':'0';
 $('drumsticksHud').hidden=true;
 renderSkills($('skillHud'),game,{visible:!presentation&&!['title','intro','result','chapter-clear','coming-soon'].includes(game.mode),studio:!!studio});
 if(game.mode==='gacha'){$('gachaPanel').querySelector('h2').textContent=game.mapId===5?'打開補給箱。':'轉動可能性。';$('gachaPanel').querySelector('.eyebrow').textContent=game.mapId===5?'SUPPLY CRATE':'LOGIC CODE / FREE GACHA';$('gachaPanel').dataset.phase=game.gachaPhase;$('gachaPanel').dataset.supply=String(game.mapId===5);$('gachaMachine').style.setProperty('--turn',`${game.gachaProgress*720}deg`);$('gachaMachine').style.setProperty('--drop',String(Math.max(0,Math.min(1,(game.gachaProgress-.4)/.3))));$('gachaMachine').style.setProperty('--lid',String(toolboxState(game).openness));$('gachaMachine').style.setProperty('--open',String(Math.max(0,Math.min(1,(game.gachaProgress-.7)/.3))));$('gachaPhase').textContent=game.mapId===5?'開啟補給箱…':({rolling:'轉蛋機運作中…',dropping:'膠囊掉出了！',opening:'打開膠囊…'})[game.gachaPhase];}
 $('buffTime').textContent=Math.ceil(game.drumsticksRemaining??0);
 $('secretEnter').hidden=!game.canEnterSecret;
 $('resumeMap2').hidden=!store.data.map2Current;
 $('resumeMap3').hidden=!store.data.map3Current;$('resumeMap4').hidden=!store.data.map4Current;$('resumeMap5').hidden=!store.data.map5Current&&!store.data.runState?.rescued;$('resumeMap5').textContent=store.data.chapterClear&&!store.data.map5Current?'查看章節結算 →':'繼續 Map 5 →';
 $('giantHud').hidden=true;$('shieldCount').textContent=game.giantShield??0;$('giantHud').firstChild.textContent=game.isGiant?'ϟ GIANT · SHIELD ':'ϟ NORMAL · SHIELD ';
 $('crouchHint').hidden=![3,4,5].includes(game.mapId)||game.mode!=='playing';$('touchCrouch').hidden=![1,3,4,5].includes(game.mapId);
 $('gachaUse').hidden=!game.canUseGacha;$('gachaUse').textContent=game.mapId===5?'↓ 開啟工具箱 · E':'↓ 免費 Gacha · E';$('rewardEyebrow').textContent=game.mapId===5?'SUPPLY CRATE REWARD':'GACHA REWARD';
 $('temporaryHud').hidden=true;$('temporaryHud').textContent=Object.entries(game.buffs??{}).filter(([k,t])=>t>0).map(([k,t])=>`${POWER_UPS[k].name} ${Math.ceil(t)}s`).join(' · ')||'POWER-UP —';
 $('bonusHud').hidden=game.mapId<4||!active||!game.bonusSpores;$('bonusHud').textContent=`Bonus Spores +${game.bonusSpores??0}`;
 if(game.mode==='bear-dialogue'){$('dialogueTitle').textContent='MISS DJ BEAR BEAT / 電壓設備區';$('dialogue').setAttribute('aria-label','Miss DJ Bear Beat 對話');$('dialogueLine').textContent=BEAR_LINES[game.dialogueIndex];$('dialogueNext').textContent=game.dialogueIndex===1?'啟動設備 →':'下一句 →';}
 if(game.mode==='dialogue'){$('dialogueTitle').textContent='LEROY / 鼓手的補給站';$('dialogue').setAttribute('aria-label','Leroy 對話');
  $('dialogueLine').textContent=LEROY_LINES[game.dialogueIndex];
  $('dialogueNext').textContent=game.dialogueIndex===2?'接過鼓棒 →':'下一句 →';
 }
 $('danceModeLabel').textContent=game.mapId===4?'UNDERGROUND / ADVANCED / 120 BPM':'UNDERGROUND / BEGINNER / 120 BPM';
 $('dancePanel').classList.toggle('advanced-dance',game.mapId===4);$('dancePreview').classList.toggle('advanced-dance',game.mapId===4);
 $('dancePreviewTitle').textContent=game.mapId===4?'Advanced Mushroom Dance':'Beginner Mushroom Dance';$('dancePreviewInstructions').innerText=game.mapId===4?'先聽兩小節，再開始六組方向：4 → 4 → 6 → 6 → 8 → 8。\n看示範、聽四拍，一拍一個方向；完成即可，不要求 Perfect。':'先聽兩小節，再看示範、聽四拍、跟著節拍按方向。\n一拍一個方向，完成三題即可，不需要 Perfect。';$('previewArrows').textContent=game.mapId===4?'↑ ↑ ↓ ←':'↑ ↑ ↓ ↓';
 if(game.mode==='dance-preview')$('previewStatus').textContent=`${sound?'低音量預聽':'預聽已靜音，可按試聽開啟'} · Mushroom_Dance_120BPM.mp3`;
 if(game.mode==='dance'&&dance)syncDance();
 $('game').dataset.mapId=game.mapId;
 $('rescueInteract').hidden=!game.canRescueInteract;$('rescueInteract').textContent=game.hasRescueKey?'解鎖 Mushroom Core · E':'LOCKED · 查看鎖頭 · E';$('quizEnter').hidden=!game.canEnterQuiz;
 if(game.mode==='qa')syncQuiz();
 if(game.mode==='qa-key')$('quizScore').textContent=`Knowledge Score ${game.score} / 4 · 第五題 Accepted`;
 if(game.mode==='rescue-confirm')$('rescueConfirmInfo').textContent=`Rescue Energy ${game.rescue.energy} · Tier ${game.rescue.tier}`;
 if(game.mode==='rescuing'){$('rescueProgress').textContent=game.rescueTime<1.4?'Lock Released · 城市封鎖裝置解除。':game.rescueTime<6.4?'Spore Restoration · 孢子匯入 Mushroom Core，菌絲重新連結…':'Mushroom Core 復甦了。';$('rescueTier').textContent=`TIER ${game.rescue.tier} · ENERGY ${game.rescue.energy}`;}
 if(story){$('storyOpening').classList.toggle('has-video',story.mode==='video');$('storyEnding').classList.toggle('has-video',story.mode==='video');$('openingLoading').hidden=!story.loading;$('openingSkip').hidden=story.loading;$('openingCaption').textContent=story.elapsed<2?'高雄，連日大雨。':story.elapsed<5?'道路裂縫裡，微弱的菌絲開始甦醒。':story.elapsed<7?'啵！一顆小小的 Mushroom 誕生了。':'循著微光，向右出發。';$('endingLabel').textContent=`${game.rescue?.tier===3?'FULL BLOOM':'LIFE RETURNS'} · TIER ${game.rescue?.tier??1}`;}
 if(qa){
  const status=$('qaStatus');if(status)status.textContent=JSON.stringify({story:story?{kind:story.kind,elapsed:story.elapsed,loading:story.loading,media:story.mode}:null,presentation,chapterClear:store.data.chapterClear,studio:studio?{mode:studio.mode,x:studio.player.x}:null,card03:store.data.hasMushroomArtCard03,totalPhysical:store.data.totalPhysicalSpores,hasRescueKey:game.hasRescueKey??false,quizIndex:game.quizIndex,score:game.score,rescued:game.rescued,lockDiscovered:game.lockDiscovered??false,grounded:game.player.grounded,support:game.player.support,map:game.mapId,mode:game.mode,x:Math.round(game.player.x),y:game.player.y,hp:game.player.hp,spores:game.count,buff:game.drumsticksRemaining??0,leroySeen:game.leroySeen??false,sprintCleared:game.sprintCleared??false,sprintAttempts:game.sprintAttempts??0,checkpoint:game.checkpoint?.id,card:store.data.hasMushroomArtCard01,card02:store.data.hasMushroomArtCard02,isGiant:game.isGiant??false,giantShield:game.giantShield??0,bear:game.bearBeatEventCompleted??false,crouch:game.player.crouching??false,visibleWorldWidth:game.visibleWorldWidth??0,gachaUsed:game.map4GachaUsed??false,gachaReward:game.gachaReward??null,bonusSpores:game.bonusSpores??0,buffs:game.buffs??{},advancedClear:game.advancedDanceCleared??false,currentSection:game.currentSection??section.id,trapTime:game.time,spikes:game.mapId>=4?game.level.SPIKES.map(s=>({id:s.id,...game.spikeAt(s)})):[],crushers:game.mapId>=4?game.crushers.map(c=>({id:c.id,...game.crusherAt(c)})):[],falling:game.mapId>=4?game.falling.map(p=>({id:p.id,state:p.state,timer:p.timer})):[],shots:[3,4,5].includes(game.mapId)?game.projectiles:[],sfx:{enabled:sfx.enabled,state:sfx.context?.state??'uninitialized',played:sfx.played},audio:{status:danceAudio.status,currentTime:danceAudio.audio.currentTime,preview:danceAudio.previewing,musicStarted:danceAudio.musicStarted,paused:danceAudio.paused},dance:dance?{stage:dance.stage.id,phase:dance.phase.phase,clock:dance.clockMs,cells:dance.cells,complete:dance.complete}:null});
 }
}

function syncQuiz(){
 const q=QUESTIONS[game.quizIndex];if(!q)return;
 $('quizEyebrow').textContent=game.quizIndex===4?'FINAL IMPORTANT QUESTION':`QUESTION ${game.quizIndex+1} / 5`;
 $('quizQuestion').textContent=q.question;
 const signature=`${game.quizIndex}:${game.quizFeedback}`;
 if(lastQuizView!==signature){lastQuizView=signature;$('quizOptions').replaceChildren(...q.options.map((text,i)=>{const b=document.createElement('button');b.className='quiz-option';b.textContent=`${'ABC'[i]}. ${text}`;b.disabled=game.quizFeedback!==null;b.onclick=()=>{game.answerQuiz(i);store.capture(game);};return b;}));}
 $('quizFeedback').textContent=game.quizFeedback===null?'':answerDetails(game.quizIndex,game.answers[game.quizIndex]);$('quizFeedback').className=game.quizFeedback==='Wrong'?'wrong':'correct';$('quizNext').hidden=game.quizFeedback===null;
}
function renderFinal(){
 const r=game.rescue;$('finalPhysical').textContent=`${r.physical} / 100`;$('finalBonus').textContent=`+${r.bonus}`;$('finalEnergy').textContent=r.energy;$('finalTier').textContent=`TIER ${r.tier}`;
 $('finalCards').textContent=['01','02','03'].map((id,i)=>`#${i+1} ${store.data[`hasMushroomArtCard${id}`]?'✓':'???'}`).join('    ');
 $('wallpapers').replaceChildren(...wallpaperRewards(store.data).map(reward=>{if(reward.url){const a=document.createElement('a');a.href=reward.url;a.target='_blank';a.rel='noopener noreferrer';a.className='outline';a.textContent=`Wallpaper #${Number(reward.id)}`;return a;}const span=document.createElement('span');span.className='wallpaper-pending';span.textContent=`Wallpaper #${Number(reward.id)} · Coming Later`;return span;}));
}
$('studioContinue').onclick=()=>{if(game.mode!=='studio-talk')return;game.mode='dance-preview';danceAudio.setMuted(!sound);void danceAudio.preview();clearInput();};$('studioExit').onclick=leaveSecret;
$('lockClose').onclick=()=>game.closeLock();$('rescueInteract').onclick=()=>game.interactRescue();$('quizEnter').onclick=()=>game.enterQuiz();$('quizNext').onclick=()=>{game.nextQuestion();lastQuizView='';store.capture(game);};$('quizExit').onclick=()=>game.exitQuiz();$('quizKeyExit').onclick=()=>game.exitQuiz();$('rescueStart').onclick=()=>game.beginRescue();$('rescueCancel').onclick=()=>game.cancelRescue();$('chapterReplay').onclick=beginOpening;

$('game').tabIndex=0;
$('start').onclick=beginOpening;$('startMap2').onclick=()=>startMap2();$('resumeMap2').onclick=()=>startMap2(true);
$('startMap3').onclick=()=>startMap3();$('resumeMap3').onclick=()=>startMap3(true);$('startMap4').onclick=()=>startMap4();$('resumeMap4').onclick=()=>startMap4(true);$('resumeMap5').onclick=()=>startMap5(true);$('startMap5').onclick=()=>startMap5();$('gachaUse').onclick=()=>game.useGacha();$('gachaConfirm').onclick=()=>{game.closeGacha();store.capture(game);};$('advancedExit').onclick=leaveSecret;$('replayMap4').onclick=()=>startMap4();$('replayMap3').onclick=()=>startMap3();$('card3Close').onclick=()=>{game.closeCard();store.capture(game);};
$('skip').onclick=()=>game.finishIntro();$('pause').onclick=pause;$('resume').onclick=pause;
$('replay').onclick=()=>game.mapId===1?beginOpening():game.mapId===2?startMap2():game.mapId===3?startMap3():game.mapId===4?startMap4():startMap5();
$('continue').onclick=()=>{if(game.mode!=='result')return;if(game.mapId===1)startMap2(false,true);else if(game.mapId===2)startMap3(false,true);else if(game.mapId===3){store.capture(game);startMap4(false,true);}else{store.capture(game);startMap5Preview();}};
for(const b of document.querySelectorAll('.home'))b.onclick=home;
$('mapList').replaceChildren(...MAPS.map(m=>{const el=document.createElement('span');el.textContent=m.id<=5?`0${m.id} ✓`:`0${m.id} · LOCKED`;return el;}));
$('sound').onclick=()=>{setSound(!sound);tone(660);};
$('dialogueNext').onclick=()=>{game.advanceDialogue();store.capture(game);};
$('retrySprint').onclick=()=>{if(game.retrySprint())store.capture(game);};
$('secretEnter').onclick=()=>game.enterSecret();
$('previewPlay').onclick=()=>{setSound(true);void danceAudio.preview();};
$('danceReady').onclick=beginDance;
$('previewExit').onclick=leaveSecret;$('danceExit').onclick=leaveSecret;$('secretExit').onclick=leaveSecret;
$('audioRetry').onclick=()=>danceAudio.status==='resume-blocked'?void danceAudio.resume():retryDance();
for(let i=0;i<4;i++){const cell=document.createElement('div');cell.className='dance-cell';const b=document.createElement('b'),small=document.createElement('small');cell.append(b,small);$('danceCells').append(cell);}
for(const b of document.querySelectorAll('[data-direction]'))b.onclick=()=>danceInput(b.dataset.direction);
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump'};
const danceKeys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'&&fullscreen.active){clearInput();void fullscreen.exit();return;}
 if(transition){e.preventDefault();return;}
 if(presentation==='opening'||presentation==='ending'){if(e.code==='Escape'){e.preventDefault();if(!e.repeat)skipStory();}return;}
 if(e.code==='Escape'){e.preventDefault();if(!e.repeat){if(game.mode==='intro')game.finishIntro();else pause();}return;}
 if(game.mode==='dance'&&danceKeys[e.code]){e.preventDefault();if(!e.repeat)danceInput(danceKeys[e.code]);return;}
 // Buttons handle Enter/Space themselves; avoid advancing a dialogue twice via key and synthetic click.
 if(['playing','studio-passage'].includes(game.mode)){
  if(game.mode==='playing'&&['KeyE','ArrowDown'].includes(e.code)&&game.canRescueInteract){e.preventDefault();if(!e.repeat)game.interactRescue();return;}
  if(game.mode==='playing'&&['KeyE','ArrowDown'].includes(e.code)&&game.canEnterQuiz){e.preventDefault();if(!e.repeat)game.enterQuiz();return;}
  if(['KeyE','ArrowDown'].includes(e.code)&&game.canUseGacha){e.preventDefault();if(!e.repeat)game.useGacha();return;}
  if(['KeyE','ArrowDown'].includes(e.code)&&game.canEnterSecret){e.preventDefault();if(!e.repeat)game.enterSecret();return;}
  if([1,3,4,5].includes(game.mapId)&&['ArrowDown','KeyS'].includes(e.code)){e.preventDefault();input.crouch=true;return;}
  if(keys[e.code]){e.preventDefault();qaFreeze=false;if(keys[e.code]!=='jump'||!e.repeat)input[keys[e.code]]=true;}
 }
});
window.addEventListener('keyup',e=>{if(keys[e.code])input[keys[e.code]]=false;if(['ArrowDown','KeyS'].includes(e.code))input.crouch=false;});
for(const b of document.querySelectorAll('[data-key]')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(!['playing','studio-passage'].includes(game.mode))return;qaFreeze=false;b.setPointerCapture(e.pointerId);input[b.dataset.key]=true;});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>input[b.dataset.key]=false);
}
function backgroundPause(){clearInput();if(fullscreen.switching&&!document.hidden)return;if(['playing','dance','studio-passage'].includes(game.mode))pause();else if(game.mode==='dance-preview')danceAudio.audio.pause();if(game.mapId>=2)store.capture(game);}
window.addEventListener('blur',backgroundPause);
document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundPause();});
window.addEventListener('pagehide',()=>{if(game.mapId>=2)store.capture(game);danceAudio.stop();});
function frame(ms){
 const dt=last?Math.min((ms-last)/1000,.1):0;last=ms;
 if(story&&!document.hidden&&!qaFreeze){storyVideo.advance(dt);story?.advance(dt);}
 if([3,4,5].includes(game.mapId))game.setVisibleWorldWidth($('game').width);
 if(!document.hidden&&!qaFreeze)accumulator+=dt;
 if(transition&&!document.hidden&&!qaFreeze){const current=transition;current.advance(dt);if(transition)$('roomFade').style.opacity=String(current.opacity);}
 while(accumulator>=1/120){game.step(1/120,input);input.jump=false;input.interact=false;accumulator-=1/120;}
 for(const event of game.events.splice(0)){
  sfx.play(event);
  if(event==='bounce')tone(480,.3);
  if(event==='hurt'){toast('落水 · HP −1，孢子保留');}
  if(['spike-hurt','crusher-hurt'].includes(event)){sfx.play('hurt');toast(event==='spike-hurt'?'地刺 · HP −1':'壓縮機 · HP −1');}
  if(event==='projectile-hurt'){toast('投射物 · HP −1');}
  if(event==='telegraph')tone(400,.12);
  if(event.startsWith('checkpoint')){tone(590,.3);toast(`Checkpoint ${event.slice('checkpoint-'.length)}`);}
  if(event==='death')toast('菌絲重組 · 一半孢子散落在號誌附近');
  if(event==='drum-fill')drumFill();
  if(event==='drumsticks'){tone(880,.3);toast('Drumsticks · 30 秒跨越寬河，登上吊車冠頂');}
  if(event==='secret-enter')enterStudio();
  if(event==='sprint-clear')toast('水道試跑完成 · 下一段回到普通節奏');
  if(event==='sprint-retry')toast('30 秒 · 沿岸邊箭頭助跑起跳');
  if(event==='reactor'){tone(300,.4);toast('GIANT · SHIELD 1');}
  if(event==='shield-break'){sfx.play('hurt');toast('Shield −1 · HP 保留');}
  if(event==='giant-break')tone(95,.2);
  if(event==='chest-locked')toast('ϟ');
  if(game.mapId===3&&['spore','checkpoint-A','checkpoint-B','reactor','shield-break','projectile-hurt','hurt','death','giant-break','art-card-02','bear-beat','clear','respawn'].includes(event))store.capture(game);
  if(game.mapId===4&&['spore','checkpoint-A','checkpoint-B','checkpoint-C','gacha-roll','gacha-reward','gacha-close','secret-enter','secret-exit','advanced-clear','shield-break','spike-hurt','crusher-hurt','projectile-hurt','hurt','death','respawn','clear'].includes(event))store.capture(game);
  if(event==='chapter-clear')beginEnding();
  if(event==='clear')tone(990,.6);
  if(game.mapId===5&&['spore','checkpoint-A','checkpoint-B','gacha-roll','gacha-reward','gacha-close','qa-enter','qa-answer','rescue-key','qa-exit','lock-interact','rescue-start','chapter-clear','shield-break','hurt','death','respawn','projectile-hurt','spike-hurt','crusher-hurt'].includes(event))store.capture(game);
  if(game.mapId===1&&['spore','hurt','death','respawn','clear'].includes(event))store.capture(game);
  if(game.mapId===2&&['spore','death','drumsticks','leroy','secret-enter','secret-exit','art-card','checkpoint-A','checkpoint-B','projectile-hurt','hurt','sprint-clear','sprint-wait','sprint-retry'].includes(event))store.capture(game);
 }
 if(game.mode==='dance'&&dance){dance.update(danceAudio.clock());const beat=Math.floor(dance.clockMs/500);if(beat!==lastDanceBeat){lastDanceBeat=beat;if(dance.phase.phase==='countdown')tone(440,.045);}if(dance.complete){game.completeDance();danceAudio.stop();store.capture(game);}}
 if(game.mapId>=2&&game.mode==='playing'&&ms-lastSave>=1000){store.capture(game);lastSave=ms;}
 renderer.draw(studio??game,qaFreeze?0:dt);if(story)drawStory(renderer,game,story,game.rescue?.tier??1);else drawMyceliumSignal(renderer,game);sync();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
