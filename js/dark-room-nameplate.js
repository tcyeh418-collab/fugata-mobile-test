// Shared cabinet-attached labels for the dark room art trials.
export function drawDarkNameplate(ctx,label,x,y,color='#ead9ba',size=18){
    ctx.save();ctx.font=`600 ${size}px system-ui,sans-serif`;
    const w=Math.max(112,Math.ceil(ctx.measureText(label).width)+36),top=y-13,h=30;
    // Short metal brackets attach the plate to this cabinet's foot, so the
    // next row's label cannot look like it belongs to the machine behind it.
    ctx.strokeStyle='#a4814e';ctx.lineWidth=3;
    for(const dx of [-24,24]){ctx.beginPath();ctx.moveTo(x+dx,y-23);ctx.lineTo(x+dx,top+2);ctx.stroke();}
    ctx.fillStyle='#02060a80';ctx.fillRect(x-w/2+3,top+4,w,h);
    ctx.fillStyle='#111820';ctx.fillRect(x-w/2,top,w,h);
    ctx.strokeStyle='#a4814e';ctx.lineWidth=1.5;ctx.strokeRect(x-w/2,top,w,h);
    ctx.strokeStyle='#d6b97b38';ctx.lineWidth=1;ctx.strokeRect(x-w/2+3,top+3,w-6,h-6);
    ctx.fillStyle='#bb975b';for(const dx of [-w/2+9,w/2-9]){ctx.beginPath();ctx.arc(x+dx,top+h/2,2,0,Math.PI*2);ctx.fill();}
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;
    ctx.fillText(label,x,top+h/2);ctx.restore();
  }
