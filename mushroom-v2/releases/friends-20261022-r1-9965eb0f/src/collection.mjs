export const SPORES_PER_MAP=20;
export const MAIN_SPORES=14,OPTIONAL_SPORES=6;
export const TOTAL_SPORES=100;
export const COLLECTION_REVISION=2;
// Legacy IDs remain valid. Newly added spores start uncollected; no free credit or reset.
export function restoreSpores(base,saved,{sameLayout=false}={}){
 const rows=saved?.spores;if(!Array.isArray(rows)||new Set(rows.map(s=>s.id)).size!==rows.length)return base;
 const known=new Set(base.map(s=>s.id));if(rows.some(s=>!known.has(s.id)))return base;
 return base.map(s=>{const old=rows.find(o=>o.id===s.id);if(!old)return s;return {...s,...(sameLayout&&saved.collectionRevision===COLLECTION_REVISION&&Number.isFinite(old.x)&&Number.isFinite(old.y)?{x:old.x,y:old.y}:{}),collected:old.collected===true};});
}
