import { C, THEME } from './palette.js';

export const TOP = ['ceo', 'reed', 'evelyn', 'dutchess', 'viv', 'motion', 'friend', 'agent_builder', 'product_manager', 'cto'];
export const HUES = {
  ceo:           { name: 'CEO',           dark: '#6ea8ff', light: '#1a5fd0', family: 'blue (Google blue 800)' },
  reed:          { name: 'Reed',          dark: '#34d6f0', light: '#007b83', family: 'cyan / teal (Google cyan 900)' },
  evelyn:        { name: 'Evelyn',        dark: '#5ee08a', light: '#188038', family: 'green (Google green 700)' },
  dutchess:      { name: 'Dutchess',      dark: '#c4a1ff', light: '#7c3aed', family: 'violet (Google purple 700)' },
  viv:           { name: 'Viv',           dark: '#ff7ac6', light: '#c5197d', family: 'magenta (Google pink 700)' },
  motion:        { name: 'Motion',        dark: '#ffad5c', light: '#b35c00', family: 'amber-orange (hue 31, kept clear of red)' },
  friend:        { name: 'Friend',        dark: '#ffd84d', light: '#7a6400', family: 'yellow (Microsoft yellow, darkened)' },
  agent_builder: { name: 'Agent Builder', dark: '#c3cdd9', light: '#5b6670', family: 'silver / slate (Microsoft grey)' },
  product_manager: { name: 'Product Manager', dark: '#e0b48a', light: '#875a2c', family: 'brown / caramel (hue 30)' },
  cto:           { name: 'CTO',           dark: '#b8e86a', light: '#4d7c0f', family: 'lime / olive (Tailwind lime 700)' },
  damon:         { name: 'Damon (human)', dark: '#ffeecc', light: '#9a5b00', family: 'cream / amber (human gate)' },
};
export const ACCENTS = [
  { name: 'white / ink', dark: '#ffffff', light: '#202124' },
  { name: 'mint / forest', dark: '#b9f6ca', light: '#1b5e20' },
  { name: 'ice / navy', dark: '#b3e5fc', light: '#0d47a1' },
  { name: 'lilac / plum', dark: '#e1bee7', light: '#6a1b9a' },
  { name: 'peach / brown', dark: '#ffd6a5', light: '#6d4c41' },
  { name: 'lemon / olive', dark: '#fff59d', light: '#5d5d00' },
];
export const GLYPHS = ['◆', '▲', '●', '■', '✚', '★'];
const PIN = { skill_finder: [0, 0], up_skiller: [1, 1], 'ceo-weeds-loop': [2, 2] };
const fnv = s => { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
export const accentIx = id => PIN[id] || [fnv(id) % ACCENTS.length, fnv('g:' + id) % GLYPHS.length];

export const SUB_STATIC = {
  skill_finder: { parent: 'ceo', known: true, host: 'team VPS container', why: 'CEO built it and runs it (CEO message relayed Oct 20 ~20:38 ET; cron + on demand by CEO)' },
  up_skiller:   { parent: 'ceo', known: true, host: 'team VPS container', why: 'CEO built it and runs it (CEO message relayed Oct 20 ~20:38 ET; cron 30 min after Skill-Finder)' },
};
export const parentOf = id => SUB_STATIC[id]?.parent || null;
export const isSub = id => !!SUB_STATIC[id];
const tv = o => (o ? o[THEME === 'light' ? 'light' : 'dark'] : null);
export const hue = id => tv(HUES[id]) || tv(HUES[parentOf(id)]) || C.sub;
export const accent = id => { const [a, g] = accentIx(id); return { color: tv(ACCENTS[a]), name: ACCENTS[a].name, glyph: GLYPHS[g], ix: a }; };
export const STATUS_RING = (tag, blocked) => tag === 'waiting' || tag === 'human' ? { color: C.waiting, style: 'dashed', width: 2, label: 'waiting on damon' }
  : tag === 'pending' ? { color: C.sub, style: 'dashed', width: 1.5, label: 'pending setup' }
  : tag === 'idle' ? { color: C.dim, style: 'dotted', width: 1.5, label: 'idle' }
  : { color: C.sub, style: 'solid', width: 1, alpha: 0.55, label: 'active' };

const AG = { product_manager: 'product_manager', reed: 'reed', evelyn: 'evelyn', dutchess: 'dutchess', ceo: 'ceo', viv: 'viv', motion: 'motion', friend: 'friend', cto: 'cto' };
const KNOWN_POSTERS = new Set(['ceo', 'reed', 'evelyn', 'dutchess', 'viv', 'damon', 'skill-finder', 'up-skiller', 'motion', 'friend', 'product-manager', 'pm', 'cto']);
const hubTs = s => { const m = /^(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)(\d\d)/.exec(s || ''); return m ? new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString() : null; };
export function subAgents(V, opts = {}) {
  const maxPer = opts.maxPer ?? 3, windowH = opts.windowH ?? 48;
  const iso = t => { const d = t ? new Date(t) : null; return d && !isNaN(d) ? d.toISOString() : null; };
  const S = new Map(); const put = (id, o) => { o.last_seen = iso(o.last_seen); const p = S.get(id); if (!p || (o.last_seen || '') > (p.last_seen || '')) S.set(id, { ...p, ...o, seen: (p?.seen || 0) + 1 }); else p.seen++; };
  Object.entries(SUB_STATIC).forEach(([id, s]) => S.set(id, { id, name: V.A[id]?.name || id, kind: 'agent', parent: s.parent, known: true, host: s.host, why: s.why, last_seen: iso(V.A[id]?.last_active), seen: 1, static: true }));
  (V.events || []).forEach(e => { const re = /\b(Reed|Evelyn|Dutchess)\s*\(session (s:[\w-]+)\)/g; let m; while ((m = re.exec(e.summary || ''))) {
    const par = AG[m[1].toLowerCase()], key = m[2].replace('s:', ''); put(`s:${par}:${key}`, { id: `s:${par}:${key}`, name: `${par} · ${key}`, kind: 'session', parent: par, known: true, why: 'R-a: OpenClaw session runs as ' + m[1] + ' (timeline: "' + m[1] + ' (session ' + m[2] + ')")', last_seen: e.time }); } });
  const msgs = V.D.hub_raw || [];
  msgs.forEach(m => { const ts = hubTs(m.ts), a = String(m.agent || '');
    const w = /started (\w+) on:.*\(session ([\w-]+)\)/.exec(m.body || ''); if (w && AG[w[1].toLowerCase()]) { const par = AG[w[1].toLowerCase()]; put(`s:${par}:${w[2]}`, { id: `s:${par}:${w[2]}`, name: `${par} · ${w[2]}`, kind: 'session', parent: par, known: true, why: `R-a: session runs as ${w[1]} (hub #${m.ch}, started by ${a})`, last_seen: ts }); }
    const low = a.toLowerCase(); if (KNOWN_POSTERS.has(low)) return;
    const pre = /^([a-z]+)-/.exec(low); if (pre && AG[pre[1]]) put(low, { id: low, name: a, kind: 'loop', parent: AG[pre[1]], known: true, why: `R-c: hub poster "${a}" carries the ${pre[1].toUpperCase()} prefix (#${m.ch})`, last_seen: ts });
    else put(low, { id: low, name: a, kind: 'poster', parent: null, known: false, why: `R-d: hub poster "${a}" (#${m.ch}); no source names who runs it`, last_seen: ts }); });
  const all = [...S.values()]; const newest = all.reduce((x, s) => (s.last_seen && s.last_seen > x ? s.last_seen : x), '');
  const cut = newest ? new Date(new Date(newest).getTime() - windowH * 36e5).toISOString() : '';
  const keep = all.filter(s => s.kind !== 'session'); const byP = {};
  all.filter(s => s.kind === 'session' && (s.last_seen || '') >= cut).sort((a, b) => (b.last_seen || '').localeCompare(a.last_seen || '')).forEach(s => { byP[s.parent] = (byP[s.parent] || 0) + 1; if (byP[s.parent] <= maxPer) keep.push(s); });
  const sib = {}; return keep.sort((a, b) => String(a.parent).localeCompare(String(b.parent)) || ((b.static ? 1 : 0) - (a.static ? 1 : 0)) || a.id.localeCompare(b.id))
    .map(s => ({ ...s, n: (sib[s.parent] = (sib[s.parent] || 0) + 1), hue: s.known ? hue(s.parent) : C.sub, accent: accent(s.id) }));
}
