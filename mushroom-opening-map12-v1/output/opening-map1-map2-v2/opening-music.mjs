export class OpeningMusic{
 constructor(){this.context=null;this.buffer=null;this.source=null;this.offset=0;this.startedAt=0;this.active=false;this.level=1;}
 async prepare(){if(this.buffer)return;this.context??=new AudioContext();const response=await fetch(new URL('./audio/MushroomBGM_Opening_1120.mp3',import.meta.url));if(!response.ok)throw Error('Opening 配樂載入失敗');this.buffer=await this.context.decodeAudioData(await response.arrayBuffer());this.gain=this.context.createGain();this.gain.connect(this.context.destination);}
 async start(){await this.context.resume();this.stop();this.active=true;this.offset=0;this.level=1;this.resume();}
 resume(){if(!this.active||this.source)return;const source=this.context.createBufferSource();source.buffer=this.buffer;source.connect(this.gain);source.start(0,Math.min(this.offset,this.buffer.duration));this.startedAt=this.context.currentTime;this.source=source;this.gain.gain.value=this.level;}
 pause(){if(!this.source)return;this.offset+=this.context.currentTime-this.startedAt;this.source.stop();this.source.disconnect();this.source=null;}
 fade(remaining){this.level=Math.min(1,Math.max(0,remaining/1.5));if(this.gain)this.gain.gain.setTargetAtTime(document.getElementById("sound")?.getAttribute("aria-pressed")==="false"?0:this.level,this.context.currentTime,.04);}
 stop(){this.pause();this.active=false;this.offset=0;}
 get state(){return{ready:!!this.buffer,active:this.active,playing:!!this.source&&this.context?.state==='running',offset:this.offset+(this.source?this.context.currentTime-this.startedAt:0),duration:this.buffer?.duration??0};}
}
