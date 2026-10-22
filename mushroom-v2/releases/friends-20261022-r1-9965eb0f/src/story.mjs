// Presentation state is separate from gameplay state. Completion is always idempotent.
export class StorySequence{
 constructor({kind='opening',duration=10,ready=false,onComplete=()=>{}}={}){this.kind=kind;this.duration=duration;this.ready=ready;this.onComplete=onComplete;this.elapsed=0;this.mode='placeholder';this.finished=false;this.completed=false;this.cancelled=false;}
 advance(dt){if(this.cancelled||this.completed)return;if(!this.finished&&this.mode!=='video'){this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,Math.min(dt,.1)));if(this.elapsed>=this.duration-1e-7)this.finish();}this.commit();}
 finish(){if(this.cancelled)return;this.finished=true;this.elapsed=this.duration;this.commit();}
 skip(){this.finish();}
 markReady(){this.ready=true;this.commit();}
 commit(){if(!this.cancelled&&!this.completed&&this.finished&&this.ready){this.completed=true;this.onComplete();}}
 cancel(){this.cancelled=true;}
 get loading(){return this.finished&&!this.ready&&!this.cancelled;}
}
// Missing, blocked, unsupported, stalled and aborted videos all converge on the placeholder.
export class StoryVideo{
 constructor(element,{fallback=()=>{},ended=()=>{},playing=()=>{},timeout=6}={}){this.element=element;this.callbacks={fallback,ended,playing};this.timeout=timeout;this.active=false;this.lastTime=0;this.idle=0;this.generation=0;}
 start(path,muted=false){this.stop();if(!path){this.callbacks.fallback();return;}const v=this.element,token=this.generation,valid=()=>this.active&&this.generation===token;this.active=true;v.hidden=true;v.muted=muted;v.loop=false;v.playsInline=true;v.preload='auto';v.onplaying=()=>{if(!valid())return;v.hidden=false;this.idle=0;this.callbacks.playing();};v.onended=()=>{if(!valid())return;this.active=false;this.callbacks.ended();};v.onerror=()=>{if(valid())this.fail();};v.src=path;try{v.load();const promise=v.play();promise?.catch(()=>{if(valid())this.fail();});}catch{if(valid())this.fail();}}
 advance(dt){if(!this.active)return;const t=Number(this.element.currentTime)||0;if(t>this.lastTime+.01){this.lastTime=t;this.idle=0;}else this.idle+=Math.max(0,dt);if(this.idle>=this.timeout)this.fail();}
 fail(){if(!this.active)return;this.stop();this.callbacks.fallback();}
 stop(){this.generation++;const v=this.element;this.active=false;this.idle=0;this.lastTime=0;v.onplaying=v.onended=v.onerror=null;v.pause();v.hidden=true;v.removeAttribute('src');v.load();}
}
