// One black frame boundary, independent of world time and paused power-ups.
export class RoomTransition {
 constructor({onBlack=()=>{},onComplete=()=>{},duration=.6}={}){this.elapsed=0;this.duration=duration;this.onBlack=onBlack;this.onComplete=onComplete;this.switched=false;this.complete=false;}
 get opacity(){const t=Math.min(1,this.elapsed/this.duration);return t<.5?t*2:(1-t)*2;}
 advance(dt){if(this.complete)return;this.elapsed+=Math.max(0,dt);if(!this.switched&&this.elapsed>=this.duration/2){this.switched=true;this.onBlack();}if(this.elapsed>=this.duration){this.complete=true;this.onComplete();}}
}
