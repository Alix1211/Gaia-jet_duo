// Mechanically embeds all optimized game assets, including seven 3-frame team sheets.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, 'index.html');
const output = path.join(path.dirname(dir), 'GAIA-JET-DUO-v15.3-SPEED-FEEL.html');
let html = fs.readFileSync(src, 'utf8');
if (!html.includes("const ASSET_ROOT='assets/';")) throw Error('Missing asset-root marker');
html = html.replace("const ASSET_ROOT='assets/';", "const ASSET_ROOT='';");
const assetDir=path.join(dir,'assets');
function enumerate(folder,relative=''){
 return fs.readdirSync(folder,{withFileTypes:true}).flatMap(ent=>{
  const rel=path.posix.join(relative,ent.name);
  return ent.isDirectory()?enumerate(path.join(folder,ent.name),rel):/\.(webp|png)$/i.test(ent.name)?[rel]:[];
 });
}
const files=enumerate(assetDir);
if(files.length<40)throw Error(`Team assets missing: only ${files.length} images found`);
const teamAssignments=[];
for(const file of files){
 const mime=file.endsWith('.png')?'image/png':'image/webp';
 const bytes=fs.readFileSync(path.join(assetDir,file));
 if(bytes.length<100)throw Error(`Empty or damaged sprite: ${file}`);
 const src=`data:${mime};base64,${bytes.toString('base64')}`;
 // Replace JS Image loaders and the seven portrait <img> tags on the start card.
 const jsMarker=`'${file}'`,htmlMarker=`"assets/${file}"`;
 if(file.startsWith('teams/')){
  const m=file.match(/^teams\/GAIA-JET-([A-Z]+)-0[123]-(front|move|attack)\.webp$/);
  if(!m)throw Error(`Invalid team sprite: ${file}`);
  teamAssignments.push(`assetFiles['${m[1]}_${m[2]}']='${src}';`);
 }else if(!html.includes(jsMarker))throw Error(`Not referenced in game: ${file}`);
 html=html.replaceAll(jsMarker,`'${src}'`).replaceAll(htmlMarker,`"${src}"`);
}
html=html.replace('const themes=[',teamAssignments.join('\n')+'\nconst themes=[');
fs.writeFileSync(output, html);
console.log(`Created ${output}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
