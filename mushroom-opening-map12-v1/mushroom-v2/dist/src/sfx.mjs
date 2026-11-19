// Locally synthesized effects: no network, audio files, or Dance transport changes.
export class GameSfx {
 constructor(factory=()=>new AudioContext()){this.factory=factory;this.context=null;this.enabled=true;this.played={};}
 unlock(){
  if(!this.enabled)return;
  try{this.context??=this.factory();if(this.context.state==='suspended')void this.context.resume().catch(()=>{});}catch{}
 }
 setEnabled(value){this.enabled=!!value;}
 voice(from,to,duration,{delay=0,type='triangle',volume=.055}={}){
  if(!this.enabled||!this.context||this.context.state!=='running')return;
  const c=this.context,at=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(from,at);o.frequency.exponentialRampToValueAtTime(to,at+duration);
  g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  o.connect(g).connect(c.destination);o.start(at);o.stop(at+duration+.01);
 }
 play(event){
  if(!this.enabled||this.context?.state!=='running')return;
  const v=(...a)=>this.voice(...a);
  switch(event){
   case 'platform-warning':case 'trap-warning':v(300,140,.13,{type:'triangle',volume:.04});break;
   case 'platform-fall':v(120,45,.22,{type:'sawtooth',volume:.025});break;
   case 'jump':v(210,560,.12,{volume:.045});break;
   case 'spore':v(880,1120,.09,{type:'sine'});v(1320,1760,.18,{delay:.075,type:'sine',volume:.045});break;
   case 'crate-stomp':case 'chest-stomp':v(145,55,.13,{type:'triangle',volume:.075});v(480,130,.07,{type:'square',volume:.018});break;
   case 'crate-crack':case 'chest-crack':v(420,85,.085,{type:'sawtooth',volume:.022});v(230,95,.07,{delay:.025,type:'square',volume:.014});break;
   case 'art-card-02':v(660,880,.17,{type:'sine',volume:.045});v(990,1320,.24,{delay:.08,type:'sine',volume:.04});break;
   case 'crate-break':case 'chest-break':v(180,35,.36,{type:'sawtooth',volume:.04});v(310,75,.16,{delay:.07,volume:.05});break;
   case 'hurt':case 'police-hurt':case 'projectile-hurt':v(180,45,.28,{type:'sawtooth',volume:.045});v(90,38,.3,{type:'sine',volume:.07});break;
   case 'fire':v(620,90,.16,{type:'square',volume:.025});v(120,48,.13,{type:'triangle',volume:.055});break;
   default:return;
  }
  this.played[event]=(this.played[event]??0)+1;
 }
}
