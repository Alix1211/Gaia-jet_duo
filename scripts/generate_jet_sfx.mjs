// Deterministic original arcade sound effects for GAIA JET DUO.
// Outputs three mono 48kHz PCM WAV masters; bundle uses the OGG versions.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'assets', 'audio-v19');
const RATE = 48000;
fs.mkdirSync(dest, { recursive: true });
let seed = 20261108;
function rand() { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; }
function wav(name, seconds, synth) {
  const count = Math.round(seconds * RATE), samples = Buffer.alloc(count * 2);
  let phase = 0, noiseLP = 0;
  for (let i = 0; i < count; i++) {
    const t = i / RATE, n = rand();
    noiseLP = noiseLP * .76 + n * .24;
    const [frequency, tone, hiss] = synth(t, seconds);
    phase += 2 * Math.PI * frequency / RATE;
    const value = Math.tanh(tone * Math.sin(phase) + hiss * noiseLP) * .82;
    samples.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), i * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + samples.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22); h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(samples.length, 40);
  fs.writeFileSync(path.join(dest, name + '.wav'), Buffer.concat([h, samples]));
}

// Weighty hull-to-hull thud: a quick noisy impact followed by low bass decay.
wav('craft-thud', .46, t => {
  const attack = Math.min(1, t / .003), fall = Math.exp(-11 * t);
  return [55 + 100 * Math.exp(-13 * t), attack * fall * 1.05, Math.exp(-50 * t) * .65];
});
// Soft, springy plastic buoy 'toong': resonant pitch bend rather than heavy bass.
wav('buoy-toong', .43, t => {
  const attack = Math.min(1, t / .006), fall = Math.exp(-8 * t);
  const f = 205 + 310 * Math.exp(-18 * t) + 35 * Math.exp(-11 * t) * Math.sin(2 * Math.PI * 19 * t);
  return [f, attack * fall * .85, Math.exp(-67 * t) * .14];
});
// Cartoon water-gun 'pyong': short high-to-low electronic chirp with a splash click.
wav('watergun-pyong', .21, t => {
  const attack = Math.min(1, t / .005), fall = Math.exp(-17 * t);
  return [320 + 980 * Math.exp(-16 * t), attack * fall * .8, Math.exp(-70 * t) * .26];
});
console.log('Created 3 WAV masters in ' + dest);
