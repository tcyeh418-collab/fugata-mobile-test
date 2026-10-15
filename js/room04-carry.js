import {WALK,walkFrame} from './character/walk-v14.js';
// Measured palms in the existing empty-hand walk frames (no character redraw).
// The same hand is followed through the four authored steps and each facing.
export const ROOM04_PALMS=Object.freeze({
 boy:{front:[[445,456],[445,467],[409,393],[455,459]],back:[[198,459],[204,478],[219,405],[205,470]],left:[[468,472],[363,474],[461,442],[410,483]],right:[[170,473],[274,474],[179,442],[229,482]]},
 girl:{front:[[436,441],[432,455],[377,337],[418,455]],back:[[197,459],[190,460],[235,356],[201,461]],left:[[436,481],[366,465],[432,451],[396,470]],right:[[203,481],[272,465],[207,452],[242,470]]},
});
export function room04CarriedCapsule(state,reducedMotion=false){
 const p=state.player;
 if(state.room04Presentation?.playerForm==='orb')return {x:p.x+10,y:p.y-22,width:10,height:24};
 const facing=p.facing||'front',palms=ROOM04_PALMS[state.character?.template]||ROOM04_PALMS.boy;
 const [hx,hy]=(palms[facing]||palms.front)[walkFrame(state,reducedMotion)];
 const handX=p.x+(hx-WALK.foot[0])*WALK.scale,handY=p.y+(hy-WALK.foot[1])*WALK.scale;
 // Grip at the upper ring, with the capsule hanging below the palm.
 return {x:handX-5,y:handY-6,width:10,height:24};
}
