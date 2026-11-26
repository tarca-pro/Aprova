#!/usr/bin/env node
/**
 * Gera props.json a partir do clipe, música, narração e roteiro.
 *
 *   node scripts/prepare.mjs --clip clipe.mp4 --music musica.mp3 \
 *        [--narration narracao.mp3] [--script roteiro.txt | --text "o que esse homem fez..."] \
 *        [--style clean|comic] [--handle @seucanal] [--out props.json]
 *
 * - Copia as mídias para public/input/
 * - Detecta cortes de cena no clipe (ffmpeg) e coloca transições nesses pontos
 * - Distribui as palavras do roteiro no tempo:
 *     com narração → dentro dos trechos de fala (detecção de silêncio), proporcional ao tamanho da palavra
 *     sem narração → ~3,4 palavras/s (ritmo medido nas referências)
 */
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
    return acc;
  }, []),
);
if (!args.clip) {
  console.error('Uso: node scripts/prepare.mjs --clip clipe.mp4 --music musica.mp3 [--narration n.mp3] [--script roteiro.txt] [--style clean|comic] [--handle @canal]');
  process.exit(1);
}

const style = args.style === 'comic' ? 'comic' : 'clean';
const inDir = path.join(root, 'public', 'input');
fs.mkdirSync(inDir, {recursive: true});
const copyIn = (p, name) => {
  if (!p) return undefined;
  const dest = path.join(inDir, name + path.extname(p).toLowerCase());
  fs.copyFileSync(path.resolve(p), dest);
  return `input/${path.basename(dest)}`;
};

const ffprobeDur = (p) =>
  parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).toString());
// Roda ffmpeg e devolve o stderr (onde saem showinfo/silencedetect)
const require_spawn = (cmd, a) => {
  const r = spawnSync(cmd, a, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  return r.stderr || '';
};

const clip = copyIn(args.clip, 'clip');
const music = copyIn(args.music, 'music');
const narration = copyIn(args.narration, 'narration');
const clipStartFrom = parseFloat(args.start ?? '0');
const clipDur = ffprobeDur(path.join(root, 'public', clip)) - clipStartFrom;

// ---------- roteiro ----------
let text = args.text && args.text !== true ? args.text : '';
if (args.script) text = fs.readFileSync(path.resolve(args.script), 'utf8');
const tokens = text
  .replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .map((w) => w.replace(/^[^\p{L}\p{N}@#]+|[^\p{L}\p{N}%]+$/gu, ''))
  .filter(Boolean);
const weight = (w) => w.length + 2;

let words = [];
let duration;
if (tokens.length && narration) {
  const narrPath = path.join(root, 'public', narration);
  const narrDur = ffprobeDur(narrPath);
  const log = require_spawn('ffmpeg', ['-hide_banner', '-i', narrPath, '-af', 'silencedetect=noise=-35dB:d=0.12', '-f', 'null', '-']);
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  // trechos de fala = complemento dos silêncios
  const segs = [];
  let cur = 0;
  starts.forEach((s, i) => {
    if (s - cur > 0.05) segs.push([cur, s]);
    cur = ends[i] ?? narrDur;
  });
  if (narrDur - cur > 0.05) segs.push([cur, narrDur]);
  const speech = segs.reduce((a, [s, e]) => a + (e - s), 0);
  const totalW = tokens.reduce((a, w) => a + weight(w), 0);
  // mapeia "tempo de fala acumulado" -> tempo real
  const toReal = (x) => {
    let acc = 0;
    for (const [s, e] of segs) {
      if (x <= acc + (e - s)) return s + (x - acc);
      acc += e - s;
    }
    return narrDur;
  };
  let accW = 0;
  words = tokens.map((w) => {
    const a = toReal((accW / totalW) * speech);
    accW += weight(w);
    const b = toReal((accW / totalW) * speech);
    return {text: w, start: +a.toFixed(3), end: +b.toFixed(3)};
  });
  duration = narrDur + 0.4;
} else if (tokens.length) {
  const wps = parseFloat(args.wps ?? '3.4');
  const totalW = tokens.reduce((a, w) => a + weight(w), 0);
  const total = tokens.length / wps;
  let t = 0.05;
  words = tokens.map((w) => {
    const d = (weight(w) / totalW) * total;
    const o = {text: w, start: +t.toFixed(3), end: +(t + d).toFixed(3)};
    t += d;
    return o;
  });
  duration = t + 0.4;
} else {
  duration = clipDur;
}
// a legenda de cada palavra fica até a próxima entrar (sem buracos curtos)
for (let i = 0; i < words.length - 1; i++) {
  if (words[i + 1].start - words[i].end < 0.25) words[i].end = words[i + 1].start;
}
if (args.duration) duration = parseFloat(args.duration);
duration = +duration.toFixed(2);

// ---------- cortes de cena -> transições ----------
const sceneLog = require_spawn('ffmpeg', [
  '-hide_banner', '-ss', String(clipStartFrom), '-i', path.join(root, 'public', clip),
  '-vf', `select='gt(scene,${args.scene ?? 0.32})',showinfo`, '-an', '-f', 'null', '-',
]);
let cuts = [...sceneLog.matchAll(/pts_time:([\d.]+)/g)].map((m) => +m[1]).filter((t) => t > 0.8 && t < duration - 0.8);
const spaced = [];
for (const c of cuts) if (!spaced.length || c - spaced[spaced.length - 1] > 1.5) spaced.push(+c.toFixed(3));
const transitions = spaced.map((at, i) => ({
  at,
  type: style === 'clean' ? 'flash' : i % 2 === 0 ? 'leak' : 'zoomBlur',
}));

const props = {
  style,
  durationInSeconds: duration,
  clip,
  clipStartFrom,
  clipLoop: true,
  ...(music ? {music} : {}),
  ...(narration ? {narration} : {}),
  clipVolume: 0,
  words,
  ...(style === 'clean' ? {handle: args.handle && args.handle !== true ? args.handle : '@seucanal'} : {}),
  // Seta de abertura (0–1s): ajuste x/y para apontar o personagem.
  arrows: [{start: 0, end: 1.0, x: 0.5, y: 0.42, angle: style === 'comic' ? 40 : 0}],
  // Círculos: preencha com o momento-chave (ex.: {start: 6.4, end: 8.1, x: 0.45, y: 0.3}).
  circles: [],
  transitions,
  sfx: [],
  kenBurns: 1.06,
};
const out = path.resolve(root, args.out ?? 'props.json');
fs.writeFileSync(out, JSON.stringify(props, null, 2));
console.log(`OK → ${path.relative(process.cwd(), out)}`);
console.log(`  estilo=${style} duração=${duration}s palavras=${words.length} cortes=${spaced.join(', ') || 'nenhum'}`);
