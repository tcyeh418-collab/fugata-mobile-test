import {supportsWalk,drawWalk,walkFrame,WALK} from './walk-v14.js';
import { DEFAULT_CHARACTER, instrumentVisible } from './model.js';
export function drawGameAvatar(context,state,{reducedMotion=false}={}) {
 const p=state.player,c=state.character||DEFAULT_CHARACTER;
 if(supportsWalk(c)){
  context.save();context.fillStyle='#04051088';context.beginPath();context.ellipse(p.x,p.y+1,16,5,0,0,Math.PI*2);context.fill();
  drawWalk(context,c,{direction:p.facing||'front',frame:walkFrame(state,reducedMotion),hideInstrument:!instrumentVisible(state),x:p.x,y:p.y,scale:WALK.scale});
  if(c.nickname){context.font='12px FugataPixel,monospace';context.textAlign='center';const w=context.measureText(c.nickname).width;context.fillStyle='#0b0d19e8';context.fillRect(p.x-w/2-4,p.y-116,w+8,16);context.fillStyle='#f5d69c';context.fillText(c.nickname,p.x,p.y-104);}
  context.restore();return;
 }
 // Unsupported saves must pass character confirmation before entering play.
}
