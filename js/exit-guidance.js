import {door01Collider,door02Collider,door03Collider,door04Collider,door05Collider,door06Collider} from './rooms.js?v=room04-movement-fixes-v6';
import {ROOM03_DOORWAY} from './room03-layout.js';
import {ROOM04_DOORWAY} from './room04-layout.js?v=room04-movement-fixes-v6';
const exits=[door01Collider,door02Collider,door03Collider,door04Collider,door05Collider,door06Collider];
export function drawExitGuidance(ctx,state){
 const room=state.gameProgress.currentRoom,door=state['door0'+room],rect=exits[room-1];if(!rect)return;
 const open=door.status==='open',opening=door.status==='opening';
 ctx.save();
 // Keep the acclaimed Room6 portal and Room1/2 authored door rendering unchanged.
 ctx.font='700 12px ui-sans-serif,system-ui';ctx.textAlign='right';ctx.fillStyle='#ffe2a1';ctx.shadowColor='#080b0f';ctx.shadowBlur=5;
 ctx.fillText(open?(room===6?'最終出口已開啟 →':`前往第 ${room+1} 室 →`):'出口 · 尚未開啟',room===4?ROOM04_DOORWAY.exit.label.x:rect.x-12,room===4?ROOM04_DOORWAY.exit.label.y:rect.y-15);
 if([3,4].includes(room)){
  const entrance=(room===3?ROOM03_DOORWAY:ROOM04_DOORWAY).entrance;
  const p=entrance.anchor||entrance.arrival;ctx.textAlign='left';ctx.fillStyle='#c8ba9a';ctx.fillText('入口 · 來時方向',room===4?entrance.label.x:p.x+18,room===4?entrance.label.y:270-16);
 }
 ctx.restore();
}
