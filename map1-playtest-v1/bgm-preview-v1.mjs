import {AUDIO_LEVELS} from './audio-levels-v1.mjs';
export class PreviewBGM {
 constructor(audio,ui){
  this.audio=audio;this.ui=ui;this.enabled=true;this.unlocked=false;this.suspended=false;this.failed=!!audio.error;this.blocked=false;this.pending=null;
  audio.loop=true;audio.volume=AUDIO_LEVELS.bgm;
  for(const event of ['playing','pause','loadedmetadata','waiting'])audio.addEventListener(event,()=>this.paint());
  audio.addEventListener('error',()=>{this.failed=true;this.paint();});this.paint();
 }
 unlock(){this.unlocked=true;this.blocked=false;this.sync();}
 setSuspended(value){if(this.suspended===value)return;this.suspended=value;this.sync();}
 shouldPlay(){return this.enabled&&this.unlocked&&!this.suspended&&!this.failed;}
 sync(){
  if(!this.shouldPlay()){this.audio.pause();this.paint();return;}
  if(!this.audio.paused||this.pending||this.blocked){this.paint();return;}
  this.pending=this.audio.play().then(()=>{if(!this.shouldPlay())this.audio.pause();}).catch(error=>{
   if(error.name!=='AbortError'&&this.shouldPlay())this.blocked=true;
  }).finally(()=>{this.pending=null;this.paint();if(this.shouldPlay()&&this.audio.paused&&!this.blocked)this.sync();});this.paint();
 }
 paint(){
  this.ui.status.textContent=this.failed?'BGM載入失敗，遊戲可繼續':!this.enabled?'已靜音':!this.unlocked?'操作遊戲後播放BGM':this.suspended?'BGM暫停':this.blocked?'請再次操作遊戲以啟用聲音':this.audio.paused?'BGM準備中':'Map1 BGM 循環播放中';
 }
}
