// Mechanically embeds all optimized game assets, including seven 3-frame team sheets.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, 'index.html');
const output = path.join(path.dirname(dir), 'GAIA-JET-DUO-v20-BGM-JUMP-MIX.html');
let html = fs.readFileSync(src, 'utf8');
if (!html.includes("const ASSET_ROOT='assets/';")) throw Error('Missing asset-root marker');
html = html.replace("const ASSET_ROOT='assets/';", "const ASSET_ROOT='';");
const assetDir=path.join(dir,'assets');
function enumerate(folder,relative=''){
 return fs.readdirSync(folder,{withFileTypes:true}).flatMap(ent=>{
  const rel=path.posix.join(relative,ent.name);
  return ent.isDirectory()?enumerate(path.join(folder,ent.name),rel):/\.(webp|png|jpg|ogg)$/i.test(ent.name)?[rel]:[];
 });
}
const files=enumerate(assetDir);
if(files.length<40)throw Error(`Team assets missing: only ${files.length} images found`);
const teamAssignments=[];
const miniAssets={};
for(const file of files){
 // Source pose strips and replaced 12-frame sheets remain in the repo for rebuilding,
 // but should not bloat the standalone HTML downloaded on Android.
 if(file.startsWith('minigame/squat_duo_source/')||
    file==='locker/pink.jpg'||
    file==='audio-v18/engine.ogg'||
    file==='audio-v18/jump.ogg'||
    file==='hud-v17/hud-atlas.png'||
    (file.startsWith('schedule-v17/')&&file.endsWith('.png'))||
    ['minigame/squat_home/squat_front_sheet_1650x912.webp',
     'minigame/squat_home/squat_back_sheet_1650x912.webp',
     'minigame/batting_police/standby.png',
     'minigame/batting_police/flight.png'].includes(file))continue;
 const mime=file.endsWith('.png')?'image/png':file.endsWith('.jpg')?'image/jpeg':file.endsWith('.ogg')?'audio/ogg':'image/webp';
 const bytes=fs.readFileSync(path.join(assetDir,file));
 if(bytes.length<100)throw Error(`Empty or damaged sprite: ${file}`);
 const src=`data:${mime};base64,${bytes.toString('base64')}`;
 if(file.startsWith('minigame/')){miniAssets[file]=src;continue;}
 if(file==='screens/training.webp')miniAssets[file]=src;
 // Replace JS Image loaders and the seven portrait <img> tags on the start card.
 const jsMarker=`'${file}'`,htmlMarker=`"assets/${file}"`;
 if(file.startsWith('teams/')){
  const m=file.match(/^teams\/GAIA-JET-([A-Z]+)-0[123]-(front|move|attack)\.webp$/);
  if(!m)throw Error(`Invalid team sprite: ${file}`);
  teamAssignments.push(`assetFiles['${m[1]}_${m[2]}']='${src}';`);
 }else if(!html.includes(jsMarker)&&!html.includes(htmlMarker))throw Error(`Not referenced in game: ${file}`);
 html=html.replaceAll(jsMarker,`'${src}'`).replaceAll(htmlMarker,`"${src}"`);
}
html=html.replace('const themes=[',teamAssignments.join('\n')+'\nconst themes=[');
const battingDoc=fs.readFileSync(path.join(assetDir,'minigame/batting_police/game.html'),'utf8');
const insert=`<script>window.GAIA={};window.MINI_ASSETS=${JSON.stringify(miniAssets)};window.GAIA_DOC={batting:${JSON.stringify(battingDoc)}};</script>`;
html=html.replace('<script>window.GAIA={};</script>',insert.replace(/</g,'\\u003c').replace(/^\\u003cscript>/,'<script>').replace(/\\u003c\/script>$/,'</script>'));
for(const name of ['minigame.js','minigame_squat.js','minigame_batting.js']){
 const script=fs.readFileSync(path.join(dir,name),'utf8');
 html=html.replace(`<script src="${name}"></script>`,`<script>${script}</script>`);
}
fs.writeFileSync(output, html);
console.log(`Created ${output}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
