import {Game} from './core/engine.mjs';

export const CAPTURE_TIMING=Object.freeze({duration:2,fadeOut:.6,resolveAt:.9,fadeInAt:1.2});
export function captureOpacity(elapsed){if(elapsed<.6)return Math.max(0,elapsed/.6);if(elapsed<1.2)return 1;return Math.max(0,1-(elapsed-1.2)/.8);}

// Presentation-only subclass for this independent preview; original game modules remain untouched.
export class PreviewGame extends Game {
 reset(){super.reset();this.capture=null;}
 takeDamage(kind='hurt',resetAt=this.safe){
  if(kind!=='police-hurt')return super.takeDamage(kind,resetAt);
  if(this.capture||this.mode!=='playing'||this.respawn>0||this.invulnerable>0)return false;
  this.capture={elapsed:0,resolved:false,resetAt:{...resetAt},cameraReset:false};
  this.mode='police-caught';this.player.vx=0;this.player.vy=0;
  this.emit('police-caught-presentation');return true;
 }
 step(dt,input={}){
  if(!this.capture)return super.step(dt,input);
  const cap=this.capture;cap.elapsed=Math.min(CAPTURE_TIMING.duration,cap.elapsed+Math.max(0,Math.min(dt,1/30)));
  if(!cap.resolved&&cap.elapsed+1e-9>=CAPTURE_TIMING.resolveAt){
   this.mode='playing';super.takeDamage('police-hurt',cap.resetAt);cap.resolved=true;this.mode='police-caught';
  }
  // A lethal catch uses the original death/penalty/respawn path, hidden within the black hold.
  else if(cap.resolved&&this.respawn>0){this.mode='playing';super.step(dt,{});this.mode='police-caught';}
  if(cap.elapsed+1e-9>=CAPTURE_TIMING.duration){this.capture=null;this.mode='playing';this.emit('police-capture-resume');}
 }
}

// Presentation hooks; original forces, collision and damage rules stay in core/Game.
PreviewGame.prototype.onLanding=function(surface,impact){if(!impact.wasGrounded&&impact.impactVelocity>260)this.emit('land');};
const originalFall=PreviewGame.prototype.fall;
PreviewGame.prototype.fall=function(){if(this.mode==='playing'&&this.respawn<=0&&this.invulnerable<=0){this.lastFall={x:this.player.x,y:this.player.y};this.lastFallKind=this.player.x>=23000?'water':'pit';this.emit('fall-'+this.lastFallKind);}return originalFall.call(this);};
