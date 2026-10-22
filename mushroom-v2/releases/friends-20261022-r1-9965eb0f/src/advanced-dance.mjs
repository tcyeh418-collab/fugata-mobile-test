import {BeginnerDance} from './dance.mjs?rev=map5-20261020-r1';
export const ADVANCED_STAGES=Object.freeze([
 {id:'1',sequence:['up','up','down','left']},{id:'2',sequence:['left','right','up','down']},
 {id:'3',sequence:['up','down','left','right','up','left']},{id:'4',sequence:['left','left','right','up','down','right']},
 {id:'5',sequence:['up','left','down','right','up','right','left','down']},{id:'6',sequence:['left','right','up','up','down','left','down','right']},
]);
export class AdvancedDance extends BeginnerDance{constructor(){super({stages:ADVANCED_STAGES});}}
