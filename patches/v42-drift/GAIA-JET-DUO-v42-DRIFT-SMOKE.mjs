// GAIA JET DUO V42 — offline drift mechanics and V41 regression smoke checks.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const v41=fs.readFileSync(new URL('./GAIA-JET-DUO-v41-FINISH-NOBUOY.html',import.meta.url),'utf8');
const v42=fs.readFileSync(new URL('./GAIA-JET-DUO-v42-DRIFT-TEST.html',import.meta.url),'utf8');
const mainStart=v42.indexOf('<script>\n',v42.indexOf('<script>window.GAIA_V36_ASSETS'));
const mainEnd=v42.indexOf('</script>',mainStart);
assert(mainStart>=0&&mainEnd>mainStart,'Main script boundaries');
const main=v42.slice(mainStart+8,mainEnd);
new vm.Script(main);

for(const needle of ['<script>// 미니게임 공통','<script>// GAIA JET DUO 스쿼트','<script>// 컨베이어 배팅','<script>// GAIA JET DUO v38:']){
 const start=v42.indexOf(needle),end=v42.indexOf('</script>',start);
 assert(start>=0&&end>start,`Mini-game script: ${needle}`);
 new vm.Script(v42.slice(start+8,end));
}

function extractFunction(name){
 const start=main.indexOf(`function ${name}(`);
 assert(start>=0,`${name} exists`);
 const begin=main.indexOf('{',start);let depth=0;
 for(let i=begin;i<main.length;i++){
  if(main[i]==='{')depth++;
  else if(main[i]==='}'&&!--depth)return main.slice(start,i+1);
 }
 throw Error(`Unclosed ${name}`);
}
const player={speed:200,air:0,hitCooldown:0,sideVel:0,driftTime:0,driftCooldown:0,driftDir:0,driftBlend:0};
const keys={brake:false};
const sandbox={Math,Number,player,keys,DRIFT_ENTRY_SPEED:145,DRIFT_EXIT_SPEED:102,DRIFT_ENTRY_STEER:.68,DRIFT_HOLD_STEER:.25};
vm.createContext(sandbox);
vm.runInContext(extractFunction('stepPlayerDrift'),sandbox);
const step=(dt,steer)=>sandbox.stepPlayerDrift(dt,steer);
assert.equal(step(.016,1),false,'No drift without brake');
keys.brake=true;player.speed=110;
assert.equal(step(.016,1),false,'No low-speed drift');
player.speed=200;
assert.equal(step(.016,.5),false,'No drift on gentle steering');
const before=player.sideVel;
assert.equal(step(.016,1),true,'Fast brake + sharp steering enters drift');
assert(player.sideVel>before,'Drift adds lateral momentum');
const firstTime=player.driftTime;
keys.brake=false;
assert.equal(step(.1,.8),true,'Drift sustains while steering after brake release');
assert(player.driftTime<firstTime,'Drift lifetime is finite');
assert.equal(step(.02,-.8),false,'Countersteer cancels active drift');
keys.brake=true;
assert.equal(step(.016,1),false,'Drift cannot instantly retrigger during cooldown');
player.driftCooldown=0;player.speed=180;
assert.equal(step(.016,-1),true,'Drift can start in the opposite direction');
assert(player.driftDir<0,'Drift direction tracks steering');
player.air=.5;
assert.equal(step(.016,-1),false,'Drift cancels in the air');

const fingerPrint=s=>{
 const hash=crypto.createHash('sha256');let count=0;
 const pattern=/data:(?:image|audio)\/[^\s;'"`]+;base64,[A-Za-z0-9+/=]+/g;
 let m;while((m=pattern.exec(s))!==null){hash.update(m[0]);count++}
 return [count,hash.digest('hex')];
};
assert.deepEqual(fingerPrint(v42),fingerPrint(v41),'Every embedded image/audio asset preserved');
assert(!main.includes('jetExhaustFx'),'Flames deferred until road testing');
assert(!main.includes('registerBuoyHit('),'No buoy-as-obstacle regression');
assert(main.includes('finishGateArt'),'V41 finish gate preserved');
assert(main.includes('SAVE_KEY=\'gaia-jet-duo-progress-v40-balance-sandbox\''),'V41 save key preserved');
console.log('PASS V42: drift entry/exit/cooldown/air/countersteer; scripts parse; assets/finish/save preserved; no flame effects');
