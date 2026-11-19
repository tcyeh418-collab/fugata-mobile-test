// Presentation-only image readiness, cache revision and one transient-error retry.
export const MAP4_ART_REVISION='integration-v8';
export function artworkURL(file,root,attempt=0){const url=new URL(file,root);url.searchParams.set('art',MAP4_ART_REVISION);if(attempt)url.searchParams.set('retry',String(attempt));return url.href;}
export function createArtworkBank(root,fileFor){const images=new Map(),failed=new Set(),attempts=new Map();
 function load(key){if(typeof Image==='undefined')return null;if(!images.has(key)){const im=new Image();images.set(key,im);im.decoding='async';let timeout;const assign=()=>{clearTimeout(timeout);im.src=artworkURL(fileFor(key),root,attempts.get(key)??0);if(typeof window!=='undefined')timeout=setTimeout(()=>{if(!im.complete||!im.naturalWidth)im.onerror();},15000);};im.onerror=()=>{clearTimeout(timeout);const count=attempts.get(key)??0;if(count===0){attempts.set(key,1);assign();}else failed.add(key);};im.onload=()=>{clearTimeout(timeout);failed.delete(key);};assign();}const im=images.get(key);return !failed.has(key)&&im.complete&&im.naturalWidth?im:null;}
 function status(keys){const loaded=keys.map(load);return{ready:loaded.every(Boolean),loaded:loaded.filter(Boolean).length,requested:images.size,failed:[...failed],retried:[...attempts.keys()]};}
 function retry(){for(const key of failed){images.delete(key);attempts.delete(key);}failed.clear();}
 return{load,status,retry};
}
