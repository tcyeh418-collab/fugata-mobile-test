const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export const BACKGROUND_SOFTENING=Object.freeze({strength:.85,blur:.8*.85,saturation:1-(1-.62)*.85,contrast:1-(1-.72)*.85,brightness:1+.06*.85,tintAlpha:35,fogAlpha:86});
export function sceneLight(x){
 // Environment belongs to the painted world position, including when retracing the route.
 const t=x<11000?.15*smooth(x/11000):x<23000?.15+.5*smooth((x-11000)/12000):.65+.35*smooth((x-23000)/13000);
 return {daylight:t,ambient:.72+.23*t,rainCount:Math.round(28-20*t)};
}
export function harborWater(x){
 const t=smooth((x-23000)/13000),mix=(a,b)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t)),rgb=a=>'rgb('+a.join(',')+')';
 return {top:rgb(mix([99,105,158],[133,140,184])),middle:rgb(mix([58,79,132],[85,104,157])),bottom:rgb(mix([31,46,83],[49,69,112]))};
}
export const TERRAIN_IDS=new Set(['ground-top','wall','brick','roof','pipe','scaffold','suspended','moving','shore','utility-lid','inspection-lid','shaft-wall','access-rim','quay-edge','harbor-outlet']);

export function atmosphereColor(x){const t=sceneLight(x).daylight;return [62,82,111].map((v,i)=>Math.round(v+([185,205,207][i]-v)*t));}
