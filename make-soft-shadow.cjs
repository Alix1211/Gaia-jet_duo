// One-time rasterization of a feathered ellipse. No frame-time canvas blur.
const fs = require('node:fs');
const path = require('node:path');
const {createCanvas} = require('@napi-rs/canvas');

const canvas = createCanvas(256, 96);
const ctx = canvas.getContext('2d');
ctx.save();
ctx.translate(128, 48);
ctx.scale(121, 42);
const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
gradient.addColorStop(0, 'rgba(1,30,48,.72)');
gradient.addColorStop(.35, 'rgba(1,30,48,.66)');
gradient.addColorStop(.64, 'rgba(1,30,48,.39)');
gradient.addColorStop(.84, 'rgba(1,30,48,.13)');
gradient.addColorStop(1, 'rgba(1,30,48,0)');
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(0, 0, 1, 0, Math.PI * 2);
ctx.fill();
ctx.restore();
const out = path.join(__dirname, 'assets', 'shadow-feather.png');
fs.writeFileSync(out, canvas.toBuffer('image/png'));
console.log(out);
