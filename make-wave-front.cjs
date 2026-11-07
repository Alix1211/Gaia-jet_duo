// Composites the existing ocean image into a single feathered foreground wave.
// Used only during packaging; the game draws one PNG instead of per-frame blur.
const fs = require('node:fs');
const path = require('node:path');
const {createCanvas,loadImage} = require('@napi-rs/canvas');

(async()=>{
 const ocean=await loadImage(path.join(__dirname,'assets','water-texture.webp'));
 const width=640,height=260,canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
 ctx.save();ctx.beginPath();ctx.moveTo(0,61);
 for(let x=0;x<=width;x+=8){
  const y=60+7*Math.sin(x*.023)+4*Math.sin(x*.052+1.9)+3*Math.sin(x*.10);
  ctx.lineTo(x,y);
 }
 ctx.lineTo(width,height);ctx.lineTo(0,height);ctx.closePath();ctx.clip();
 ctx.globalAlpha=.96;
 ctx.drawImage(ocean,90,280,1320,470,0,0,width,height);
 ctx.restore();
 ctx.save();ctx.strokeStyle='rgba(227,255,255,.54)';ctx.lineWidth=2.8;ctx.lineCap='round';
 for(let x=28;x<width-35;x+=45){
  ctx.beginPath();
  for(let j=0;j<=22;j+=4){const xx=x+j,y=60+7*Math.sin(xx*.023)+4*Math.sin(xx*.052+1.9)+3*Math.sin(xx*.10);
   if(j===0)ctx.moveTo(xx,y);else ctx.lineTo(xx,y);
  }
  ctx.stroke();
 }
 ctx.restore();
 // Smooth lateral edges and top/bottom opacity in the baked alpha channel.
 ctx.globalCompositeOperation='destination-in';
 const side=ctx.createLinearGradient(0,0,width,0);
 side.addColorStop(0,'rgba(255,255,255,0)');
 side.addColorStop(.12,'rgba(255,255,255,1)');
 side.addColorStop(.88,'rgba(255,255,255,1)');
 side.addColorStop(1,'rgba(255,255,255,0)');
 ctx.fillStyle=side;ctx.fillRect(0,0,width,height);
 const vertical=ctx.createLinearGradient(0,0,0,height);
 vertical.addColorStop(0,'rgba(255,255,255,.6)');
 vertical.addColorStop(.37,'rgba(255,255,255,1)');
 vertical.addColorStop(.85,'rgba(255,255,255,.91)');
 vertical.addColorStop(1,'rgba(255,255,255,.05)');
 ctx.fillStyle=vertical;ctx.fillRect(0,0,width,height);
 ctx.globalCompositeOperation='source-over';
 const file=path.join(__dirname,'assets','wave-front.png');
 fs.writeFileSync(file,canvas.toBuffer('image/png'));
 console.log(file);
})().catch(err=>{console.error(err);process.exitCode=1});
