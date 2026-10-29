// Presentation state only. All clocks come from game simulation, never render count.
export const POLICE_ANIMATION=Object.freeze({stride:108,runFrames:Object.freeze([1,2,3,4,5,6,7,8]),runFPSAt270:20,arrival:0,stop:9,rise:10,fall:11,idle:12});
export class PoliceAnimator{
 constructor(){this.reset()}
 reset(){this.id=null;this.time=null;this.x=null;this.y=null;this.distance=0;this.direction=1;this.started=0;this.lastMove=0;this.state='idle';this.frame=12;}
 sample(g){
  const e=g.chase,t=g.time;
  if(!e||(e.state!=='active'&&!g.capture)){this.reset();return{frame:12,direction:1,state:'idle',distance:0}}
  // A reset/QA seek/new beat starts a fresh, deterministic animation clock.
  if(this.id!==e.id||this.time===null||t<this.time||Math.abs(e.x-this.x)>100){this.reset();this.id=e.id;this.x=e.x;this.y=e.y;this.time=t;this.started=t;this.lastMove=t;this.direction=e.facing??1;}
  const elapsed=t-this.time,dx=e.x-this.x;
  if(elapsed>0){if(Math.abs(dx)>.001){this.distance+=Math.abs(dx);this.direction=Math.sign(dx);this.lastMove=t;}this.time=t;this.x=e.x;this.y=e.y;}
  const moving=t-this.lastMove<.075,air=e.grounded===false;
  let frame,state;
  if(g.capture){state='capture';frame=9;}
  else if(air){state=e.vy<0?'rise':'fall';frame=e.vy<0?10:11;}
  else if(t-this.started<.12){state='arrival';frame=0;}
  else if(moving){state='run';frame=1+Math.floor(this.distance/POLICE_ANIMATION.stride*8)%8;}
  else{state=e.pendingDirection?'turn':'stop';frame=9;}
  this.frame=frame;this.state=state;return{frame,direction:this.direction,state,distance:this.distance};
 }
}
