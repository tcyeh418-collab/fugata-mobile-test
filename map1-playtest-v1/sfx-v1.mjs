import {AUDIO_LEVELS} from './audio-levels-v1.mjs';
import {SOUNDS,EVENT_SOUNDS}from'./sound-config-v1.mjs';
export class PlaytestSFX {
 constructor(ui,{createAudio=()=>new Audio(),now=()=>performance.now()/1000}={}){
  this.ui=ui;this.createAudio=createAudio;this.now=now;this.enabled=true;this.unlocked=false;this.suspended=false;this.hidden=false;this.volume=AUDIO_LEVELS.sfx;this.won=false;this.pools=new Map;this.last=new Map;this.errors=new Set;this.log=[];
  for(const[id,file]of Object.entries(SOUNDS)){const a=this.voice(id,file);this.pools.set(id,[a]);}
  this.paint();
 }
 voice(id,file){const a=this.createAudio();a.preload='auto';a.loop=false;a.src=file;a.volume=this.volume;a.addEventListener('error',()=>{this.errors.add(id);this.paint()});return a;}
 unlock(){this.unlocked=true;}
 play(id){
  if(!id||!SOUNDS[id]||!this.enabled||!this.unlocked||this.hidden||(this.suspended&&id!=='button')||this.errors.has(id))return false;
  const t=this.now(),gap=id==='button'?.08:.06;if(t-(this.last.get(id)??-Infinity)<gap)return false;
  const pool=this.pools.get(id);let a=pool.find(a=>a.paused||a.ended);
  if(!a&&pool.length<(id==='clear'?1:3)){a=this.voice(id,SOUNDS[id]);pool.push(a)}
  if(!a){a=pool[0];a.pause();}a.currentTime=0;a.volume=this.volume;a.loop=false;this.last.set(id,t);
  this.log.push({id,at:t});if(this.log.length>160)this.log.shift();
  try{const pending=a.play();pending?.catch(()=>{});}catch{}return true;
 }
 handle(events,stopBGM){for(const event of events){
  if(event==='clear'){if(this.won)continue;this.won=true;stopBGM();this.stopAll();this.play('clear');}
  else if(event.startsWith('checkpoint-'))this.play('checkpoint');
  else if(Object.hasOwn(EVENT_SOUNDS,event))this.play(EVENT_SOUNDS[event]);
 }}
 stopAll(){for(const pool of this.pools.values())for(const a of pool){a.pause();try{a.currentTime=0}catch{}}}
 reset(){this.stopAll();this.last.clear();this.won=false;}
 setSuspended(value,hidden=false){if(this.suspended===value&&this.hidden===hidden)return;this.suspended=value;this.hidden=hidden;if(value){for(const[id,pool]of this.pools)for(const a of pool){a.pause();if(id!=='clear')try{a.currentTime=0}catch{}}}else if(this.won&&this.enabled){const a=this.pools.get('clear')[0];if(a.currentTime>0&&!a.ended)a.play().catch(()=>{});}}
 paint(){this.ui.status.textContent=this.errors.size?'部分音效載入失敗，遊戲可繼續':'落地／被抓音效尚未配置';}
}
