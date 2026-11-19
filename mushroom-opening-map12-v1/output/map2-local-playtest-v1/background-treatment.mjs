// User-confirmed values, 2026-10-26. Applied exclusively to the background.
export const SOFTENING=Object.freeze({
 blur:0.68,saturation:0.677,contrast:0.762,brightness:1.051,
 pixelScale:2,tintColor:'#b9cfcd',tintAlpha:35/255,tintFill:'#b9cfcd23',
 fogColor:'#b9cdcf',fogAlpha:86/255,fogTransparent:'#b9cdcf00',fogFill:'#b9cdcf56',
 fogStartY:320,fogEndY:620
});
export const BACKGROUND_FILTER=`blur(${SOFTENING.blur}px) saturate(${SOFTENING.saturation}) contrast(${SOFTENING.contrast}) brightness(${SOFTENING.brightness})`;
export function fogAlphaAt(y){return Math.max(0,Math.min(1,(y-SOFTENING.fogStartY)/(SOFTENING.fogEndY-SOFTENING.fogStartY)))*SOFTENING.fogAlpha;}
