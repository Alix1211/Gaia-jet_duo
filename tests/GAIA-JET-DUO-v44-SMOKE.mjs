// V44 offline mechanics, stage configuration, drift and binary-asset regression tests.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
const html=read('../app/src/main/assets/GAIA-JET-DUO-v44-STABLE-ANDROID.html');
const mainStart=html.indexOf('<script>\n',html.indexOf('<script>window.GAIA_V36_ASSETS'));
const mainEnd=html.indexOf('</script>',mainStart);
assert(mainStart>0&&mainEnd>mainStart,'Main JS exists');
const main=html.slice(mainStart+8,mainEnd);
new vm.Script(main);

const defs={};
const context=vm.createContext({
 window:{GAIA:{minigame:{register:(name,def)=>defs[name]=def,layout:{}}},MINI_ASSETS:{}},
 console,Math,Number,String,Array,Object,JSON,
});
for(const label of ['미니게임 공통','GAIA JET DUO 스쿼트','컨베이어 배팅','GAIA JET DUO v38:']){
 const start=html.indexOf('<script>// '+label),end=html.indexOf('</script>',start);
 assert(start>=0&&end>start,label+' exists');
 const src=html.slice(start+8,end);
 new vm.Script(src);
 if(label!=='미니게임 공통')vm.runInContext(src,context,{timeout:1500});
}
for(const name of ['squat','batting','charm'])assert(defs[name],name+' registered');
for(let tier=1;tier<=5;tier++){
 assert.equal(defs.squat.cfg({tier}).squat.difficulty,tier);
 assert.equal(defs.batting.cfg({tier}).difficulty,tier);
 assert.equal(defs.charm.cfg({tier}).tier,tier);
 assert.equal(defs.charm.cfg({tier}).dual,tier>=2);
}
assert(defs.charm.doc.includes('renderGymBall'),'Gym ball is painted by canvas');
assert(defs.charm.doc.includes('isGymBall(performance.now())'),'Downward strokes are penalized while gym ball exists');
assert(defs.charm.doc.includes('p.charge=Math.max(0,p.charge-'),'Gym ball subtracts charge');
for(const name of ['squat','charm']){
 const code=[...defs[name].doc.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 assert(code.length>0,name+' iframe script exists');
 for(const js of code)new vm.Script(js.replace('/*LIFE_CONFIG*/','{}'));
}

// The batting game is embedded within the single-file HTML as JSON text.
const giantLine=html.split('\n').find(line=>line.startsWith('<script>window.GAIA={};window.MINI_ASSETS='));
assert(giantLine,'Embedded batting assets and document');
const battingMarker='window.GAIA_DOC={batting:';
const begin=giantLine.indexOf(battingMarker);
assert(begin>=0,'Embedded batting source');
const jsonStart=begin+battingMarker.length;
const jsonEnd=giantLine.lastIndexOf('};');
const originalBatting=JSON.parse(giantLine.slice(jsonStart,jsonEnd));
const updatedBatting=defs.batting.transformDoc(originalBatting);
assert(updatedBatting.includes('5:{speed:387,window:.09,amplitude:58,goal:400}'),'5 batting levels');
assert(updatedBatting.includes('[1,2,3,4,5].includes(+CFG.difficulty)'),'Batting accepts levels 4 and 5');
for(const match of updatedBatting.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1].replace('/*LIFE_CONFIG*/','{}'));

const leagueStart=main.indexOf('const CITY_RIVALS=');
const leagueEnd=main.indexOf('function isTrackUnlocked(',leagueStart);
assert(leagueStart>=0&&leagueEnd>leagueStart);
const leagueCode=main.slice(leagueStart,leagueEnd);
const story=()=>({cityDone:true,championship:null});
function playTournament(results){
 const ctx=vm.createContext({progress:{story:story()},TEAM_DEFS:[
  {id:'ROYAL',top:214,skill:.91},{id:'NOIR',top:218,skill:.96},{id:'RED',top:222,skill:.86},
  {id:'PINK',top:192,skill:.94},{id:'LEATHER',top:226,skill:.87},{id:'KPOP',top:205,skill:.97},{id:'DUMMY',top:183,skill:.78}],saveProgress:()=>{},Math,Number,String,Array});
 vm.runInContext(leagueCode+';globalThis.api={nextChampionMatch,completeChampionMatch,championState,championshipStandings,cityRival};',ctx);
 for(const [index,won] of results.entries()){
  const game=ctx.api.nextChampionMatch();assert(game,'Round '+index+' available');
  ctx.api.completeChampionMatch(won);
 }
 return ctx.api;
}
const champions=playTournament([true,true,true,true,true]);
assert.equal(champions.championState().phase,'champion','3 groups, 4강, 결승 end in championship');
assert.equal(champions.championState().results.length,12,'8 teams each play three group matches');
assert.deepEqual(Array.from({length:6},(_,i)=>champions.cityRival(String(i+1).padStart(2,'0'))),
 ['ROYAL','PINK','KPOP','RED','NOIR','LEATHER'],'Six different Riverside rivals');
const eliminated=playTournament([false,false,false]);
assert.equal(eliminated.championState().phase,'eliminated','Losing group eliminates player');
assert.equal(playTournament([true,true,true]).nextChampionMatch().trackId,'10','Group winner reaches semifinal');
assert(main.includes('if(raceConfig.id===\'city\'&&place===1)'),'Riverside unlock requires first place');
assert(main.includes('if(raceConfig.id===\'practice\'&&place===1)'),'Practice unlock requires first place');
const ticketCheck=main.slice(main.indexOf('function grantsTrainingTickets('),main.indexOf('function finishRace(){'));
const checkCtx=vm.createContext({});
vm.runInContext(ticketCheck+';globalThis.grant=grantsTrainingTickets;',checkCtx);
assert.equal(checkCtx.grant('practice',true),true,'First qualifying race grants tickets even on loss');
assert.equal(checkCtx.grant('practice',false),false,'Free practice cannot farm tickets');
assert.equal(checkCtx.grant('city',false),true,'Riverside win or loss grants tickets');
assert.equal(checkCtx.grant('champion',false),true,'Championship win or loss grants tickets');
assert.equal(checkCtx.grant('coach',false),false,'Coach game does not grant tickets');
const raceFinish=main.slice(main.indexOf('function finishRace(){'),main.indexOf('function reset(){'));
assert(raceFinish.indexOf('const qualifyingAttempt=')<raceFinish.indexOf('progress.story.practiceDone=true'),'Qualifying status captured before unlock');
assert(raceFinish.includes('grantsTrainingTickets(raceConfig.id,qualifyingAttempt)'),'Every official race refreshes five tickets');
assert(main.includes('const DRIFT_ENTRY_SPEED=108')&&main.includes('DRIFT_ENTRY_STEER=.28'),'Drift activates with moderate braking plus steer');
assert(main.includes("gaiaHaptic('collision')")&&main.includes("gaiaHaptic('drift')"),'Android native vibration events emitted');
assert(main.includes('trainingTickets={health:1,naughty:1,obey:1,open:1,charm:1}'),'Five non-stacking attempts per league race');
assert(main.includes('progress.stats[stat]=Math.min(20'),'Training directly awards distinct stats');
assert(main.includes('canRetry:()=>false'),'Failure cannot instantly retry');
assert(main.includes('supportCostume(team,pose)'),'Support costume generated by code');
assert(!main.includes('NOIR WINS'),'No forced first championship loss');
assert(!main.includes('registerBuoyHit('),'No buoy obstacle regression');
assert(main.includes('finishGateArt'),'Finish banner preserved');
// Exercise the actual training launch / completion code with a fake UI and mini host.
const trainStart=main.indexOf('const TRAINING_STAT_IDS=');
const trainEnd=main.indexOf('function formatTime(',trainStart);
assert(trainStart>0&&trainEnd>trainStart);
let currentMini;
const trainingProgress={stats:{health:1,naughty:1,open:1,obey:1,charm:1},story:{
 trainingTickets:{health:1,naughty:1,open:1,obey:1,charm:1},trainingStages:{squat:1,batting:1,charm:1},bestSquat:0}};
const elem={classList:{add:()=>{}},style:{}};
const trainingVm=vm.createContext({progress:trainingProgress,STAT_INFO:[],Math,Number,String,Array,
 window:{GAIA:{minigame:{play:(kind,opts)=>{currentMini={kind,opts}}}}},
 document:{fullscreenElement:true,getElementById:()=>elem},
 saveProgress:()=>{},applyStats:()=>{},setBGM:()=>{},storyBlocks:(blocks,go)=>go(),
 dialogueGroup:()=>[],showStory:()=>{},hideDialogueQuotes:()=>{},openPanel:()=>{}});
vm.runInContext(main.slice(trainStart,trainEnd)+';globalThis.training={launchTrainingMini,trainingTicketsLeft};',trainingVm);
assert.equal(trainingVm.training.trainingTicketsLeft('squat'),2);
trainingVm.training.launchTrainingMini('squat',1,'health');
assert.equal(trainingProgress.story.trainingTickets.health,0,'Attempt spent upon launch');
assert.equal(currentMini.opts.canRetry(),false,'No second attempt within iframe');
currentMini.opts.onResult({success:true,score:100});
assert.equal(trainingProgress.stats.health,1.2,'Tier1 awards +0.2 health');
assert.equal(trainingProgress.story.trainingStages.squat,2,'Winning tier1 unlocks tier2');
trainingVm.training.launchTrainingMini('squat',2,'naughty');
currentMini.opts.onResult({success:false});
assert.equal(trainingProgress.stats.naughty,1,'Failed training awards nothing');
assert.equal(trainingProgress.story.trainingTickets.naughty,0,'Failed attempt consumed');
assert.equal(trainingProgress.story.trainingStages.squat,2,'Failure never unlocks a new tier');
trainingVm.training.launchTrainingMini('charm',1,'charm');
currentMini.opts.onResult({success:true});
assert.equal(trainingProgress.stats.charm,1.2,'Charm minigame awards charm');
assert.equal(trainingVm.training.trainingTicketsLeft('squat'),0,'Each stat only once per league race');
const fingerprint=s=>{
 const hash=crypto.createHash('sha256');let count=0;
 const re=/data:(?:image|audio)\/[^\s;'"`]+;base64,[A-Za-z0-9+/=]+/g;
 let m;while((m=re.exec(s))) {hash.update(m[0]);count++;}
 return [count,hash.digest('hex')];
};
assert.deepEqual(fingerprint(html),[246,'0e540ec7a455114ca6e00cae04544f59d13116d63fd8182e516acd457186255d'],'All V42 embedded images and audio intact');
console.log('PASS V44: scripts, 5-stage minigames, gym-ball, championship, qualifier tickets, drift, Android events, original assets');
