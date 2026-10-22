import {BEGINNER_STAGES,BEAT_MS,INPUT_WINDOW_MS,getDanceRoundTiming,getDancePhaseAt,resolveDanceInputBeat,judgeDanceBeat} from './dance-core.mjs?rev=map5-20261020-r1';
// Thin session adapter around the existing Mushroom timing functions.
export class BeginnerDance {
 constructor({stages=BEGINNER_STAGES}={}){this.stages=stages;this.stageIndex=0;this.prerollMs=8*BEAT_MS;this.roundStartClockMs=this.prerollMs;this.clockMs=0;this.complete=false;this.stageResults=[];this.resetCells();this.update(0);}
 resetCells(){const n=this.stage.sequence.length;this.received=Array(n).fill(null);this.offsets=Array(n).fill(null);this.cells=Array(n).fill('pending');}
 get stage(){return this.stages[this.stageIndex];}
 get stats(){return this.stageResults.reduce((sum,r)=>{for(const k of ['correct','wrong','miss'])sum[k]+=r[k];return sum;},{correct:0,wrong:0,miss:0});}
 judge(index){if(this.cells[index]!=='pending')return;this.cells[index]=judgeDanceBeat({expectedDirection:this.stage.sequence[index],receivedDirection:this.received[index],timingOffsetMs:this.offsets[index],inputWindowMs:INPUT_WINDOW_MS}).result;}
 update(clockMs){
  if(this.complete)return;
  this.clockMs=Math.max(this.clockMs,clockMs);
  if(this.clockMs<this.prerollMs){this.phase={phase:'preroll',demoIndex:-1,inputIndex:-1,countInValue:null};return;}
  while(!this.complete){
   const length=this.stage.sequence.length;
   const phase=getDancePhaseAt((this.clockMs-this.roundStartClockMs)/BEAT_MS,length);
   const through=phase.phase==='input'?phase.inputIndex:['round-result','complete'].includes(phase.phase)?length:0;
   for(let i=0;i<through;i++)this.judge(i);
   this.phase=phase;
   if(phase.phase!=='complete')break;
   const record={id:this.stage.id,correct:0,wrong:0,miss:0};for(const outcome of this.cells)record[outcome]++;
   this.stageResults.push(record);
   if(this.stageIndex===this.stages.length-1){this.complete=true;break;}
   this.roundStartClockMs+=getDanceRoundTiming(length).totalBeats*BEAT_MS;this.stageIndex++;this.resetCells();
  }
 }
 input(direction,clockMs=this.clockMs){
  this.update(clockMs);
  if(this.complete||this.phase.phase!=='input')return false;
  const beat=resolveDanceInputBeat({inputTimeMs:clockMs,roundStartAtMs:this.roundStartClockMs,sequenceLength:this.stage.sequence.length,beatDurationMs:BEAT_MS,inputWindowMs:INPUT_WINDOW_MS});
  if(!beat||this.received[beat.index]!==null)return false;
  this.received[beat.index]=direction;this.offsets[beat.index]=beat.offsetMs;this.judge(beat.index);return true;
 }
}
// Playback reset and clock selection follow the existing Mushroom audio flow:
// The opening eight beats and every challenge phase share audio.currentTime.
// A pending/blocked play promise freezes the entire challenge at beat zero.
export class DanceAudio {
 constructor({onError=()=>{},audioFactory=()=>new Audio('./releases/friends-20261022-r1-9965eb0f/audio/Mushroom_Dance_120BPM.mp3'),now=()=>performance.now()}={}){
  this.audio=audioFactory();this.audio.preload='auto';this.onError=onError;this.now=now;
  this.token=0;this.previewing=false;this.running=false;this.paused=false;this.muted=false;this.status='idle';
  this.audio.addEventListener?.('error',()=>{this.status='error';this.onError('120 BPM 音檔無法載入，請重試');});
 }
 setMuted(muted){this.muted=muted;this.audio.muted=muted;}
 async preview(){
  this.stop();const token=++this.token;this.previewing=true;this.audio.loop=true;this.audio.volume=.32;
  try{await this.audio.play();if(token===this.token)this.status='preview';}
  catch{if(token===this.token){this.status='preview-blocked';this.onError('按「試聽」啟動音樂，或直接準備開始');}}
 }
 start(){
  this.stop();this.token++;this.running=true;this.startedAt=this.now();this.musicRequested=false;this.musicStarted=false;this.paused=false;this.lastClock=0;
  this.musicStartClockMs=0;
  this.audio.loop=false;this.audio.volume=.82;void this.requestMusic();
 }
 async requestMusic(){
  if(this.musicRequested)return;
  this.musicRequested=true;this.status='starting';const token=this.token;
  this.audio.pause();this.audio.currentTime=0;
  try{await this.audio.play();if(token!==this.token||!this.running)return;this.musicStarted=true;this.status='audio';if(this.paused)this.audio.pause();}
  catch{if(token===this.token){this.status='blocked';this.onError('音樂尚未啟動，按「重試音訊」；輸入計時已暫停');}}
 }
 clock(){
  if(!this.running)return 0;
  if(this.paused)return this.pausedClock;
  let clock;
  if(this.musicStarted)clock=this.musicStartClockMs+this.audio.currentTime*1000;
  else clock=0;
  this.lastClock=Math.max(this.lastClock,clock);return this.lastClock;
 }
 retry(){if(this.running)this.start();}
 pause(){if(!this.running||this.paused)return;this.pausedClock=this.clock();this.paused=true;this.pauseAt=this.now();this.audio.pause();}
 async resume(){if(!this.paused)return;this.startedAt+=this.now()-this.pauseAt;this.paused=false;if(this.musicStarted){try{await this.audio.play();}catch{this.status='resume-blocked';this.paused=true;this.pauseAt=this.now();this.onError('按「繼續舞會音訊」恢復播放');}}}
 stop(){this.token++;this.audio.pause();this.audio.currentTime=0;this.previewing=false;this.running=false;this.musicStarted=false;this.musicRequested=false;this.paused=false;this.status='idle';}
}
