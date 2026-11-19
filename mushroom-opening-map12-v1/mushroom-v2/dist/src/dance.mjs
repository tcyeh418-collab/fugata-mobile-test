import {BEGINNER_STAGES,BEAT_MS,INPUT_WINDOW_MS,getDanceRoundTiming,resolveDanceInputBeat,judgeDanceBeat} from './dance-core.mjs?rev=map5-20261020-r1';
import {DANCE_GRID,danceSchedule,roundFeedback} from './dance-sync.mjs';
export class BeginnerDance {
 constructor({stages=BEGINNER_STAGES,startClockMs=0,grid=DANCE_GRID}={}){this.stages=stages;this.grid={...grid};this.startClockMs=startClockMs;this.schedule=danceSchedule(stages,startClockMs,grid);this.stageIndex=0;this.prerollMs=this.schedule[0].questionAt;this.roundStartClockMs=this.prerollMs;this.clockMs=startClockMs;this.complete=false;this.stageResults=[];this.resetCells();this.update(startClockMs);}
 resetCells(){const n=this.stage.sequence.length;this.received=Array(n).fill(null);this.offsets=Array(n).fill(null);this.cells=Array(n).fill('pending');}
 get stage(){return this.stages[this.stageIndex];}
 get timing(){return this.schedule[this.stageIndex];}
 alignToMusic(originMs){const delta=((originMs-this.grid.originMs+1000)%2000+2000)%2000-1000;if(Math.abs(delta)<.001)return;this.grid.originMs=originMs;for(const t of this.schedule)for(const key of Object.keys(t))t[key]+=delta;this.prerollMs=this.schedule[0].questionAt;this.roundStartClockMs=this.timing.questionAt;}
 get completionClockMs(){return this.schedule.at(-1).feedbackEnd;}
 get beatIndex(){return Math.floor((this.clockMs-this.grid.originMs)/BEAT_MS);}
 get feedback(){return this.clockMs>=this.timing.resultAt?roundFeedback(this.cells):null;}
 get stats(){return this.stageResults.reduce((sum,r)=>{for(const k of ['correct','wrong','miss'])sum[k]+=r[k];return sum;},{correct:0,wrong:0,miss:0});}
 judge(index){if(this.cells[index]!=='pending')return;this.cells[index]=judgeDanceBeat({expectedDirection:this.stage.sequence[index],receivedDirection:this.received[index],timingOffsetMs:this.offsets[index],inputWindowMs:INPUT_WINDOW_MS}).result;}
 update(clockMs){if(this.complete)return;this.clockMs=Math.max(this.clockMs,clockMs);while(!this.complete){const t=this.timing,n=this.stage.sequence.length;this.roundStartClockMs=t.questionAt;const phase=(name,extra={})=>({phase:name,currentBeatIndex:this.beatIndex,demoIndex:-1,inputIndex:-1,countInValue:null,...extra});
 if(this.clockMs<t.questionAt){this.phase=phase(this.stageIndex===0?'preroll':'sync');return;}
 if(this.clockMs<t.demoAt){this.phase=phase('question');return;}
 if(this.clockMs<t.demoEnd){this.phase=phase('demonstrate',{demoIndex:Math.floor((this.clockMs-t.demoAt)/BEAT_MS)});return;}
 if(this.clockMs<t.countAt){this.phase=phase('sync');return;}
 if(this.clockMs<t.inputAt){this.phase=phase('countdown',{countInValue:4-Math.floor((this.clockMs-t.countAt)/BEAT_MS)});return;}
 const through=this.clockMs<t.resultAt?Math.floor((this.clockMs-t.inputAt)/BEAT_MS):n;for(let i=0;i<through;i++)this.judge(i);
 if(this.clockMs<t.resultAt){this.phase=phase('input',{inputIndex:through});return;}
 if(this.clockMs<t.feedbackEnd){this.phase=phase('round-result',{inputIndex:n});return;}
 if(this.stageIndex<this.stages.length-1&&this.clockMs<t.nextAt){this.phase=phase('sync',{inputIndex:n});return;}
 const record={id:this.stage.id,correct:0,wrong:0,miss:0};for(const outcome of this.cells)record[outcome]++;this.stageResults.push(record);
 if(this.stageIndex===this.stages.length-1){this.complete=true;this.phase=phase('complete',{inputIndex:n});return;}this.stageIndex++;this.resetCells();
 }}
 input(direction,clockMs=this.clockMs){this.update(clockMs);if(this.complete||this.phase.phase!=='input')return false;const beat=resolveDanceInputBeat({inputTimeMs:clockMs,roundStartAtMs:this.timing.inputAt-getDanceRoundTiming(this.stage.sequence.length).playBeat*BEAT_MS,sequenceLength:this.stage.sequence.length,beatDurationMs:BEAT_MS,inputWindowMs:INPUT_WINDOW_MS});if(!beat||this.received[beat.index]!==null)return false;this.received[beat.index]=direction;this.offsets[beat.index]=beat.offsetMs;this.judge(beat.index);return true;}
}
// Preview and questions share the actual media clock; pending playback freezes timing.
// A pending/blocked play promise freezes the entire challenge at beat zero.
export class DanceAudio {
 constructor({onError=()=>{},volumeFor=phase=>phase==='preview'?.32:.82,audioFactory=()=>new Audio('./audio/Mushroom_Dance_120BPM.mp3'),now=()=>performance.now()}={}){
  this.volumeFor=volumeFor;this.audio=audioFactory();this.audio.preload='auto';this.onError=onError;this.now=now;
  this.token=0;this.previewing=false;this.running=false;this.paused=false;this.muted=false;this.status='idle';
  this.audio.addEventListener?.('error',()=>{this.status='error';this.onError('120 BPM 音檔無法載入，請重試');});
 }
 setMuted(muted){this.muted=muted;this.audio.muted=muted;}
 async preview(){
  this.stop();const token=++this.token;this.previewing=true;this.audio.loop=true;this.audio.volume=this.volumeFor('preview');
  try{await this.audio.play();if(token===this.token)this.status='preview';}
  catch{if(token===this.token){this.status='preview-blocked';this.onError('按「試聽」啟動音樂，或直接準備開始');}}
 }
 start(){
  const keepPreview=this.previewing&&this.status==='preview'&&!this.audio.paused;
  if(!keepPreview)this.stop();this.token++;this.previewing=false;this.running=true;this.startedAt=this.now();this.musicRequested=keepPreview;this.musicStarted=keepPreview;this.paused=false;this.lastClock=0;this.lastMediaMs=keepPreview?this.audio.currentTime*1000:0;this.cycleClockMs=0;this.musicStartClockMs=0;
  this.audio.loop=true;this.audio.volume=this.volumeFor('dance');if(keepPreview){this.status='audio';this.lastClock=this.lastMediaMs;}else void this.requestMusic();
 }
 async requestMusic(){
  if(this.musicRequested)return;
  this.musicRequested=true;this.status='starting';const token=this.token;
  this.audio.pause();this.audio.currentTime=0;
  try{await this.audio.play();if(token!==this.token||!this.running)return;this.musicStarted=true;this.status='audio';if(this.paused)this.audio.pause();}
  catch{if(token===this.token){this.status='blocked';this.onError('音樂尚未啟動，按「重試音訊」；輸入計時已暫停');}}
 }
 get beatOriginMs(){return this.cycleClockMs+DANCE_GRID.originMs;}
 clock(){
  if(!this.running)return 0;
  if(this.paused)return this.pausedClock;
  let clock;
  if(this.musicStarted){const mediaMs=this.audio.currentTime*1000;if(this.lastMediaMs-mediaMs>1000){this.cycleClockMs+=Number.isFinite(this.audio.duration)&&this.audio.duration>0?this.audio.duration*1000:DANCE_GRID.loopBeats*BEAT_MS;}this.lastMediaMs=mediaMs;clock=this.cycleClockMs+mediaMs;}
  else clock=0;
  this.lastClock=Math.max(this.lastClock,clock);return this.lastClock;
 }
 retry(){if(this.running)this.start();}
 pause(){if(!this.running||this.paused)return;this.pausedClock=this.clock();this.paused=true;this.pauseAt=this.now();this.audio.pause();}
 async resume(){if(!this.paused)return;this.startedAt+=this.now()-this.pauseAt;this.paused=false;if(this.musicStarted){try{await this.audio.play();}catch{this.status='resume-blocked';this.paused=true;this.pauseAt=this.now();this.onError('按「繼續舞會音訊」恢復播放');}}}
 stop(){this.token++;this.audio.pause();this.audio.currentTime=0;this.previewing=false;this.running=false;this.musicStarted=false;this.musicRequested=false;this.paused=false;this.status='idle';}
}
