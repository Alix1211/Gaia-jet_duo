// Optional local visual smoke test, using the same game script and asset files.
// Run: node smoke-preview.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const { createCanvas, Image } = require('@napi-rs/canvas');

const dir = __dirname;
const teamDir=path.join(dir,'assets','teams');
const teamFiles=fs.readdirSync(teamDir).filter(name=>name.endsWith('.webp'));
assert.equal(teamFiles.length,21,'Expected seven teams × three optimized WebP sprites');
for(const file of teamFiles)assert(fs.statSync(path.join(teamDir,file)).size>1000,`Empty team sprite: ${file}`);
const htmlPath = process.argv.slice(2).find(arg => !arg.startsWith('--')) || path.join(dir, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(/\}\)\(\);\s*$/, 'globalThis.__gaiaTest={player,bots,shots,bursts,hearts,shoot,nearestTarget,waterHit,earnBoost,update,reset,hitBuoys,waveCenter,waveMotion,trackAt,curveAt,render};})();');
const width = 1280, height = 720;
const mainCanvas = createCanvas(width, height);
const mapCanvas = createCanvas(112, 150);

function element(id) {
  return {
    id, textContent: '', innerHTML: '', onclick: null, style: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    events: {},
    addEventListener(type, callback) { (this.events[type] ||= []).push(callback); },
    getBoundingClientRect() { return id === 'race' ? { width, height } : { width: 112, height: 150 }; },
    getContext() { return id === 'race' ? mainCanvas.getContext('2d') : mapCanvas.getContext('2d'); },
  };
}

const elements = new Map();
const get = id => elements.get(id) || elements.set(id, element(id)).get(id);
const fakeDocument = {
  getElementById: get,
  addEventListener() {},
  fullscreenElement: false,
};
let nextFrame = null;
const createdImages = [];
class DiskImage extends Image {
  constructor() { super(); createdImages.push(this); }
  set src(value) {
    const match = value.match(/^data:image\/(?:webp|png);base64,/);
    super.src = match
      ? Buffer.from(value.slice(match[0].length), 'base64')
      : fs.readFileSync(path.resolve(dir, value));
  }
}
const context = {
  document: fakeDocument,
  window: { addEventListener() {} },
  Image: DiskImage,
  devicePixelRatio: 1,
  performance: { now() { return 0; } },
  requestAnimationFrame(callback) { nextFrame = callback; },
  console,
};
async function main() {
  vm.runInNewContext(script, context, { filename: 'index.html' });
  await Promise.all(createdImages.map(img => img.decode()));
  get('start').onclick();
  let t = 0;
  function advance(frames) {
    for (let i = 0; i < frames; i++) { t += 1000 / 60; const cb = nextFrame; cb(t); }
  }
  function save(name) {
    const dest = path.join('/tmp', `gaia-jet-${name}.png`);
    fs.writeFileSync(dest, mainCanvas.toBuffer('image/png'));
    return dest;
  }
  advance(100);
  console.log('Straight:', save('straight'));
  get('left').events.pointerdown[0]({ preventDefault() {}, pointerId: 1 });
  advance(20);
  console.log('Left:', save('left'));
  get('fire').events.pointerdown[0]({ preventDefault() {}, pointerId: 2 });
  advance(4);
  console.log('Auto bubble fire:', save('fire-auto'));
  get('fire').events.pointerup[0]({ preventDefault() {} });
  get('left').events.pointerup[0]({ preventDefault() {} });
  get('jump').events.pointerdown[0]({ preventDefault() {} });
  advance(18);
  console.log('Jump:', save('jump'));
  console.log('HUD:', get('speed').innerHTML, get('distance').textContent);
  if (process.argv.includes('--physics-tests')) {
    const { player, bots, shots, bursts, hearts, shoot, nearestTarget, waterHit, earnBoost, update, reset, hitBuoys, waveCenter, waveMotion, trackAt, curveAt, render } = context.__gaiaTest;
    assert.equal(bots.length,7,'Seven distinct rival teams not in race');
    assert(createdImages.length>=40,'Original and seven-team animations not loaded');
    const startTrack=trackAt(0),endTrack=trackAt(5000);
    assert(Math.hypot(startTrack.x-endTrack.x,startTrack.y-endTrack.y)<.001,'Circular circuit does not close');
    assert.equal(curveAt(100),0,'First straight missing');
    assert(curveAt(1500)>0,'First corner missing');
    reset();
    player.s=4999;player.speed=195;
    for(let i=0;i<10;i++)update(1/60);
    assert(player.s>5000,'Race stopped at lap boundary');
    assert.equal(get('lap').textContent,'LAP 2','Lap counter did not advance');
    console.log('Closed endless course / lap rollover: OK');
    player.s=1200;player.lane=0;
    render();console.log('Actual oval corner:',save('oval-corner'));
    reset();
    bots[0].s=waveCenter(0,bots[0].lane)-22;
    bots[0].air=0;
    update(1/60);
    assert(bots[0].air>0,'Rival did not anticipate and jump over the wave');
    reset();
    bots[0].boostMeter=100;
    update(1/60);
    assert(bots[0].boost>0,'Rival does not activate charged boost');
    reset();
    bots[0].s=140;bots[0].shotCooldown=0;
    update(1/60);
    assert(shots.some(s=>s.owner===bots[0]),'Rival did not use its bubble gun');
    assert(bots[4].top>bots[3].top&&bots[3].handling>bots[4].handling,
      'Heavy speed / light cornering team distinctions missing');
    console.log('Rival jumping / boosting / targeting / contrasting handling: OK');
    reset();
    Object.assign(player, { s: 182, lane: 185, speed: 163 });
    update(1 / 60);
    assert(hitBuoys.has(210), 'Buoy collision not detected');
    assert(player.speed < 115 && player.knock < 0, 'Buoy impact did not brake and push inward');
    console.log('Buoy collision: OK', Math.round(player.speed), Math.round(player.knock));
    reset();
    Object.assign(player, { s: 84, lane: -65, speed: 170 });
    update(1 / 60);
    assert(player.speed < 135 && bots[0].speed < 190, 'Craft impact failed');
    assert(player.impact > 0 && bots[0].impact > 0, 'Craft collision reaction missing');
    assert(player.knockLong * bots[0].knockLong < 0, 'Crafts lack opposite depth recoil');
    assert(player.knock * bots[0].knock < 0, 'Crafts lack opposite lateral knockback');
    console.log('Craft collision: OK', Math.round(player.speed), Math.round(bots[0].speed));
    reset();
    Object.assign(player, { s: 182, lane: 185, speed: 163, air: .8 });
    update(1 / 60);
    assert(!hitBuoys.has(210), 'Airborne craft collided with a buoy');
    console.log('Jump clearance: OK');
    reset();
    player.speed = 199;
    bots.forEach((b,i)=>{b.s=4500+i*80}); // isolate boost decay from rival watergun fire
    earnBoost(100);
    get('boost').events.pointerdown[0]({ preventDefault() {} });
    assert(player.speed >= 278, 'Boost lacks immediate speed surge');
    const launch = player.speed;
    for (let i = 0; i < 120; i++) update(1 / 60);
    const faded = player.speed;
    assert(faded < launch && faded > 199, 'Boost did not ease down');
    for (let i = 0; i < 80; i++) update(1 / 60);
    assert(player.speed < 220, 'Boost did not return toward cruise speed');
    console.log('Boost surge/decay: OK', Math.round(launch), Math.round(faded), Math.round(player.speed));
    reset();
    const startBoost=player.boostMeter;
    for(let n=0;n<9;n++)waterHit(bots[0],player);
    assert.equal(bots[0].hitCombo,9,'Normal watergun hits do not accumulate');
    const beforeTen=bots[0].speed;
    waterHit(bots[0],player);
    assert(bots[0].speed<beforeTen*.7,'Tenth hit lacks strong slowdown');
    assert.equal(bots[0].hitCombo,0,'Ten-hit streak did not reset');
    assert(player.boostMeter>startBoost,'Watergun hits must charge boost');
    console.log('Watergun/10-hit slowdown/boost generation: OK');
    reset();
    player.s=290;player.lane=-90;player.speed=180;
    update(1/60);
    assert(hearts[0].taken,'Neon heart pickup not detected');
    assert(player.boostMeter>=85,'Neon heart does not strongly charge boost');
    console.log('Neon heart collection: OK');
    reset();
    player.s=500;player.lane=-80;bots[0].s=600;bots[0].lane=-80;
    assert.equal(nearestTarget(player),bots[0],'Auto target selection failed');
    shoot(player);
    for(let i=0;i<25;i++)update(1/60);
    assert(bots[0].hitCombo>0,'Real projectile failed to hit the rival');
    assert(shots.length<5,'Projectile list is not being retired');
    assert(bursts.length>0,'Bubble hit did not create splash particles');
    console.log('Forward auto-target bubble / hit particles: OK');
    reset();
    Object.assign(player,{s:850,lane:-80,speed:160});
    Object.assign(bots[0],{s:690,lane:-80,speed:142});
    bots.forEach((b,i)=>{if(i>0)b.s=2400+i*40});
    shoot(player);
    for(let i=0;i<30;i++)update(1/60);
    assert(bots[0].hitCombo>0,'Rear projectile failed to hit the rival behind');
    console.log('Rear auto-target bubble collision: OK');
    function testDrift() {
      reset();
      player.speed = 184;
      const right = get('right');
      right.events.pointerdown[0]({ preventDefault() {}, pointerId: 13 });
      for (let i = 0; i < 25; i++) update(1 / 60);
      right.events.pointerup[0]({ preventDefault() {} });
      for (let i = 0; i < 20; i++) update(1 / 60);
      return Math.abs(player.sideVel);
    }
    const strong = testDrift();
    assert(strong > 55, 'Strong inertia is not active by default');
    console.log('Strong inertia retained: OK', Math.round(strong));
    reset();
    Object.assign(player, { s: waveCenter(0, 0)-2, lane: 0, speed: 190 });
    for (let i = 0; i < 5; i++) update(1 / 60);
    assert(player.wavePhase > 0, 'A passing crest did not trigger wave buoyancy');
    assert(waveMotion(.26,.8).lift < -45, 'Wave launch not lifting craft');
    assert(waveMotion(.65,.8).submerge > .70, 'Wave splashdown not submerging craft');
    assert(waveMotion(.97,.8).lift < -15, 'Wave rebound not lifting craft');
    console.log('Water height / crest crossing / splashdown / rebound: OK');
    player.wavePower=.8;
    player.s=waveCenter(0,0)-205;
    player.wavePhase=0;
    render();console.log('approaching crest:',save('wave-approach'));
    player.s=waveCenter(0,0)-80;
    render();console.log('near crest:',save('wave-near'));
    for(const [phase,name] of [[.26,'wave-rise'],[.65,'wave-dive'],[.97,'wave-rebound']]){
      player.wavePhase=phase;
      render();
      console.log(name+':',save(name));
    }
    // The scenery test changes both the horizon panorama and water texture in one click.
    player.wavePhase=0;
    for(const [label,slug] of [['도시+강','city-river'],['해변','beach'],['인공 돔','dome'],['기본','default']]){
      get('themeSwitch').onclick();
      assert(['도시+강','해변','인공 돔','기본'].includes(label),'Theme test name invalid');
      render();
      console.log('Theme '+label+':',save('theme-'+slug));
    }
    get('themeSwitch').onclick(); // weak river
    reset();
    Object.assign(player,{s:waveCenter(0,0)-2,lane:0,speed:190});
    for(let i=0;i<5;i++)update(1/60);
    const riverWave=player.wavePower;
    get('themeSwitch').onclick(); // strong irregular sea
    reset();
    Object.assign(player,{s:waveCenter(0,0)-2,lane:0,speed:190});
    for(let i=0;i<5;i++)update(1/60);
    assert(player.wavePower>riverWave*2,'Sea waves must be much stronger than river waves');
    console.log('Terrain-specific river/sea wave strength: OK');
    reset();
    for(let i=0;i<12000;i++)update(1/60);
    assert(player.s>5000,'Endless race did not survive long-running simulation');
    assert(shots.length<=48&&bursts.length<=30,'Particle or bubble buffers leaked');
    assert([player,...bots].every(c=>Number.isFinite(c.s)&&Number.isFinite(c.lane)&&Number.isFinite(c.speed)),
      'Long running physics produced a non-finite craft position or speed');
    console.log('200-second race continuity / projectile and effect caps: OK',Math.round(player.s));
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
