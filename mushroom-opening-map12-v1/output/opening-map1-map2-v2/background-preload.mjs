// Keep decoded chapter backgrounds ready, including checkpoint and far-end entry points.
export async function preloadBackgrounds(kit,manifestUrl){
 const response=await fetch(manifestUrl);if(!response.ok)throw Error('背景清單載入失敗');
 const manifest=await response.json();kit.backgroundManifest=manifest;
 const base=new URL('.',new URL(manifestUrl,location.href));let cursor=0;
 const worker=async()=>{while(cursor<manifest.files.length){const f=manifest.files[cursor++],im=new Image,t=performance.now();im.environmentX=f.start*2;im.src=new URL(f.file,base).href;try{await im.decode();kit.backgrounds.set(f.file,im);kit.loads.push({id:f.file,ok:true,bytes:f.bytes,ms:performance.now()-t});}catch{throw Error('關卡背景載入失敗，請重新整理重試。');}}};
 await Promise.all([worker(),worker(),worker()]);
 kit.ensureBackground=async()=>{};
}
