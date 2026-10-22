import {Map4Game} from './map4-game.mjs?rev=map5-20261020-r1';
import * as M from './map5.mjs?rev=map5-20261020-r1';
import {QUESTIONS,quizScore,answerFeedback} from './quiz.mjs?rev=map5-20261020-r1';
import {emptyBuffs,rescueSummary} from './chapter.mjs?rev=map5-20261020-r1';
export class Map5Game extends Map4Game{
 get rules(){return M;}
 reset(){super.reset();this.hasRescueKey=false;this.lockDiscovered=false;this.answers=[];this.quizIndex=0;this.quizFeedback=null;this.rescueTime=0;this.rescued=false;}
 start(){super.start();this.buffs=emptyBuffs();}
 get map5SupplyCrateUsed(){return this.map4GachaUsed;}
 get inBearSafeZone(){return this.player.x>=M.GACHA.safeStart&&this.player.x<=M.GACHA.safeEnd||this.player.x>=23000;}
 projectileSafeAt(x){return x>=M.GACHA.safeStart&&x<=M.GACHA.safeEnd||x>=23000;}
 get canEnterSecret(){return false;}
 get canEnterQuiz(){return this.mode==='playing'&&this.player.grounded&&!this.respawn&&Math.abs(this.player.x-M.QA_ROOM.x)<M.QA_ROOM.radius;}
 get canRescueInteract(){return this.mode==='playing'&&this.player.grounded&&!this.respawn&&Math.abs(this.player.x-M.RESCUE.x)<M.RESCUE.radius;}
 get score(){return quizScore(this.answers);}
 get rescue(){return rescueSummary(this.runState);}
 get runState(){const parent=super.runState;return {...parent,map5SupplyCrateUsed:this.map4GachaUsed,supplyReward:this.gachaReward,supplyRewardGranted:this.gachaRewardGranted,hasRescueKey:this.hasRescueKey,quizAnswers:[...this.answers],lockDiscovered:this.lockDiscovered,rescued:this.rescued,nextMapId:5,physicalSporeProgress:{...this.history,5:{collected:this.count,total:20,ids:this.spores.filter(s=>s.collected).map(s=>s.id)}}};}
 interactRescue(){if(!this.canRescueInteract)return false;this.player.vx=0;this.lockDiscovered=true;this.mode=this.hasRescueKey?'rescue-confirm':'lock-notice';this.emit('lock-interact');return true;}
 closeLock(){if(this.mode==='lock-notice')this.mode='playing';}
 enterQuiz(){if(!this.canEnterQuiz)return false;this.player.vx=0;this.projectiles=[];if(this.answers.length===5)this.hasRescueKey=true;this.mode=this.hasRescueKey?'qa-key':'qa';this.quizIndex=this.answers.length;this.quizFeedback=null;this.emit('qa-enter');return true;}
 answerQuiz(index){if(this.mode!=='qa'||this.quizFeedback!==null||!Number.isInteger(index)||index<0||index>2||this.quizIndex>=5)return false;this.answers.push(index);this.quizFeedback=answerFeedback(this.quizIndex,index);this.emit('qa-answer');return true;}
 nextQuestion(){if(this.mode!=='qa'||this.quizFeedback===null)return false;this.quizIndex=this.answers.length;this.quizFeedback=null;if(this.quizIndex>=QUESTIONS.length){this.hasRescueKey=true;this.mode='qa-key';this.emit('rescue-key');}return true;}
 exitQuiz(){if(!['qa','qa-key'].includes(this.mode))return false;this.teleport({x:M.QA_ROOM.returnX,y:590});this.safe={x:M.QA_ROOM.returnX,y:590};this.invulnerable=1;this.mode='playing';this.emit('qa-exit');return true;}
 beginRescue(){if(this.mode!=='rescue-confirm'||!this.hasRescueKey)return false;this.rescueTime=0;this.mode='rescuing';this.emit('rescue-start');return true;}
 cancelRescue(){if(this.mode==='rescue-confirm')this.mode='playing';}
 step(dt,input={}){if(this.mode==='rescuing'){this.rescueTime+=Math.max(0,Math.min(dt,1/30));if(this.rescueTime>=M.RESCUE.duration){this.rescued=true;this.mode='chapter-clear';this.buffs=emptyBuffs();this.emit('chapter-clear');}return;}if(input.interact&&this.mode==='playing'){if(this.canRescueInteract){this.interactRescue();return;}if(this.canEnterQuiz){this.enterQuiz();return;}}super.step(dt,{...input,interact:input.interact&&!this.canRescueInteract&&!this.canEnterQuiz});}
 snapshot(){return {...super.snapshot(),map5:true,terrainRevision:M.TERRAIN_REVISION,...this.runState,quizIndex:this.quizIndex,quizFeedback:this.quizFeedback,rescueTime:this.rescueTime,rescuePending:['rescuing','rescue-confirm'].includes(this.mode)};}
 restore(saved,authoritativeRun){if(!saved?.map5)return false;const state=authoritativeRun??saved;const mapped={...state,map4GachaUsed:state.map5SupplyCrateUsed===true,gachaReward:state.supplyReward,gachaRewardGranted:state.supplyRewardGranted===true};if(!super.restore(saved,mapped))return false;if(saved.terrainRevision!==M.TERRAIN_REVISION)this.spores=this.spores.map(s=>({...s,x:M.SPORES.find(o=>o.id===s.id).x,y:M.SPORES.find(o=>o.id===s.id).y}));this.hasRescueKey=state.hasRescueKey===true;this.lockDiscovered=state.lockDiscovered===true;this.answers=(state.quizAnswers??[]).slice(0,5).filter(a=>Number.isInteger(a)&&a>=0&&a<=2);this.quizIndex=this.answers.length;this.hasRescueKey ||= this.answers.length===5;this.quizFeedback=null;this.rescued=state.rescued===true;if(this.rescued){this.mode='chapter-clear';this.buffs=emptyBuffs();}return true;}
}
