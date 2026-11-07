// Mechanically embeds the already optimized WebP files for an offline single HTML.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, 'index.html');
const output = path.join(path.dirname(dir), 'GAIA-JET-DUO-BACKGROUND-SWITCH-v13.html');
let html = fs.readFileSync(src, 'utf8');
if (!html.includes("const ASSET_ROOT='assets/';")) throw Error('Missing asset-root marker');
html = html.replace("const ASSET_ROOT='assets/';", "const ASSET_ROOT='';");

const files = fs.readdirSync(path.join(dir, 'assets')).filter(name => name.endsWith('.webp'));
if (files.length !== 20) throw Error(`Expected 20 sprites/effects/backgrounds, got ${files.length}`);
for (const file of files) {
  const marker = `'${file}'`;
  if (!html.includes(marker)) throw Error(`Not referenced in game: ${file}`);
  const data = fs.readFileSync(path.join(dir, 'assets', file)).toString('base64');
  html = html.replace(marker, `'data:image/webp;base64,${data}'`);
}
const shadowFile = path.join(dir, 'assets', 'shadow-feather.png');
if (!fs.existsSync(shadowFile)) throw Error('Missing prerendered shadow image');
const shadowMarker = "'shadow-feather.png'";
if (!html.includes(shadowMarker)) throw Error('Shadow asset not referenced');
html = html.replace(shadowMarker, `'data:image/png;base64,${fs.readFileSync(shadowFile).toString('base64')}'`);
const waveFile = path.join(dir, 'assets', 'wave-front.png');
if (!fs.existsSync(waveFile)) throw Error('Missing water-front compositing asset');
const waveMarker = "'wave-front.png'";
if (!html.includes(waveMarker)) throw Error('Wave-front asset not referenced');
html = html.replace(waveMarker, `'data:image/png;base64,${fs.readFileSync(waveFile).toString('base64')}'`);
fs.writeFileSync(output, html);
console.log(`Created ${output}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
