// Deterministic 5-pose -> 12-frame conversion. Keeps the original rhythm game's
// 6x2 grid, frame 6 hit window and source character proportions unchanged.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputDir = path.join(root, 'assets/minigame/squat_duo_source');
const outputDir = path.join(root, 'assets/minigame/squat_home');
const frames = [0,1,2,3,4,4,4,4,3,2,1,0];
const sourceWidth=352, sourceHeight=576, frameWidth=275, frameHeight=456;
const artHeight=450, paddingTop=frameHeight-artHeight;

async function build(name, target) {
  const src=path.join(inputDir,`${name}-5poses.png`);
  const meta=await sharp(src).metadata();
  if(meta.width!==sourceWidth*5||meta.height!==sourceHeight||!meta.hasAlpha){
    throw Error(`Unexpected source sheet: ${src} ${meta.width}x${meta.height} alpha=${meta.hasAlpha}`);
  }
  const poses=await Promise.all(Array.from({length:5},(_,i)=>sharp(src)
    .extract({left:i*sourceWidth,top:0,width:sourceWidth,height:sourceHeight})
    .resize(frameWidth,artHeight,{fit:'fill',kernel:'lanczos3'})
    .png().toBuffer()));
  const layers=frames.map((pose,index)=>({
    input:poses[pose],left:index%6*frameWidth,top:Math.floor(index/6)*frameHeight+paddingTop
  }));
  const dest=path.join(outputDir,target);
  await sharp({create:{width:frameWidth*6,height:frameHeight*2,channels:4,background:'#00000000'}})
    .composite(layers)
    .webp({quality:91,alphaQuality:100,effort:6}).toFile(dest);
  console.log(`${name}: ${dest} 1650x912, deep pose at rhythm-hit frame 6`);
}

fs.mkdirSync(outputDir,{recursive:true});
await build('pink','squat_front_duo_1650x912.webp');
await build('purple','squat_back_duo_1650x912.webp');
