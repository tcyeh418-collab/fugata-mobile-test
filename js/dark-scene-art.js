// Shared loading/drawing tools for independent transparent production sprites.
export function createDarkSceneArt(ctx,sources){
  const assets=Object.fromEntries(Object.entries(sources).map(([key,src])=>{
    const image=new Image(),a={image,bounds:null,failed:false};
    image.onload=()=>{
      if(key==='background'||key==='foreground')return;
      const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
      const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
      const data=g.getImageData(0,0,c.width,c.height).data;
      let left=c.width,top=c.height,right=-1,bottom=-1;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>24){
        left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      }
      if(right>=left)a.bounds={x:left,y:top,width:right-left+1,height:bottom-top+1};
    };
    image.onerror=()=>{a.failed=true;};image.src=src;return [key,a];
  }));
  const ready=key=>assets[key]?.image.complete&&assets[key].image.naturalWidth>0&&!assets[key].failed;
  return {assets,ready,allReady:()=>Object.keys(assets).every(ready),
    errors:()=>Object.keys(assets).filter(k=>assets[k].failed),
    plate(key){if(ready(key))ctx.drawImage(assets[key].image,0,0,2520,1080);},
    sprite(key,x,y,height,maxWidth=Infinity){const a=assets[key],b=a?.bounds;if(!ready(key)||!b)return;
      const s=Math.min(height/b.height,maxWidth/b.width),w=b.width*s,h=b.height*s;
      ctx.drawImage(a.image,b.x,b.y,b.width,b.height,x-w/2,y-h,w,h);},
    text(label,x,y,color='#ead9ba',size=18){ctx.save();ctx.textAlign='center';
      ctx.font=`500 ${size}px system-ui,sans-serif`;ctx.lineWidth=5;ctx.strokeStyle='#07101c';ctx.strokeText(label,x,y);
      ctx.fillStyle=color;ctx.fillText(label,x,y);ctx.restore();},
    glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');
      ctx.save();ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();},
  };
}
