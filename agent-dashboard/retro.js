import { C, THEME } from './palette.js';
import { hue, accent, isSub, subAgents, STATUS_RING } from './identity.js';
import { ICONS } from './icons.js';
import { tiers } from './hier.js';
import { STEPS, stepOf } from './insights.js';

const hex2 = h => { const n = parseInt(String(h).slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgb = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => { const A = hex2(a), B = hex2(b); return rgb(A.map((v, i) => v + (B[i] - v) * k)); };
const shade = (h, k) => k < 0 ? mix(h, '#000000', -k) : mix(h, '#ffffff', k);
const fnv = s => { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
const rnd = (seed) => { let s = seed >>> 0 || 1; return () => (s = Math.imul(s ^ s >>> 15, 0x2c1b3c6d) >>> 0, s = Math.imul(s ^ s >>> 12, 0x297a2d39) >>> 0, ((s ^ s >>> 15) >>> 0) / 4294967296); };
const GL = { A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6], E: [7, 4, 6, 4, 7], F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5], I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2], K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7], M: [5, 7, 7, 5, 5], N: [7, 5, 5, 5, 5], O: [2, 5, 5, 5, 2], P: [6, 5, 6, 4, 4], Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2], U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5], Y: [5, 5, 2, 2, 2], Z: [7, 1, 2, 4, 7],
  0: [7, 5, 5, 5, 7], 1: [2, 6, 2, 2, 7], 2: [6, 1, 2, 4, 7], 3: [6, 1, 2, 1, 6], 4: [5, 5, 7, 1, 1], 5: [7, 4, 6, 1, 6], 6: [3, 4, 7, 5, 7], 7: [7, 1, 2, 2, 2], 8: [7, 5, 7, 5, 7], 9: [7, 5, 7, 1, 6],
  '.': [0, 0, 0, 0, 2], ':': [0, 2, 0, 2, 0], '%': [5, 1, 2, 4, 5], '/': [1, 1, 2, 4, 4], '-': [0, 0, 7, 0, 0], '+': [0, 2, 7, 2, 0], '?': [6, 1, 2, 0, 2], '!': [2, 2, 2, 0, 2], '>': [4, 2, 1, 2, 4], '<': [1, 2, 4, 2, 1], '#': [5, 7, 5, 7, 5], '*': [5, 2, 7, 2, 5], '_': [0, 0, 0, 0, 7], '(': [1, 2, 2, 2, 1], ')': [4, 2, 2, 2, 4], ',': [0, 0, 0, 2, 4], "'": [2, 2, 0, 0, 0], '=': [0, 7, 0, 7, 0], '~': [0, 5, 2, 0, 0], '"': [5, 5, 0, 0, 0] };
const tw = (s, k = 1) => String(s).length * 4 * k - k;
function text(g, s, x, y, col, k = 1, al = 'l') { s = String(s).toUpperCase(); if (al === 'c') x -= Math.floor(tw(s, k) / 2); else if (al === 'r') x -= tw(s, k); g.fillStyle = col;
  for (let i = 0; i < s.length; i++) { const r = GL[s[i]]; if (!r) continue; for (let j = 0; j < 5; j++) for (let b = 0; b < 3; b++) if (r[j] & (4 >> b)) g.fillRect(x + (i * 4 + b) * k, y + j * k, k, k); } }
const Rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const pad = n => String(n).padStart(2, '0');
const OUT_DARK = '#0b1020', OUT_LIGHT = '#2b3350', INK = '#1a1f33', GOLD = '#ffd84d', STONE = '#aab3c4';

const SPEC = {
  damon: { skin: '#e0ac7e', hair: '#d9d9e8', hs: 0, acc: 'crown', cape: '#6b4fa0', held: 'wand' },
  viv: { skin: '#f6d1a6', hair: '#8a4bc2', hs: 1, acc: 'headset', held: 'brief' },
  ceo: { skin: '#b9835a', hair: '#2b2118', hs: 0, acc: 'tophat', held: 'none' },
  reed: { skin: '#e0ac7e', hair: '#5a3a22', hs: 2, acc: 'hard', held: 'hammer' },
  evelyn: { skin: '#f6d1a6', hair: '#5a3a22', hs: 1, acc: 'goggles', held: 'binoc' },
  dutchess: { skin: '#f6d1a6', hair: '#d9d9e8', hs: 0, acc: 'helmet', held: 'shield' },
  friend: { skin: '#e0ac7e', hair: '#e8c36a', hs: 3, acc: 'band', held: 'none' },
  motion: { skin: '#8a5a3b', hair: '#2b2118', hs: 2, acc: 'band', held: 'none' },
  agent_builder: { skin: '#c3cdd9', hair: '#9aa3b2', hs: 3, acc: 'antenna', held: 'none' },
  product_manager: { skin: '#b9835a', hair: '#2b2118', hs: 0, acc: 'glasses', held: 'clip' },
  cto: { skin: '#f6d1a6', hair: '#4b5ea8', hs: 2, acc: 'visor', held: 'none' },
  cso: { skin: '#b9835a', hair: '#2b2118', hs: 1, acc: 'hood', held: 'none' },
  skill_finder: { skin: '#e0ac7e', hair: '#5a3a22', hs: 3, acc: 'dish', held: 'none' },
  up_skiller: { skin: '#f6d1a6', hair: '#2b2118', hs: 0, acc: 'gradcap', held: 'none' },
};
const ACCS = ['cap', 'visor', 'antenna', 'glasses', 'hood', 'band', 'goggles', 'headset', 'hard', 'gradcap'], SK = ['#f6d1a6', '#e0ac7e', '#b9835a', '#8a5a3b'], HR = ['#2b2118', '#5a3a22', '#e8c36a', '#4b5ea8', '#8a4bc2', '#d9d9e8'], HELD = ['none', 'clip', 'wand', 'brief', 'hammer'];
const specOf = id => { if (SPEC[id]) return SPEC[id]; const k = fnv(id); return { skin: SK[k % 4], hair: HR[(k >> 2) % 6], hs: (k >> 5) % 4, acc: ACCS[(k >> 7) % ACCS.length], held: HELD[(k >> 11) % 5] }; };
function drawChar(g, sp, hc, pose, f, L) {
  const Q = (x, y, w, h, c) => Rc(g, x, y + 2, w, h, c), dk = shade(hc, -0.38), lt = shade(hc, 0.3), bob = (pose === 'idle' || pose === 'sleep') && f ? 1 : 0, ink = INK;
  if (sp.cape) Q(3, 8 + bob, 10, 7, sp.cape);
  const w2 = pose === 'walk' ? f : 0; Q(5, 14, 2, 3 - w2, dk); Q(9, 14, 2, 3 - (1 - w2) * (pose === 'walk' ? 1 : 0), dk);
  Q(4, 8 + bob, 8, 6, hc); Q(4, 12 + bob, 8, 1, dk); Q(6, 9 + bob, 4, 1, lt);
  const armUp = pose === 'cheer' || pose === 'wait';
  if (armUp) { Q(2, 5, 1, 4, hc); Q(2, 4, 1, 1, sp.skin); if (pose === 'cheer') { Q(13, 5, 1, 4, hc); Q(13, 4, 1, 1, sp.skin); } else Q(3, 9, 1, 4, hc); if (pose === 'wait') Q(12, 9, 1, 4, hc); else { } }
  else if (pose === 'work') { Q(3, 9, 1, 3, hc); Q(12, 9 + f, 1, 3, hc); Q(3, 12, 1, 1, sp.skin); Q(12, 12 + f, 1, 1, sp.skin); }
  else { Q(3, 9 + bob, 1, 4, hc); Q(12, 9 + bob, 1, 4, hc); Q(3, 13 + bob, 1, 1, sp.skin); Q(12, 13 + bob, 1, 1, sp.skin); }
  Q(4, 1 + bob, 8, 7, sp.skin);
  const hr = sp.hair; Q(4, 1 + bob, 8, 2, hr);
  if (sp.hs === 1) { Q(3, 1 + bob, 1, 7, hr); Q(12, 1 + bob, 1, 7, hr); Q(4, 3 + bob, 1, 2, hr); } else if (sp.hs === 2) { Q(4, 0 + bob, 2, 1, hr); Q(8, 0 + bob, 2, 1, hr); Q(11, 0 + bob, 1, 1, hr); Q(3, 2 + bob, 1, 2, hr); } else if (sp.hs === 3) { Q(3, 2 + bob, 1, 3, hr); Q(12, 2 + bob, 1, 3, hr); Q(5, 1 + bob, 6, 1, hr); } else { Q(4, 3 + bob, 1, 1, hr); Q(11, 3 + bob, 1, 1, hr); }
  if (pose === 'sleep') { Q(6, 5 + bob, 2, 1, ink); Q(9, 5 + bob, 2, 1, ink); } else if (pose === 'cheer') { Q(6, 4 + bob, 2, 1, ink); Q(9, 4 + bob, 2, 1, ink); Q(7, 6 + bob, 2, 1, ink); } else { Q(6, 4 + bob, 1, 2, ink); Q(9, 4 + bob, 1, 2, ink); Q(7, 7 + bob, 2, 1, mix(sp.skin, '#000000', 0.45)); }
  const a = sp.acc, y0 = bob;
  if (a === 'crown') { Q(4, -1 + y0, 8, 2, GOLD); Q(4, -2 + y0, 1, 1, GOLD); Q(7, -2 + y0, 2, 1, GOLD); Q(11, -2 + y0, 1, 1, GOLD); Q(7, -1 + y0, 2, 1, hc); }
  else if (a === 'tophat') { Q(5, -2 + y0, 6, 3, '#2b2b3a'); Q(3, 1 + y0, 10, 1, '#2b2b3a'); Q(5, 0 + y0, 6, 1, hc); }
  else if (a === 'hard') { Q(4, -1 + y0, 8, 3, hc); Q(3, 2 + y0, 10, 1, dk); Q(7, -2 + y0, 2, 1, hc); }
  else if (a === 'visor') { Q(4, 3 + y0, 8, 2, '#9be7ff'); Q(4, 3 + y0, 8, 1, '#d9f6ff'); }
  else if (a === 'helmet') { Q(4, -1 + y0, 8, 4, STONE); Q(3, 1 + y0, 1, 5, STONE); Q(12, 1 + y0, 1, 5, STONE); Q(5, 3 + y0, 6, 1, ink); Q(7, -3 + y0, 2, 2, hc); }
  else if (a === 'headset') { Q(3, 2 + y0, 1, 4, '#2b2b3a'); Q(12, 2 + y0, 1, 4, '#2b2b3a'); Q(4, -1 + y0, 8, 1, '#2b2b3a'); Q(3, 6 + y0, 3, 1, '#2b2b3a'); }
  else if (a === 'antenna') { Q(7, -3 + y0, 1, 3, STONE); Q(6, -4 + y0, 3, 1, hc); Q(5, 3 + y0, 6, 2, '#9be7ff'); }
  else if (a === 'glasses') { Q(5, 3 + y0, 2, 2, '#bfe3ff'); Q(9, 3 + y0, 2, 2, '#bfe3ff'); Q(7, 3 + y0, 2, 1, ink); Q(4, 3 + y0, 1, 1, ink); Q(11, 3 + y0, 1, 1, ink); }
  else if (a === 'hood') { Q(3, -1 + y0, 10, 3, dk); Q(3, 2 + y0, 1, 6, dk); Q(12, 2 + y0, 1, 6, dk); Q(5, 2 + y0, 6, 1, dk); }
  else if (a === 'gradcap') { Q(2, -1 + y0, 12, 1, ink); Q(5, 0 + y0, 6, 2, ink); Q(13, 0 + y0, 1, 3, GOLD); }
  else if (a === 'dish') { Q(3, -2 + y0, 10, 1, STONE); Q(5, -1 + y0, 6, 1, STONE); Q(7, -3 + y0, 2, 1, hc); }
  else if (a === 'band') { Q(4, 2 + y0, 8, 1, hc); }
  else if (a === 'goggles') { Q(4, 2 + y0, 8, 2, '#2b2b3a'); Q(5, 2 + y0, 2, 2, lt); Q(9, 2 + y0, 2, 2, lt); }
  else if (a === 'cap') { Q(4, -1 + y0, 8, 2, hc); Q(2, 1 + y0, 5, 1, dk); }
  const h = sp.held;
  if (h === 'hammer') { Q(13, 7, 1, 6, '#8a6a3a'); Q(12, 6, 3, 2, STONE); } else if (h === 'clip') { Q(12, 8, 3, 5, '#e9edf5'); Q(12, 8, 3, 1, hc); Q(13, 10, 1, 1, ink); } else if (h === 'brief') { Q(12, 12, 4, 3, '#6b4a3a'); Q(13, 11, 2, 1, '#6b4a3a'); }
  else if (h === 'binoc') { Q(11, 5, 4, 2, '#2b2b3a'); Q(11, 5, 1, 2, lt); Q(14, 5, 1, 2, lt); } else if (h === 'shield') { Q(0, 9, 4, 6, lt); Q(1, 10, 2, 4, '#fff'); Q(1, 11, 2, 2, hc); } else if (h === 'wand') { Q(14, 3, 1, 11, '#8a6a3a'); Q(13, 2, 3, 2, GOLD); }
}

const ICC = new Map();
function ico(name, col, size = 9) { const k = name + col + size; let c = ICC.get(k); if (c) return c; c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  g.strokeStyle = col; g.lineWidth = 1.5 * 24 / size; g.lineCap = 'round'; g.lineJoin = 'round'; g.scale(size / 24, size / 24); (ICONS[name] || ICONS.sparkles).forEach(d => g.stroke(new Path2D(d)));
  const im = g.getImageData(0, 0, size, size), d = im.data; const [r, gg, b] = hex2(col); for (let i = 0; i < d.length; i += 4) { if (d[i + 3] > 80) { d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255; } else d[i + 3] = 0; } g.setTransform(1, 0, 0, 1, 0, 0); g.putImageData(im, 0, 0); ICC.set(k, c); return c; }
const hashColor = id => { const k = fnv(id), h = [190, 210, 250, 280, 160, 100, 50][k % 7], s = 0.7, l = THEME === 'light' ? 0.42 : 0.62; const a = s * Math.min(l, 1 - l), f = n => { const kk = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(kk - 3, 9 - kk, 1)); }; return rgb([f(0) * 255, f(8) * 255, f(4) * 255]); };
const wood = () => THEME === 'light' ? '#b98a56' : '#6b4a2e';

export function createRetro(canvas, labelLayer, V, opt = {}) {
  const PUB = !!window.DASH_PUBLIC; const g = canvas.getContext('2d', { alpha: false }); canvas.style.imageRendering = 'pixelated'; canvas.style.touchAction = 'none';
  let W = 1, H = 1, bw = 160, bh = 240, ps = 3, now = 0, S = { x0: 0, y0: 0, x1: 1, y1: 1, w: 1, h: 1 }, N = new Map(), TR = null, links = [], flows = [], items = [], bursts = [], terr = null, built = false;
  let selected = null, room = null, hoverId = null, trans = null, tick = { text: '', k: 1, t0: 0 }, tourS = { on: false, i: 0, t: 0, stops: [] };
  const cam = { x: 0, y: 0, tx: 0, ty: 0, z: 1 }, L = () => THEME === 'light', MOB = () => !!opt.mobile;
  const PAL = () => L() ? { g1: '#92d66e', g2: '#86cc62', g3: '#6fb54f', dirt: '#e0c18e', dirt2: '#caa56f', water: '#6ec3f2', water2: '#a2defa', stone: '#cfd5e0', stone2: '#9aa3b2', wall: '#e8edf6', floor1: '#f0e5cc', floor2: '#e5d8bd', txt: '#1b1f24', sub: '#46506a', bg: '#9fd3f5', panel: '#ffffff', edge: '#2b3350', leaf: '#3f9f56', leaf2: '#2f8a47', night: false }
    : { g1: '#1d3d36', g2: '#183429', g3: '#133024', dirt: '#4e3d2c', dirt2: '#3d3024', water: '#17406b', water2: '#2a6aa8', stone: '#5e6e8a', stone2: '#3d4a63', wall: '#1b2745', floor1: '#27345a', floor2: '#202c4c', txt: '#e8eefc', sub: '#9fb0cc', bg: '#070d1a', panel: '#0e1830', edge: '#0b1020', leaf: '#1f6b46', leaf2: '#16553a', night: true };
  const hueOfId = id => { const h = hue(id); return h === C.sub ? hashColor(id) : h; };
  let SC = new Map();
  const spr = (id, pose, f) => { const k = id + pose + f + THEME; let c = SC.get(k); if (c) return c; c = document.createElement('canvas'); c.width = 16; c.height = 20; const x = c.getContext('2d');
    drawChar(x, specOf(id), N.get(id)?.hue || hueOfId(id), pose, f, L());
    const im = x.getImageData(0, 0, 16, 20), d = im.data, o = new Uint8ClampedArray(d); const oc = hex2(L() ? OUT_LIGHT : OUT_DARK);
    for (let j = 0; j < 20; j++) for (let i = 0; i < 16; i++) { const p = (j * 16 + i) * 4; if (d[p + 3] > 100) { o[p + 3] = 255; continue; } let nb = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + dx, b = j + dy; if (a >= 0 && b >= 0 && a < 16 && b < 20 && d[(b * 16 + a) * 4 + 3] > 100) nb = true; } if (nb) { o[p] = oc[0]; o[p + 1] = oc[1]; o[p + 2] = oc[2]; o[p + 3] = 255; } else o[p + 3] = 0; }
    x.putImageData(new ImageData(o, 16, 20), 0, 0); SC.set(k, c); return c; };
  function build() {
    const A = V.A; TR = tiers(A); N = new Map(); SC = new Map(); ICC.clear(); const VIV = TR.second, TOP = TR.top;
    const mk = (id, kind, ex = {}) => { const n = { id, kind, hue: kind === 'res' ? (L() ? '#5f6b7a' : C.sub) : hueOfId(id), x: 0, y: 0, pulse: 0, cheer: 0, heat: 0, ph: (fnv(id) % 100) / 16, ...ex }; N.set(id, n); return n; };
    if (TOP) mk(TOP, 'human'); if (VIV) mk(VIV, 'agent', { parent: TOP }); TR.rest.forEach(id => mk(id, isSub(id) ? 'sub' : 'agent', { parent: VIV || TOP, sub: isSub(id) }));
    mk('hub', 'res'); mk('drive', 'res');
    const dyn = subAgents(V, { maxPer: 2 }).filter(s => !s.static); const kids = {};
    dyn.forEach(s => { const par = s.known && N.has(s.parent) ? s.parent : 'hub'; (kids[par] = kids[par] || []).push(s); });
    Object.entries(kids).forEach(([par, ks]) => ks.forEach((s, j) => mk(s.id, 'session', { parent: par, sub: s, known: s.known && par !== 'hub', hue: s.known && N.has(par) ? N.get(par).hue : (L() ? '#5f6b7a' : C.sub), oj: j })));
    const t1 = V.events.length ? new Date(V.events[V.events.length - 1].time).getTime() : 0;
    N.forEach(n => { n.heat = Math.min(1, V.events.filter(e => e.agent === n.id && t1 - new Date(e.time).getTime() <= 864e5).length / 12); });
    const ek = (a, b) => a < b ? a + '|' + b : b + '|' + a, fan = t => /team|reed\/evelyn\/dutchess/.test(t) ? ['reed', 'evelyn', 'dutchess'] : [/^(prod|board)/.test(t) ? 'drive' : t], m = new Map();
    const add = (f, t, c) => { if (!N.has(f) || !N.has(t) || f === t) return; const k = f + '>' + t, o = m.get(k) || { f, t, count: null }; if (c != null) o.count = (o.count || 0) + c; m.set(k, o); };
    (V.D.links || []).filter(l => l.from !== 'vps agents').forEach(l => fan(l.to).forEach(t => add(l.from, t, l.count))); add('hub', 'ceo', V.D.meta?.hub_posts ?? null);
    links = [...m.values()]; const seen = new Set(); links = links.filter(l => { const k = ek(l.f, l.t); if (seen.has(k)) return false; seen.add(k); return true; });
    flows = []; links.forEach(l => { if (!l.count) return; const n = Math.min(3, 1 + Math.round(l.count * 0.3)); for (let i = 0; i < n; i++) flows.push({ l, u: i / n, v: 0.1 + 0.012 * Math.min(l.count, 14) }); });
    const le = V.events[V.events.length - 1]; tick = { text: le ? '> ' + String(le.summary || '').replace(/^#[\w-]+: /, '').toUpperCase().replace(/[^A-Z0-9 .:%\/+\-?!<>#*_()=,']/g, '').slice(0, 70) : '', t0: now };
    layout(); paintTerrain(); built = true;
  }
  function layout() {
    const mob = MOB(), pads = mob ? { l: 6, r: 6, t: 62, b: 72 } : { l: 330, r: 358, t: 44, b: 96 };
    S = { x0: Math.round(pads.l / ps), y0: Math.round(pads.t / ps), x1: Math.round(bw - pads.r / ps), y1: Math.round(bh - pads.b / ps) }; S.w = S.x1 - S.x0; S.h = S.y1 - S.y0;
    const cx = Math.round((S.x0 + S.x1) / 2), rest = TR.rest, cols = Math.max(2, Math.min(rest.length || 1, Math.floor(S.w / (mob ? 40 : 44)))), rows = Math.ceil(rest.length / cols);
    const top = TR.top && N.get(TR.top), viv = TR.second && N.get(TR.second);
    const yC = S.y0 + 38, yV = yC + 56, y0 = yV + 36, resY = S.y1 - 6; const rh = Math.max(30, Math.min(mob ? 58 : 48, (resY - 32 - y0) / Math.max(1, rows - 1)));
    if (top) { top.x = cx; top.y = yC; } if (viv) { viv.x = cx; viv.y = yV; }
    rest.forEach((id, i) => { const r = Math.floor(i / cols), inRow = Math.min(cols, rest.length - r * cols), c = i % cols; N.get(id).x = Math.round(S.x0 + S.w * ((c + 0.5 + (cols - inRow) / 2) / cols)); N.get(id).y = Math.round(y0 + r * rh); N.get(id).row = r; });
    const rs = [...N.values()].filter(n => n.kind === 'res'); rs.forEach((n, i) => { n.x = Math.round(S.x0 + S.w * ((i + 0.5) / rs.length)); n.y = resY; });
    N.forEach(n => { if (n.kind === 'session') { const P = N.get(n.parent) || N.get('hub'); n.base = P; } });
    layout.rows = { y0, rh, rows, cols, cx, yC, yV, resY };
    Object.assign(cam, { x: 0, y: 0, tx: 0, ty: 0, z: 1 });
  }
  function paintTerrain() {
    terr = document.createElement('canvas'); terr.width = bw; terr.height = bh; const c = terr.getContext('2d'), P = PAL(), rr = rnd(7), Rw = layout.rows, night = P.night;
    Rc(c, 0, 0, bw, bh, P.g1); for (let y = 0; y < bh; y += 8) for (let x = 0; x < bw; x += 8) if (((x + y) >> 3) & 1) Rc(c, x, y, 8, 8, P.g2);
    for (let i = 0; i < bw * bh / 90; i++) { const x = Math.floor(rr() * bw), y = Math.floor(rr() * bh); Rc(c, x, y, 1, 2, P.g3); if (rr() < 0.15) Rc(c, x + 2, y, 1, 1, night ? '#ffe9a8' : '#fff7b8'); }
    const road = (x, y, w, h) => { Rc(c, x, y, w, h, P.dirt); Rc(c, x, y, w, 1, P.dirt2); Rc(c, x, y + h - 1, w, 1, P.dirt2); };
    const cx = Rw.cx, lastY = Rw.y0 + (Rw.rows - 1) * Rw.rh;
    road(cx - 4, Rw.yV, 8, lastY - Rw.yV + 8); for (let r = 0; r < Rw.rows; r++) road(S.x0 - 2, Rw.y0 + r * Rw.rh + 2, S.w + 4, 6);
    N.forEach(n => { if (n.kind === 'agent' || n.kind === 'sub') road(n.x - 1, n.y - 2, 3, 6); });
    road(cx - 4, lastY + 6, 8, Rw.resY - lastY - 8); road(S.x0 + 6, Rw.resY - 3, S.w - 12, 5);
    for (let i = 0; i < 4; i++) { Rc(c, cx - 14 + i * 2, Rw.yC + 4 + i * 8, 28 - i * 4, 6, P.stone); Rc(c, cx - 14 + i * 2, Rw.yC + 9 + i * 8, 28 - i * 4, 1, P.stone2); }
    const tree = (x, y) => { Rc(c, x + 2, y + 6, 2, 4, '#6b4a2e'); Rc(c, x, y + 1, 6, 6, P.leaf); Rc(c, x + 1, y, 4, 2, P.leaf2); Rc(c, x + 1, y + 3, 2, 2, P.leaf2); };
    for (let i = 0; i < 70; i++) { const x = Math.floor(rr() * (bw - 8)), y = Math.floor(rr() * (bh - 10)); if (x > S.x0 - 6 && x < S.x1 + 4 && y > S.y0 - 8 && y < S.y1 + 4) continue; tree(x, y); }
    const pond = (x, y, w, h) => { Rc(c, x, y, w, h, P.water); Rc(c, x + 1, y - 1, w - 2, 1, P.water); Rc(c, x + 2, y + 2, w - 5, 1, P.water2); Rc(c, x + 3, y + h - 3, 4, 1, P.water2); };
    pond(Math.max(0, S.x0 - 26), bh - 44, 24, 12); pond(Math.min(bw - 24, S.x1 + 2), 70, 22, 14);
    const t0 = TR.top && N.get(TR.top); if (t0) { const x = t0.x, y = t0.y; const cl = (a, b, w) => { Rc(c, a, b, w, 3, night ? '#3a4a70' : '#ffffff'); Rc(c, a + 3, b - 2, w - 6, 3, night ? '#3a4a70' : '#ffffff'); }; cl(x - 40, y - 24, 16); cl(x + 22, y - 18, 18); cl(x - 30, y + 12, 12);
      Rc(c, x - 26, y + 4, 52, 8, P.stone2); Rc(c, x - 24, y + 4, 48, 4, P.stone); Rc(c, x - 18, y - 22, 36, 26, P.stone); Rc(c, x - 18, y - 22, 36, 2, shade(P.stone, 0.25));
      for (let i = 0; i < 6; i++) Rc(c, x - 18 + i * 7, y - 26, 4, 5, P.stone); Rc(c, x - 22, y - 30, 8, 34, P.stone2); Rc(c, x + 14, y - 30, 8, 34, P.stone2); Rc(c, x - 22, y - 34, 8, 4, hueOfId(TR.top)); Rc(c, x + 14, y - 34, 8, 4, hueOfId(TR.top));
      Rc(c, x - 5, y - 8, 10, 12, '#2b2b3a'); Rc(c, x - 4, y - 10, 8, 2, '#2b2b3a'); Rc(c, x - 12, y - 14, 3, 4, night ? '#ffe38a' : '#8fd0ff'); Rc(c, x + 9, y - 14, 3, 4, night ? '#ffe38a' : '#8fd0ff'); Rc(c, x - 1, y - 38, 1, 8, '#8a6a3a'); Rc(c, x, y - 38, 6, 4, GOLD); }
    const v0 = TR.second && N.get(TR.second); if (v0) { const x = v0.x, y = v0.y, hv = v0.hue; Rc(c, x - 12, y - 24, 24, 28, P.stone); Rc(c, x - 12, y - 24, 24, 2, shade(P.stone, 0.25)); Rc(c, x - 14, y - 29, 28, 6, hv); Rc(c, x - 10, y - 34, 20, 6, hv); Rc(c, x - 6, y - 38, 12, 5, shade(hv, -0.2)); Rc(c, x - 1, y - 45, 1, 8, '#8a6a3a'); Rc(c, x, y - 45, 5, 3, hv);
      Rc(c, x - 5, y - 10, 10, 14, '#2b2b3a'); Rc(c, x - 9, y - 19, 4, 5, night ? '#ffe38a' : '#8fd0ff'); Rc(c, x + 5, y - 19, 4, 5, night ? '#ffe38a' : '#8fd0ff'); Rc(c, x - 16, y + 4, 32, 4, P.stone2); }
    N.forEach(n => { if (n.kind !== 'agent' && n.kind !== 'sub') return; const hh = n.hue; Rc(c, n.x - 10, n.y + 1, 20, 7, P.stone2); Rc(c, n.x - 9, n.y, 18, 6, P.stone); Rc(c, n.x - 9, n.y, 18, 1, shade(P.stone, 0.3)); Rc(c, n.x - 9, n.y + 5, 18, 1, hh);
      Rc(c, n.x + 8, n.y - 12, 1, 14, '#8a6a3a'); Rc(c, n.x + 9, n.y - 12, 5, 5, hh); Rc(c, n.x + 9, n.y - 7, 3, 1, hh); });
    N.forEach(n => { if (n.kind !== 'res') return; const x = n.x, y = n.y; Rc(c, x - 9, y - 3, 18, 8, P.stone2);
      if (n.id === 'hub') { Rc(c, x - 1, y - 24, 2, 22, STONE); Rc(c, x - 7, y - 18, 14, 1, STONE); Rc(c, x - 5, y - 12, 10, 1, STONE); Rc(c, x - 3, y - 27, 6, 3, GOLD); }
      else if (n.id === 'drive') { Rc(c, x - 8, y - 14, 16, 12, '#8a6a3a'); Rc(c, x - 8, y - 14, 16, 3, '#a8835a'); Rc(c, x - 2, y - 9, 4, 4, GOLD); Rc(c, x - 8, y - 8, 16, 1, '#5b4128'); }
      else { Rc(c, x - 9, y - 12, 18, 3, STONE); for (let i = 0; i < 4; i++) Rc(c, x - 7 + i * 5, y - 9, 3, 8, '#e9edf5'); Rc(c, x - 9, y - 1, 18, 2, STONE); Rc(c, x - 2, y - 18, 4, 5, GOLD); } });
  }
  const PROPS = { damon: ['throne', 'window', 'banner', 'trophy'], viv: ['desk', 'shelf', 'plant', 'board'], ceo: ['map', 'desk', 'banner', 'trophy'], reed: ['anvil', 'desk', 'rack', 'shelf'], evelyn: ['dish', 'map', 'window', 'plant'], dutchess: ['shieldrack', 'banner', 'vault', 'plant'],
    friend: ['sofa', 'plant', 'tv', 'window'], motion: ['stage', 'tv', 'rack', 'banner'], agent_builder: ['robot', 'rack', 'desk', 'shelf'], product_manager: ['board', 'desk', 'shelf', 'plant'], cto: ['rack', 'desk', 'tv', 'robot'], cso: ['vault', 'shieldrack', 'tv', 'rack'], skill_finder: ['dish', 'map', 'shelf', 'desk'], up_skiller: ['shelf', 'board', 'desk', 'plant'] };
  const ALLP = ['desk', 'shelf', 'rack', 'plant', 'window', 'banner', 'map', 'board', 'tv', 'sofa', 'dish', 'vault', 'anvil', 'robot', 'trophy', 'stage', 'shieldrack', 'throne'];
  const propsOf = id => PROPS[id] || (() => { const k = fnv(id); return [0, 1, 2, 3].map(i => ALLP[(k >> (i * 4)) % ALLP.length]); })();
  function prop(name, x, y, s, t, hc) { const Q = (a, b, w, h, col) => Rc(g, x + a * s, y + b * s, w * s, h * s, col), wd = wood(), lt = shade(hc, 0.3), dk = shade(hc, -0.35), bl = (Math.floor(t * 3) & 1);
    if (name === 'desk') { Q(0, 10, 16, 2, wd); Q(1, 12, 2, 4, wd); Q(13, 12, 2, 4, wd); Q(3, 2, 10, 7, '#2b2b3a'); Q(4, 3, 8, 5, dk); const o = Math.floor(t * 3) % 3; Q(5, 4, 5 - o, 1, lt); Q(5, 6, 3 + o, 1, lt); Q(7, 9, 2, 1, '#2b2b3a'); }
    else if (name === 'shelf') { Q(0, 0, 14, 16, wd); for (let r = 0; r < 4; r++) { Q(1, 1 + r * 4, 12, 3, '#3a2a1c'); for (let b = 0; b < 5; b++) Q(2 + b * 2 + (r & 1), 1 + r * 4 + (b % 2), 1, 3 - (b % 2), [hc, lt, dk, '#e9edf5', '#8fd0ff'][(b + r) % 5]); } }
    else if (name === 'rack') { Q(1, 0, 12, 16, '#2b2f45'); for (let i = 0; i < 5; i++) { Q(2, 1 + i * 3, 10, 2, '#3a4060'); Q(10, 1 + i * 3, 1, 1, ((Math.floor(t * 3) + i) & 1) ? '#5ee08a' : '#2a4a3a'); Q(3, 1 + i * 3, 4, 1, '#4a5276'); } }
    else if (name === 'plant') { Q(5, 11, 6, 5, wd); Q(3, 3, 10, 8, '#3fa35f'); Q(6, 1, 4, 4, '#4fc36f'); Q(2, 6, 2, 3, '#2f8a47'); Q(12, 6, 2, 3, '#2f8a47'); }
    else if (name === 'window') { Q(0, 0, 14, 14, wd); Q(1, 1, 12, 12, L() ? '#bfe3ff' : '#101c3a'); if (!L()) { Q(3, 3, 1, 1, '#fff'); Q(10, 5, 1, 1, '#fff'); Q(4, 9, 1, 1, '#9fb0cc'); } Q(9, 2, 3, 3, L() ? '#ffe38a' : '#e9edf5'); Q(6, 1, 2, 12, wd); Q(1, 6, 12, 2, wd); }
    else if (name === 'banner') { Q(0, 0, 14, 1, wd); Q(2, 1, 10, 12, hc); Q(5, 4, 4, 4, lt); Q(2, 13, 4, 2, hc); Q(8, 13, 4, 2, hc); }
    else if (name === 'throne') { Q(2, 0, 12, 3, GOLD); Q(3, 3, 10, 9, '#6b4fa0'); Q(4, 4, 8, 7, hc); Q(2, 12, 12, 3, GOLD); Q(2, 15, 2, 1, GOLD); Q(12, 15, 2, 1, GOLD); }
    else if (name === 'trophy') { Q(5, 2, 6, 6, GOLD); Q(3, 3, 2, 3, GOLD); Q(11, 3, 2, 3, GOLD); Q(7, 8, 2, 3, GOLD); Q(4, 11, 8, 4, wd); Q(6, 4, 1, 2, '#fff'); }
    else if (name === 'anvil') { Q(1, 6, 14, 3, '#4a5266'); Q(0, 5, 4, 2, '#4a5266'); Q(5, 9, 6, 3, '#3a4256'); Q(3, 12, 10, 3, '#3a4256'); if (bl) { Q(10, 2, 1, 1, GOLD); Q(12, 3, 1, 1, '#fff'); Q(8, 1, 1, 1, GOLD); } }
    else if (name === 'map') { Q(0, 8, 16, 3, wd); Q(1, 11, 2, 5, wd); Q(13, 11, 2, 5, wd); Q(2, 3, 12, 5, '#f0e2b6'); Q(4, 5, 2, 1, hc); Q(7, 4, 2, 1, hc); Q(10, 6, 2, 1, hc); Q(11, 0, 1, 4, '#8a6a3a'); Q(12, 0, 3, 2, hc); }
    else if (name === 'dish') { Q(6, 10, 4, 5, STONE); Q(2, 4, 12, 2, '#c3cdd9'); Q(4, 6, 8, 2, '#c3cdd9'); Q(6, 8, 4, 2, '#aab3c4'); Q(7, 0, 2, 4, '#8a6a3a'); Q(6, 0, 4, 1, bl ? hc : lt); const a = t * 2; Q(8 + Math.round(Math.cos(a) * 6), 3 + Math.round(Math.sin(a) * 2), 1, 1, lt); }
    else if (name === 'shieldrack') { Q(0, 0, 16, 14, wd); [hc, lt, dk].forEach((cc, i) => { Q(1 + i * 5, 3, 4, 6, cc); Q(2 + i * 5, 4, 2, 4, '#fff'); Q(2 + i * 5, 5, 2, 2, cc); }); Q(0, 14, 16, 1, '#3a2a1c'); }
    else if (name === 'vault') { Q(0, 0, 16, 16, '#4a5266'); Q(2, 2, 12, 12, '#6a7590'); Q(5, 5, 6, 6, STONE); Q(7, 3, 2, 10, STONE); Q(3, 7, 10, 2, STONE); Q(7, 7, 2, 2, bl ? hc : lt); }
    else if (name === 'board') { Q(0, 0, 16, 12, '#e9edf5'); Q(5, 0, 1, 12, '#aab3c4'); Q(10, 0, 1, 12, '#aab3c4'); for (let cI = 0; cI < 3; cI++) for (let k = 0; k < 3 - cI; k++) Q(1 + cI * 5, 2 + k * 3, 3, 2, [hc, lt, dk][(cI + k) % 3]); Q(0, 12, 16, 1, wd); }
    else if (name === 'stage') { Q(0, 12, 16, 3, '#6b4a8a'); Q(1, 0, 3, 2, GOLD); Q(12, 0, 3, 2, GOLD); Q(2, 2, 2, 10, shade(hc, 0.55)); Q(12, 2, 2, 10, shade(hc, 0.55)); if (bl) Q(6, 4, 4, 1, GOLD); }
    else if (name === 'sofa') { Q(0, 6, 16, 7, dk); Q(1, 3, 14, 4, hc); Q(0, 5, 2, 8, lt); Q(14, 5, 2, 8, lt); Q(2, 13, 2, 2, wd); Q(12, 13, 2, 2, wd); }
    else if (name === 'tv') { Q(1, 2, 14, 9, '#2b2b3a'); Q(2, 3, 12, 7, bl ? dk : shade(dk, 0.25)); Q(4, 5, 3, 2, lt); Q(8, 6, 4, 1, lt); Q(6, 11, 4, 2, '#2b2b3a'); }
    else if (name === 'robot') { Q(2, 12, 12, 3, '#6a7590'); Q(7, 4, 2, 8, STONE); Q(7, 3, 7, 2, STONE); Q(12, 3, 2, 4 + (bl ? 1 : 0), STONE); Q(11, 7 + (bl ? 1 : 0), 4, 1, hc); }
  }
  const NAMES = { agent_builder: 'BUILDER', product_manager: 'PM', skill_finder: 'SKILLS', up_skiller: 'UPSKILL' };
  const nameOf = id => NAMES[id] || (id.length <= 9 ? id : id.slice(0, 9)).toUpperCase();
  const blockedOf = id => !PUB && !!V.blk?.agents?.get(id);
  const tagOf = id => V.A[id]?.tag || 'idle';
  const arcPt = (a, b, u) => { const ax = a.x, ay = a.y - 10, bx = b.x, by = b.y - 10, h = 8 + Math.hypot(bx - ax, by - ay) * 0.2; return [ax + (bx - ax) * u, ay + (by - ay) * u - Math.sin(Math.PI * u) * h]; };
  const stepIcon = e => (STEPS.find(s => s.id === stepOf(e)) || STEPS[2]).icon;
  const clean = s => String(s || '').replace(/^#[\w-]+: /, '').toUpperCase().replace(/[^A-Z0-9 .:%\/+\-?!<>#*_()=,']/g, '').replace(/\s+/g, ' ').trim();
  const panel = (x, y, w, h, fill, edge) => { Rc(g, x, y, w, h, edge); Rc(g, x + 1, y + 1, w - 2, h - 2, fill); };
  const t1ms = () => V.events.length ? new Date(V.events[V.events.length - 1].time).getTime() : 0;
  const rowOf = id => V.I?.board?.rows?.find(r => r.id === id);
  const poseOf = n => { const tag = tagOf(n.id), f = opt.reduced ? 0 : Math.floor(now * 2 + n.ph) & 1; if (n.cheer > 0) return ['cheer', f]; if (n.kind === 'human' || tag === 'waiting') return ['wait', f]; if (tag === 'idle') return ['sleep', f]; if (n.pulse > 0.15 || n.heat > 0.45) return ['work', f]; return ['idle', f]; };
  const statusIcon = (x, y, n) => { const tag = tagOf(n.id), P = PAL(), b = (Math.floor(now * 3 + n.ph) & 1);
    if (n.kind === 'human' || tag === 'waiting') { panel(x - 4, y - 2 - b, 8, 9, '#fff3c4', OUT_DARK); text(g, '!', x - 1, y + 0 - b, '#9a5b00'); }
    else if (tag === 'idle') { text(g, 'Z', x + 2, y + 1 - b, P.txt); text(g, 'Z', x + 6, y - 3 + b, P.sub); }
    else if (tag === 'pending') { const k = Math.floor(now * 2) % 4; for (let i = 0; i < 3; i++) Rc(g, x - 4 + i * 3, y + 2, 2, 2, i < k ? P.txt : P.sub); }
    else if (n.kind !== 'res' && n.kind !== 'session') g.drawImage(ico('zap', GOLD, 7), x - 3, y - b);
  };
  const drawSlime = (x, y, n, P) => { const f = Math.floor(now * 2 + n.ph) & 1, h = n.hue, lt = shade(h, 0.4); Rc(g, x - 4, y - 5 + f, 8, 5 - f, OUT_DARK); Rc(g, x - 3, y - 4 + f, 6, 4 - f, h); Rc(g, x - 2, y - 5 + f, 4, 1, h); Rc(g, x - 2, y - 3 + f, 1, 1, '#fff'); Rc(g, x + 1, y - 3 + f, 1, 1, '#fff'); Rc(g, x - 2, y - 4 + f, 1, 1, lt); };
  const drawRes = (n, P) => { const x = n.x, y = n.y; if (tagOf(n.id) !== 'idle' || true) { const b = Math.floor(now * 2 + n.ph) & 1; if (n.id === 'hub') Rc(g, x - 1, y - 30 + b, 2, 2, b ? GOLD : '#fff'); else g.drawImage(ico(n.id === 'drive' ? 'drive' : n.id, '#fff', 7), x - 3, y - 24 - b); } };
  function drawWorld(dt) {
    const P = PAL(), z = cam.z, tx = -Math.round(cam.x * z), ty = -Math.round(cam.y * z);
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = P.g1; g.fillRect(0, 0, bw, bh); g.setTransform(z, 0, 0, z, tx, ty); g.imageSmoothingEnabled = false;
    g.drawImage(terr, 0, 0);
    links.forEach(l => { const a = N.get(l.f), b = N.get(l.t); if (!a || !b) return; const hot = selected && (l.f === selected || l.t === selected), n = Math.max(6, Math.round(Math.hypot(a.x - b.x, a.y - b.y) / 5)); for (let i = 1; i < n; i++) { if (!hot) continue; const [x, y] = arcPt(a, b, i / n); Rc(g, x, y, 1, 1, hot ? GOLD : mix(P.g1, P.txt, 0.22)); } });
    flows.forEach(fl => { const a = N.get(fl.l.f), b = N.get(fl.l.t); if (!a || !b) return; const [x, y] = arcPt(a, b, fl.u); const col = a.kind === 'res' ? STONE : a.hue; Rc(g, x - 1, y - 1, 2, 2, col); Rc(g, x - 1, y - 1, 1, 1, shade(col, 0.6)); });
    const list = [...N.values()].sort((a, b) => a.y - b.y);
    list.forEach(n => {
      if (n.kind === 'res') { drawRes(n, P); return; }
      if (n.kind === 'session') { const B = n.base || N.get('hub'); n.x = B.x - 16 - (n.oj || 0) * 9; n.y = B.y + 4 - (n.oj || 0) * 7; drawSlime(n.x, n.y, n, P); return; }
      const [pose, f] = poseOf(n), s = spr(n.id, pose, f), jump = n.cheer > 0 ? Math.round(Math.abs(Math.sin(n.cheer * 9)) * 4) : 0;
      Rc(g, n.x - 5, n.y - 1, 10, 2, mix(P.g3, '#000000', 0.45)); g.drawImage(s, n.x - 8, n.y - 19 - jump);
      if (selected === n.id || hoverId === n.id) { const b = Math.floor(now * 4) & 1; Rc(g, n.x - 2, n.y - 29 - b - jump, 5, 1, GOLD); Rc(g, n.x - 1, n.y - 28 - b - jump, 3, 1, GOLD); Rc(g, n.x, n.y - 27 - b - jump, 1, 1, GOLD); }
      else statusIcon(n.x, n.y - 30 - jump, n);
      if (!MOB()) text(g, nameOf(n.id), n.x, n.y + 8, P.txt, 1, 'c'); });
    items.forEach(it => { const a = N.get(it.f), b = N.get(it.t); if (!a || !b) return; for (let k = 3; k >= 1; k--) { const u = Math.max(0, it.u - k * 0.03), [x, y] = arcPt(a, b, u); Rc(g, x, y, 1, 1, it.col); } const [x, y] = arcPt(a, b, it.u); panel(x - 5, y - 5, 10, 10, '#fff', OUT_DARK); Rc(g, x - 4, y - 4, 8, 8, shade(it.col, 0.75)); g.drawImage(ico(it.icon, shade(it.col, -0.35), 8), x - 4, y - 4); });
    bursts.forEach(b => { b.p.forEach(p => Rc(g, b.x + p.x, b.y + p.y, 2, 2, p.c)); });
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (!MOB()) { const full = tick.text, k = Math.min(1, (now - tick.t0) * 1.6), n = Math.floor(full.length * k); let s = ''; for (let i = 0; i < full.length; i++) s += i < n || full[i] === ' ' ? full[i] : 'X#%*=+/'[(i + Math.floor(now * 12)) % 7]; const w = Math.min(S.w - 8, tw(s) + 10); panel(Math.round((S.x0 + S.x1) / 2 - w / 2), 3, w, 11, P.panel, P.edge); text(g, s.slice(0, Math.floor((w - 8) / 4)), Math.round((S.x0 + S.x1) / 2 - w / 2) + 4, 6, P.txt); }
    if (cam.z > 1) panel(S.x0, S.y1 - 12, 17, 11, P.panel, P.edge), text(g, 'X' + cam.z, S.x0 + 3, S.y1 - 9, P.txt);
  }
  let view = 'world', roomId = null, roomT0 = 0, ui = [], rcache = { k: '', v: null };
  const rid = id => { const n = N.get(id); return n && n.kind === 'session' ? (n.known && N.has(n.parent) ? n.parent : 'hub') : id; };
  function rdata(id) { const k = id + ':' + Math.floor(now / 2); if (rcache.k === k) return rcache.v; const t1 = t1ms(), evs = V.events.filter(e => e.agent === id || (e.route || []).some(r => r[0] === id || r[1] === id)), mine = evs.filter(e => e.agent === id);
    const hourly = Array(24).fill(0), steps = {}; mine.forEach(e => { const h = Math.floor((t1 - new Date(e.time).getTime()) / 36e5); if (h >= 0 && h < 24) { hourly[23 - h]++; const s = stepOf(e); steps[s] = (steps[s] || 0) + 1; } });
    const pm = new Map(); links.forEach(l => { if (l.f !== id && l.t !== id) return; const o = l.f === id ? l.t : l.f; pm.set(o, (pm.get(o) || 0) + (l.count || 0)); });
    const partners = [...pm.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5); const r = rowOf(id), mx = k => Math.max(1, ...(V.I?.board?.rows || []).map(x => x[k] || 0)), sh = V.I?.streams?.rows?.[id]?.share;
    const bars = [['medal', r?.score, r?.score], ['zap', r?.w7 != null ? r.w7 / mx('w7') * 100 : null, r?.w7], ['target', r?.eff != null ? r.eff * 100 : null, r?.eff != null ? Math.round(r.eff * 100) : null], ['route', sh != null ? sh * 100 : null, sh != null ? Math.round(sh * 100) : null]];
    if (N.get(id)?.kind === 'human') { const wc = PUB ? (V.waitingCount ?? null) : V.waiting.filter(w => !w.answer).length; bars.length = 0; bars.push(['hourglass', wc != null ? Math.min(100, wc * 10) : null, wc], ['check', V.approvals != null ? Math.min(100, V.approvals * 10) : null, V.approvals]); }
    const v = { t1, recent: evs.slice(-6).reverse(), mine, hourly, steps, partners, bars, rank: r?.rank, n7: r?.w7 }; rcache = { k, v }; return v; }
  const ageOf = (t1, e) => { const h = Math.max(0, (t1 - new Date(e.time).getTime()) / 36e5); return h < 1 ? Math.max(1, Math.round(h * 60)) + 'M' : h < 48 ? Math.round(h) + 'H' : Math.round(h / 24) + 'D'; };
  const hit = (x, y, w, h, fn) => ui.push({ x: x - 4, y: y - 4, w: w + 8, h: h + 8, fn });
  function drawRoom() {
    const id = roomId, n = N.get(id) || N.get('hub'), hc = n.hue, P = PAL(), d = rdata(id), wide = S.w > 220, T = now - roomT0, mob = MOB(); ui = [];
    const fy = S.y0 + (wide ? 74 : 78), ink = P.txt;
    g.setTransform(1, 0, 0, 1, 0, 0); Rc(g, 0, 0, bw, fy, mix(P.wall, hc, 0.16)); for (let x = 0; x < bw; x += 8) Rc(g, x, 0, 1, fy, mix(P.wall, hc, 0.24)); Rc(g, 0, fy - 3, bw, 3, wood());
    for (let y = fy; y < bh; y += 8) for (let x = 0; x < bw; x += 8) Rc(g, x, y, 8, 8, mix(((x + y) >> 3) & 1 ? P.floor1 : P.floor2, hc, 0.1));
    const pr = propsOf(id), s = wide ? 3 : 2, HANG = { window: 1, banner: 1, board: 1, shieldrack: 1 };
    pr.forEach((nm, i) => { const x = Math.round(S.x0 + (S.w - 16 * s) * (pr.length === 1 ? 0.5 : i / (pr.length - 1))), y = HANG[nm] ? S.y0 + 14 : fy + 4 - 16 * s; if (!(wide && i === 0 && false)) prop(nm, x, y, s, now, hc); });
    panel(S.x0, S.y0, 15, 13, P.panel, P.edge); g.drawImage(ico('rewind', ink, 9), S.x0 + 3, S.y0 + 2); hit(S.x0, S.y0, 15, 13, () => api.select(null));
    const k = 4, cxh = wide ? S.x0 + 56 : Math.round((S.x0 + S.x1) / 2), feet = fy + (wide ? 72 : 88); const hv = tagOf(id), [pose, f] = poseOf(n.kind === 'human' || n.kind === 'agent' || n.kind === 'sub' ? n : { ...n, id, ph: 0, pulse: 0, heat: 1, cheer: 0 });
    for (let i = 0; i < 4; i++) Rc(g, cxh - 30 + i * 2, feet - 4 + i, 60 - i * 4, 1, i < 2 ? hc : shade(hc, -0.3)); Rc(g, cxh - 26, feet, 52, 1, mix(P.floor2, '#000000', 0.4));
    if (n.kind === 'res') { const ic = id === 'hub' ? 'hub' : id === 'drive' ? 'drive' : id; const b = Math.floor(now * 2) & 1; Rc(g, cxh - 22, feet - 54, 44, 50, STONE); Rc(g, cxh - 20, feet - 52, 40, 46, P.panel); g.drawImage(ico(ic, hc === C.sub ? '#fff' : hc, 24), cxh - 12, feet - 42 - b); }
    else { const jump = n.cheer > 0 ? Math.round(Math.abs(Math.sin(n.cheer * 9)) * 6) : 0; g.drawImage(spr(id, pose, f), 0, 0, 16, 20, cxh - 8 * k, feet - 19 * k - jump, 16 * k, 20 * k); }
    hit(cxh - 30, feet - 80, 60, 80, () => { n.cheer = 0.8; });
    statusIcon(cxh, feet - 19 * k - 12, { ...n, id, ph: 0 });
    const cur = n.last && (n.last.agent === id || (n.last.route || []).some(r => r[0] === id || r[1] === id)) ? n.last : d.recent[0];
    if (cur) { const bx = cxh + 26, by = feet - 19 * k - 14; panel(bx, by, 22, 20, '#fff', OUT_DARK); g.drawImage(ico(stepIcon(cur), INK, 14), bx + 4, by + 3); Rc(g, bx - 2, by + 16, 3, 3, '#fff'); }
    let y2 = feet + 6;
    if (!mob && cur) { const txt = (V.A[id]?.name ? '' : '') + clean(cur.summary), shown = txt.slice(0, Math.floor(T * 45)), lw = Math.floor((wide ? 100 : S.w - 8) / 4), W0 = wide ? 106 : S.w; panel(S.x0, y2, W0, 28, P.panel, P.edge); const lines = []; let line = ''; shown.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > lw) { lines.push(line); line = w; } else line = (line + ' ' + w).trim(); }); lines.push(line); lines.slice(0, 3).forEach((l, i) => text(g, l, S.x0 + 4, y2 + 4 + i * 7, i === 0 ? ink : P.sub)); y2 += 32; }
    const col = wide ? { x: S.x0 + 120, w: S.w - 120 } : { x: S.x0, w: S.w }; let y = wide ? S.y0 + 16 : feet + 12;
    const cw = col.w / STEPS.length; STEPS.forEach((st, i) => { const cx = Math.round(col.x + cw * (i + 0.5)), cnt = d.steps[st.id] || 0, lit = cnt > 0, fl = lit && (Math.floor(now * 4 + i) & 3) === 0;
      Rc(g, cx, y + 11, 1, 6, '#5b4128'); panel(cx - 6, y, 13, 12, lit ? (fl ? '#fff3c4' : GOLD) : mix(P.wall, '#000000', 0.25), OUT_DARK); g.drawImage(ico(st.icon, lit ? INK : P.sub, 9), cx - 4, y + 1); if (lit) text(g, Math.min(9, cnt), cx - 1, y + 18, ink); });
    y += 26;
    d.bars.forEach(([ic, p, v], i) => { const x = col.x + 2, yy = y + i * 9; g.drawImage(ico(ic, ink, 7), x, yy); for (let q = 0; q < 10; q++) Rc(g, x + 10 + q * 6, yy + 1, 5, 5, p != null && q < Math.round(p / 10) ? (q > 7 ? GOLD : hc) : mix(P.wall, '#000000', 0.3)); text(g, v == null ? '-' : v, x + 74, yy + 1, ink); });
    if (d.rank) { g.drawImage(ico('trophy', GOLD, 8), col.x + col.w - 14, y - 1); text(g, d.rank, col.x + col.w - 15, y + 1, GOLD, 1, 'r'); } y += 40;
    const bwid = Math.max(3, Math.floor(col.w / 24) - 1), mxh = Math.max(1, ...d.hourly); panel(col.x, y, 24 * (bwid + 1) + 2, 22, P.panel, P.edge); d.hourly.forEach((v, i) => { const h = v ? 2 + Math.round(v / mxh * 15) : 1; Rc(g, col.x + 1 + i * (bwid + 1), y + 20 - h, bwid, h, i === 23 ? GOLD : v ? hc : mix(P.wall, '#000000', 0.3)); }); y += 26;
    const nChip = Math.floor(col.w / 30); d.recent.slice(0, nChip).forEach((e, i) => { const x = col.x + i * 30; panel(x, y, 28, 12, '#fff', OUT_DARK); g.drawImage(ico(stepIcon(e), INK, 9), x + 2, y + 1); text(g, ageOf(d.t1, e), x + 13, y + 4, INK); }); y += 16;
    d.partners.slice(0, Math.floor(col.w / 32)).forEach(([o, c], i) => { const x = col.x + i * 32, on = N.get(o); if (!on) return; panel(x, y, 30, 25, P.panel, P.edge); if (on.kind === 'res' || on.kind === 'session') g.drawImage(ico(o === 'hub' ? 'hub' : o === 'drive' ? 'drive' : 'sparkles', ink, 12), x + 9, y + 2); else g.drawImage(spr(o, 'idle', 0), 0, 3, 16, 14, x + 7, y + 2, 16, 14); text(g, c || '-', x + 15, y + 18, ink, 1, 'c'); hit(x, y, 30, 25, () => api.select(o)); });
    const ids = [TR.top, TR.second, ...TR.rest].filter(Boolean), ix = Math.max(0, ids.indexOf(id)), cap = Math.max(3, Math.min(ids.length, Math.floor((S.w - 28) / 13))), sy = S.y1 - 14;
    panel(S.x0, sy - 2, S.w, 16, P.panel, P.edge); text(g, '<', S.x0 + 4, sy + 3, ink); hit(S.x0, sy - 2, 12, 16, () => api.select(ids[(ix + ids.length - 1) % ids.length])); text(g, '>', S.x1 - 8, sy + 3, ink); hit(S.x1 - 12, sy - 2, 12, 16, () => api.select(ids[(ix + 1) % ids.length]));
    const st0 = Math.max(0, Math.min(ids.length - cap, ix - (cap >> 1))), x0 = Math.round(S.x0 + (S.w - cap * 13) / 2);
    for (let i = 0; i < cap; i++) { const oid = ids[st0 + i], x = x0 + i * 13, cur2 = oid === id; if (cur2) Rc(g, x - 1, sy - 1, 13, 13, GOLD); Rc(g, x, sy, 11, 11, mix(P.wall, N.get(oid).hue, 0.35)); g.drawImage(spr(oid, 'idle', 0), 3, 1, 10, 10, x, sy, 10, 10); hit(x, sy, 11, 11, () => api.select(oid)); }
  }
  function drawShutter() { if (!trans) return; const P = PAL(), a = trans.t < 1 ? trans.t : 2 - trans.t, stripes = 14, sh = Math.ceil(bh / stripes); for (let i = 0; i < stripes; i++) { const w = Math.min(bw, Math.round(bw * Math.min(1, Math.max(0, a * 1.5 - (i % 7) * 0.07)))); Rc(g, i & 1 ? bw - w : 0, i * sh, w, sh, P.edge); } }
  const ZMAX = () => MOB() ? 4 : 5;
  const clampCam = () => { const vw = bw / cam.z, vh = bh / cam.z; cam.tx = Math.max(0, Math.min(bw - vw, cam.tx)); cam.ty = Math.max(0, Math.min(bh - vh, cam.ty)); if (cam.z === 1) cam.tx = cam.ty = 0; };
  const zoomAt = (nz, bx, by) => { nz = Math.max(1, Math.min(ZMAX(), Math.round(nz))); if (nz === cam.z) return; const wx = cam.tx + bx / cam.z, wy = cam.ty + by / cam.z; cam.z = nz; cam.tx = wx - bx / nz; cam.ty = wy - by / nz; cam.x = cam.tx; cam.y = cam.ty; clampCam(); };
  const toBuf = (cx, cy) => { const r = canvas.getBoundingClientRect(); return [(cx - r.left) * bw / (r.width || 1), (cy - r.top) * bh / (r.height || 1)]; };
  const toWorld = (bx, by) => [cam.x + bx / cam.z, cam.y + by / cam.z];
  const pickW = (wx, wy) => { let best = null, bd = 1e9; const pad = MOB() ? 5 : 2; N.forEach((n, id) => { let dx = wx - n.x, dy = wy - (n.y - 10); const rx = (n.kind === 'res' ? 11 : n.kind === 'session' ? 6 : 9) + pad, ry = (n.kind === 'res' ? 15 : n.kind === 'session' ? 6 : 14) + pad; if (Math.abs(dx) <= rx && Math.abs(dy) <= ry) { const dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = id; } } }); return best; };
  const Pm = new Map(); let g0 = null, moved = 0, downT = 0, multi = false, lastTap = { t: -9, x: 0, y: 0 }, accZ = 1;
  canvas.addEventListener('pointerdown', ev => { try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic */ } Pm.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); if (Pm.size === 1) { moved = 0; downT = ev.timeStamp; multi = false; } else multi = true; g0 = null; accZ = 1; tourStop(); });
  canvas.addEventListener('pointermove', ev => { const q = Pm.get(ev.pointerId);
    if (!q) { if (ev.pointerType === 'mouse') { const [bx, by] = toBuf(ev.clientX, ev.clientY); let id = null; if (view === 'world') id = pickW(...toWorld(bx, by)); else id = null; if (id !== hoverId) { hoverId = id; opt.onHover?.(id, ev.clientX, ev.clientY); } else if (id) opt.onHover?.(id, ev.clientX, ev.clientY); canvas.style.cursor = id || (view === 'room' && ui.some(u => bx >= u.x && bx <= u.x + u.w && by >= u.y && by <= u.y + u.h)) ? 'pointer' : 'grab'; } return; }
    const dx = ev.clientX - q.x, dy = ev.clientY - q.y; q.x = ev.clientX; q.y = ev.clientY; moved += Math.abs(dx) + Math.abs(dy); if (view !== 'world') return;
    const sx = bw / (canvas.getBoundingClientRect().width || 1);
    if (Pm.size === 1) { if (moved > 8) { cam.tx -= dx * sx / cam.z; cam.ty -= dy * sx / cam.z; clampCam(); cam.x = cam.tx; cam.y = cam.ty; } }
    else if (Pm.size >= 2) { const [a, b] = [...Pm.values()], d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; if (g0) { if (d > 4 && g0.d > 4) { accZ *= d / g0.d; if (accZ > 1.35) { const [bx, by] = toBuf(m.x, m.y); zoomAt(cam.z + 1, bx, by); accZ = 1; } else if (accZ < 0.74) { const [bx, by] = toBuf(m.x, m.y); zoomAt(cam.z - 1, bx, by); accZ = 1; } } cam.tx -= (m.x - g0.m.x) * sx / cam.z; cam.ty -= (m.y - g0.m.y) * sx / cam.z; clampCam(); cam.x = cam.tx; cam.y = cam.ty; } g0 = { d, m }; } });
  const up = ev => { if (!Pm.has(ev.pointerId)) return; Pm.delete(ev.pointerId); g0 = null;
    if (Pm.size === 0 && !multi && moved < 10 && ev.timeStamp - downT < 600) { const [bx, by] = toBuf(ev.clientX, ev.clientY), tNow = ev.timeStamp / 1000;
      if (view === 'room') { const u = ui.find(u => bx >= u.x && bx <= u.x + u.w && by >= u.y && by <= u.y + u.h); u?.fn(); return; }
      const id = pickW(...toWorld(bx, by)), dbl = tNow - lastTap.t < 0.45 && Math.hypot(bx - lastTap.x, by - lastTap.y) < 14; lastTap = dbl ? { t: -9, x: 0, y: 0 } : { t: tNow, x: bx, y: by };
      if (dbl && !id) { api.reset(); } else if (id) api.select(id, true); else api.select(null); } };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse' && !Pm.size && hoverId) { hoverId = null; opt.onHover?.(null); } });
  canvas.addEventListener('wheel', ev => { ev.preventDefault(); if (view !== 'world') return; const [bx, by] = toBuf(ev.clientX, ev.clientY); zoomAt(cam.z + (ev.deltaY < 0 ? 1 : -1), bx, by); }, { passive: false });
  canvas.addEventListener('contextmenu', ev => ev.preventDefault());
  addEventListener('keydown', ev => { if (view !== 'room' || ev.target?.closest?.('input,textarea,select')) return; const ids = [TR.top, TR.second, ...TR.rest].filter(Boolean), ix = ids.indexOf(roomId); if (ev.key === 'ArrowRight') api.select(ids[(ix + 1) % ids.length]); else if (ev.key === 'ArrowLeft') api.select(ids[(ix + ids.length - 1) % ids.length]); });
  const focus = (ids, z) => { const ns = ids.map(i => N.get(i)).filter(Boolean); if (!ns.length) return; const cx = ns.reduce((s, n) => s + n.x, 0) / ns.length, cy = ns.reduce((s, n) => s + n.y - 10, 0) / ns.length; cam.z = Math.min(z, ZMAX()); cam.tx = cx - bw / cam.z / 2; cam.ty = cy - bh / cam.z / 2; clampCam(); };
  const stopsOf = () => { const st = [{ key: 'overview', ids: [], z: 1 }]; if (TR.top) st.push({ key: 'damon', ids: [TR.top], z: 3 }); if (TR.second) st.push({ key: 'viv', ids: [TR.second], z: 3 }); const team = ['reed', 'evelyn', 'dutchess'].filter(i => N.has(i)); if (team.length) st.push({ key: 'team', ids: team, z: 2, room: team[0] }); const sk = TR.subs.filter(i => N.has(i)); if (sk.length) st.push({ key: 'skills', ids: sk, z: 2, room: sk[0] });
    const ceo = N.has('ceo') ? 'ceo' : TR.rest[0]; if (ceo) st.push({ key: 'staff', ids: TR.rest, z: 1, room: ceo }); st.push({ key: 'infra', ids: ['hub', 'drive'].filter(i => N.has(i)), z: 2 }); st.push({ key: 'overview', ids: [], z: 1 }); return st; };
  const goStop = s => { if (view === 'room') api.select(null); if (s.ids.length) focus(s.ids, s.z); else { cam.z = 1; cam.tx = cam.ty = 0; } cam.x = cam.tx; cam.y = cam.ty; opt.onTour?.(s, tourS.i, tourS.stops.length); if (s.room) tourS.pendingRoom = { id: s.room, at: 2.6 }; else tourS.pendingRoom = null; };
  const tourStop = () => { if (tourS.on) { tourS.on = false; opt.onTour?.(null); } };
  const api = {
    paused: false, style: 'retro', rig: { r: 1, fitR: 1 },
    get selected() { return selected; }, get nodes() { return N; }, get touring() { return tourS.on; }, get view() { return view; }, get cam() { return cam; },
    setTheme() { SC = new Map(); ICC.clear(); if (built) { N.forEach(n => { if (n.kind !== 'res' && n.kind !== 'session') n.hue = hueOfId(n.id); }); paintTerrain(); } },
    rebuild(nv) { V = nv; const sel = selected; build(); selected = sel && N.has(sel) ? sel : null; if (!selected) { view = 'world'; roomId = null; } },
    enter() { },
    resize(w, h) { W = Math.max(1, w); H = Math.max(1, h); ps = MOB() ? 2 : Math.max(2, Math.round(Math.min(W / 480, H / 300))); bw = Math.ceil(W / ps); bh = Math.ceil(H / ps); const nw = bw, nh = bh; if (canvas.width !== nw || canvas.height !== nh || !built) { canvas.width = nw; canvas.height = nh; g.imageSmoothingEnabled = false; build(); } },
    project(id) { const n = N.get(id); if (!n || view !== 'world') return null; return { x: (n.x - cam.x) * cam.z * W / bw, y: (n.y - 10 - cam.y) * cam.z * H / bh, z: 0, px: 30 }; },
    pick(x, y) { if (view !== 'world') return null; return pickW(...toWorld(x * bw / W, y * bh / H)); },
    select(id, fly = true) { tourS.pendingRoom = null; const prev = selected; if (!id) { selected = null; opt.onSelect?.(null); if (view === 'room') trans = { t: 0, swap: () => { view = 'world'; roomId = null; } }; return; }
      selected = id; opt.onSelect?.(id); const r = rid(id), n = N.get(id); if (n) { n.cheer = 0.7; }
      if (view === 'room') { roomId = r; roomT0 = now; rcache.k = ''; } else trans = { t: 0, swap: () => { view = 'room'; roomId = r; roomT0 = now; rcache.k = ''; } }; },
    reset() { tourStop(); cam.z = 1; cam.tx = cam.ty = cam.x = cam.y = 0; if (view === 'room') api.select(null); },
    orbit(dx, dy) { if (view === 'world') { cam.tx -= dx * 40; cam.ty -= dy * 40; clampCam(); cam.x = cam.tx; cam.y = cam.ty; } },
    zoom(k) { if (view === 'world') zoomAt(cam.z + (k < 1 ? 1 : -1), bw / 2, bh / 2); },
    tour(on) { tourS.on = on ?? !tourS.on; if (tourS.on) { tourS.stops = stopsOf(); tourS.i = 0; tourS.t = 0; goStop(tourS.stops[0]); } else { opt.onTour?.(null); } return tourS.on; },
    event(e) { const a = N.get(e.agent); (e.route || []).forEach(([f, t]) => { const A = N.get(f), B = N.get(t); if (A && B && A !== B && items.length < 14) items.push({ f, t, u: 0, v: 0.55 + (fnv(f + t) % 20) / 100, icon: stepIcon(e), col: A.kind === 'res' ? STONE : A.hue }); });
      if (a) { a.pulse = 1; a.last = e; rcache.k = ''; if (!(e.route || []).length && bursts.length < 6) bursts.push({ x: a.x, y: a.y - 12, t: 0, p: Array.from({ length: 6 }, (_, i) => ({ x: 0, y: 0, vx: Math.cos(i * 1.05) * 22, vy: Math.sin(i * 1.05) * 22 - 6, c: [GOLD, '#fff', a.hue][i % 3] })) }); }
      tick = { text: '> ' + clean(e.summary).slice(0, 70), t0: now }; },
    frame(t, dt) { if (!built) return; dt = Math.min(dt || 0.016, 0.1); now = t; if (now - (api._ld || -1) < 1 / 34 && !trans) return; const adt = Math.min(0.1, now - (api._ld || now - 0.033)); api._ld = now; if (api.paused) { /* still draw */ }
      N.forEach(n => { n.pulse *= Math.pow(0.3, adt); if (n.cheer > 0) n.cheer = Math.max(0, n.cheer - adt); });
      flows.forEach(fl => { fl.u = (fl.u + fl.v * adt * (opt.reduced ? 0.2 : 1)) % 1; });
      items = items.filter(it => { it.u += adt * it.v; if (it.u >= 1) { const b = N.get(it.t); if (b) { b.pulse = 1; b.cheer = 0.6; if (bursts.length < 6) bursts.push({ x: b.x, y: b.y - 14, t: 0, p: Array.from({ length: 6 }, (_, i) => ({ x: 0, y: 0, vx: Math.cos(i * 1.05) * 20, vy: Math.sin(i * 1.05) * 20 - 6, c: [GOLD, '#fff', it.col][i % 3] })) }); } return false; } return true; });
      bursts = bursts.filter(b => { b.t += adt; b.p.forEach(p => { p.x += p.vx * adt; p.y += p.vy * adt; p.vy += 40 * adt; }); return b.t < 0.5; });
      cam.x += (cam.tx - cam.x) * (1 - Math.exp(-adt * 10)); cam.y += (cam.ty - cam.y) * (1 - Math.exp(-adt * 10)); if (Math.abs(cam.tx - cam.x) < 0.3) cam.x = cam.tx; if (Math.abs(cam.ty - cam.y) < 0.3) cam.y = cam.ty;
      if (trans) { trans.t += adt / 0.22; if (trans.t >= 1 && trans.swap) { trans.swap(); trans.swap = null; } if (trans.t >= 2) trans = null; }
      if (tourS.on) { tourS.t += adt; const pr = tourS.pendingRoom; if (pr && tourS.t > pr.at && view !== 'room') { tourS.pendingRoom = null; const keep = tourS.on; api.select(pr.id); tourS.on = keep; } if (tourS.t > 5.2) { tourS.t = 0; tourS.i++; if (tourS.i >= tourS.stops.length) { tourS.on = false; opt.onTour?.(null); if (view === 'room') api.select(null); } else goStop(tourS.stops[tourS.i]); } }
      if (view === 'room') drawRoom(); else drawWorld(adt); drawShutter(); },
  };
  try { api.resize(canvas.clientWidth || 390, canvas.clientHeight || 844); } catch (e) { /* app calls resize after fonts */ }
  return api;
}
