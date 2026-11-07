// Optional local visual smoke test, using the same game script and asset files.
// Run: node smoke-preview.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const { createCanvas, Image } = require('@napi-rs/canvas');

const dir = __dirname;
const htmlPath = process.argv.slice(2).find(arg => !arg.startsWith('--')) || path.join(dir, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(/\}\)\(\);\s*$/, 'globalThis.__gaiaTest={player,bots,update,reset,hitBuoys,waveCenter,waveMotion,render};})();');
const width = 1280, height = 720;
const mainCanvas = createCanvas(width, height);
const mapCanvas = createCanvas(112, 150);

function element(id) {
  return {
    id, textContent: '', innerHTML: '', onclick: null,
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
  get('fireFront').events.pointerdown[0]({ preventDefault() {}, pointerId: 2 });
  advance(4);
  console.log('Front fire:', save('fire-front'));
  get('fireFront').events.pointerup[0]({ preventDefault() {} });
  get('fireRear').events.pointerdown[0]({ preventDefault() {}, pointerId: 3 });
  advance(4);
  console.log('Rear fire:', save('fire-rear'));
  get('fireRear').events.pointerup[0]({ preventDefault() {} });
  get('left').events.pointerup[0]({ preventDefault() {} });
  get('jump').events.pointerdown[0]({ preventDefault() {} });
  advance(18);
  console.log('Jump:', save('jump'));
  console.log('HUD:', get('speed').innerHTML, get('distance').textContent);
  if (process.argv.includes('--physics-tests')) {
    const { player, bots, update, reset, hitBuoys, waveCenter, waveMotion, render } = context.__gaiaTest;
    reset();
    Object.assign(player, { s: 182, lane: 185, speed: 163 });
    update(1 / 60);
    assert(hitBuoys.has(210), 'Buoy collision not detected');
    assert(player.speed < 115 && player.knock < 0, 'Buoy impact did not brake and push inward');
    console.log('Buoy collision: OK', Math.round(player.speed), Math.round(player.knock));
    reset();
    Object.assign(player, { s: 598, lane: -80, speed: 170 });
    update(1 / 60);
    assert(player.speed < 135 && bots[0].speed < 131, 'Craft impact failed');
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
    player.speed = 184;
    get('boost').events.pointerdown[0]({ preventDefault() {} });
    assert(player.speed >= 315, 'Boost lacks immediate speed surge');
    const launch = player.speed;
    for (let i = 0; i < 120; i++) update(1 / 60);
    const faded = player.speed;
    assert(faded < launch && faded > 184, 'Boost did not ease down');
    for (let i = 0; i < 80; i++) update(1 / 60);
    assert(player.speed < 210, 'Boost did not return toward cruise speed');
    console.log('Boost surge/decay: OK', Math.round(launch), Math.round(faded), Math.round(player.speed));
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
    assert(strong > 85, 'Strong inertia is not active by default');
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
    player.s=295;
    player.wavePhase=0;
    render();console.log('approaching crest:',save('wave-approach'));
    player.s=420;
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
      assert(get('themeSwitch').textContent.includes(label),`Theme button did not switch to ${label}`);
      render();
      console.log('Theme '+label+':',save('theme-'+slug));
    }
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
