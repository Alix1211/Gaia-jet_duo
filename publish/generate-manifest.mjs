// Print a complete update.json manifest; upload output and the HTML to one HTTPS host.
// Usage: node publish/generate-manifest.mjs app/src/main/assets/your-next.html https://host/your-next.html 45
import fs from 'node:fs';
import crypto from 'node:crypto';

const [filename,url,versionArg]=process.argv.slice(2);
const version=Number(versionArg);
if(!filename||!url?.startsWith('https://')||!Number.isInteger(version)||version<=44){
 console.error('Usage: node publish/generate-manifest.mjs FILE.html https://HOST/FILE.html VERSION_ABOVE_44');
 process.exit(1);
}
const bytes=fs.readFileSync(filename);
const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
process.stdout.write(JSON.stringify({version,url,sha256},null,2)+'\n');
