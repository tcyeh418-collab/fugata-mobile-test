import {MAP2_AUDIO_LEVELS} from './map2-audio-levels.mjs';
export const MAP2_MUSIC_MODES=new Set(['playing','dialogue','leroy-gift','sprint-retry']);
export function map2MusicAllowed(game){return game?.mapId===2&&MAP2_MUSIC_MODES.has(game.mode);}
// Stream the unchanged long MP3. Never borrow the dance clock or change gameplay state.
export class Map2Bgm{
 constructor({createAudio=()=>new Audio(),hidden=()=>document.hidden}={}){this.audio=createAudio();this.audio.preload='metadata';this.audio.loop=true;this.audio.volume=MAP2_AUDIO_LEVELS.bgm;this.volume=MAP2_AUDIO_LEVELS.bgm;this.hidden=hidden;this.enabled=true;this.focused=true;this.unlocked=false;this.failed=false;this.blocked=false;this.pending=null;this.game=null;this.sourceSet=false;this.log=[];this.audio.addEventListener?.('error',()=>{this.failed=true;this.record('error')});}
 record(event){this.log.push({event,time:this.audio.currentTime});if(this.log.length>100)this.log.shift()}
 allowed(){return this.enabled&&this.focused&&!this.hidden()&&this.unlocked&&!this.failed&&map2MusicAllowed(this.game);}
 unlock(){this.unlocked=true;this.blocked=false;this.sync();}
 setEnabled(v){this.enabled=!!v;this.sync();}
 setVolume(v){this.volume=MAP2_AUDIO_LEVELS.bgm;this.audio.volume=this.volume;}
 updateGame(g){if(this.game!==g){this.audio.pause();if(g.mapId===2){try{this.audio.currentTime=0}catch{}this.record('new-run')}this.game=g;}if(g.mapId===2&&!this.sourceSet){this.audio.src=new URL('../audio/map2-bgm-v1/bgm-v1.mp3',import.meta.url).href;this.sourceSet=true;}this.sync();}
 sync(){if(!this.allowed()){if(!this.audio.paused){this.record('pause');this.audio.pause()}return;}if(!this.audio.paused||this.pending||this.blocked||!this.sourceSet)return;let result;try{result=this.audio.play()}catch{this.blocked=true;return}this.pending=Promise.resolve(result).then(()=>{if(!this.allowed())this.audio.pause();else this.record('play')}).catch(e=>{if(e.name!=='AbortError'&&this.allowed())this.blocked=true}).finally(()=>{this.pending=null;if(this.allowed()&&this.audio.paused&&!this.blocked)this.sync()});}
 stop(){this.audio.pause();try{this.audio.currentTime=0}catch{}this.record('stop');}
}
