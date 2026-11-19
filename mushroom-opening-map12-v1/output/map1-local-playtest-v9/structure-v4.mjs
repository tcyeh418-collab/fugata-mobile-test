export const SOFTENING=Object.freeze({strength:.85,blur:.8*.85,saturation:1-(1-.62)*.85,contrast:1-(1-.72)*.85,brightness:1+.06*.85,tintAlpha:35,fogAlpha:86});
export function gapKind(gap){return gap.x<23000?'pit':'water';}
