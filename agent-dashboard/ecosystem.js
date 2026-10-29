import { C, rgba, MONO, SANS, THEME } from './palette.js';
import { hue } from './identity.js';
import { drawIcon, svg } from './icons.js';
import { AICON } from './pipeline.js';

const PUB = !!window.DASH_PUBLIC;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const H2 = 2 * 3600e3, H24 = 24 * 3600e3;
const MCOL = { grok: ['#6ea8ff', '#1a5fd0'], oracle: ['#ffb454', '#a85a00'], contabo: ['#5ee0c1', '#00796b'], pc_main: ['#c9d3df', '#4d5865'], pc_old: ['#9aa7b8', '#6b7684'], iphone: ['#ffd84d', '#7a6400'], android_phone: ['#9be564', '#2e7d32'], android_tab: ['#7fe0ff', '#00799c'] };
const ECOL = ['#8fa8ff', '#3949ab'];
const ICON_M = { grok: 'sparkles', oracle: 'server', contabo: 'server', pc_main: 'monitor', pc_old: 'laptop', iphone: 'smartphone', android_phone: 'smartphone', android_tab: 'tablet' };
const ICON_E = { github: 'github', gdrive: 'drive', vercel: 'triangle', render: 'layers', netlify: 'globe', cloudflare: 'cloud', replit: 'terminal', base44: 'sparkles', polsia: 'store', hostinger: 'server' };
const MPOS_ORDER = ['grok', 'oracle', 'contabo'];

const mname = o => PUB ? (o.pub ?? o.name) : (o.name ?? o.pub);
const SHORT = { viv: 'Viv', product_manager: 'Product Mgr', agent_builder: 'Agent Builder', dutchess: 'Dutchess', finisher: 'Finisher', damon: 'Damon' };
const tsOf = s => { if (!s) return 0; const t = typeof s === 'number' ? s : Date.parse(s); return isNaN(t) ? 0 : t; };
const hubT = ts => Date.UTC(+ts.slice(0, 4), +ts.slice(4, 6) - 1, +ts.slice(6, 8), +ts.slice(9, 11), +ts.slice(11, 13), +ts.slice(13, 15));
const agoS = t => { if (!t) return 'unknown'; const s = Math.max(0, (Date.now() - t) / 1000); if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' d ago'; };
const etFmt = t => { if (!t) return 'unknown'; return new Date(t).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' ET'; };
const etDay = t => { if (!t) return 'unknown'; return new Date(t).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' }); };

export function createEco(wrap, V, opt = {}) {
  wrap.innerHTML = `<canvas id="eco"></canvas><div id="eco-tip" hidden></div><div id="eco-stats"></div><div id="eco-fab"></div><div id="eco-leg"></div><aside id="eco-panel" hidden></aside><div id="eco-hint" aria-hidden="true"></div>`;
  const cv = wrap.querySelector('#eco'), ctx = cv.getContext('2d'), tip = wrap.querySelector('#eco-tip'), panel = wrap.querySelector('#eco-panel'), stats = wrap.querySelector('#eco-stats'), fab = wrap.querySelector('#eco-fab'), leg = wrap.querySelector('#eco-leg'), hint = wrap.querySelector('#eco-hint');
  let W = 800, H = 600, dpr = 1, mob = false;
  const cam = { x: 0, y: 0, z: 1, tx: 0, ty: 0, tz: 1, user: false };
  let plates = [], nodes = [], byId = new Map(), links = [], bbox = null, selected = null, hover = null, sig = '', tnow = 0;
  const E = () => V.D.ecosystem || null;
  const AG = () => V.D.agents || [];

  const evAt = {};
  const lastEv = id => { let t = 0; for (const e of V.events || []) if (e.agent === id) { const x = tsOf(e.time); if (x > t) t = x; } return t; };
  const stateOf = id => {
    if (id === 'damon') return { s: 'human', t: 0 };
    const p = E()?.profiles?.[id]; let t = Math.max(tsOf(p?.last_work), lastEv(id));
    for (const m of V.D.hub_snapshot?.messages || []) { /* hub posts are already merged into V.events */ }
    const age = Date.now() - t;
    if (!t) return { s: 'idle', t: 0 };
    return { s: age < H2 ? 'working' : age < H24 ? 'recent' : 'idle', t };
  };
  const taskOf = id => {
    const p = E()?.profiles?.[id] || {}, st = stateOf(id); let ev = null, et = 0;
    for (const e of V.events || []) if (e.agent === id) { const x = tsOf(e.time); if (x > et) { et = x; ev = e; } }
    const clean = s => String(s || '').replace(/^#[\w-]+:\s*/, '').trim();
    const ct = tsOf(p.current?.ts);
    if (p.current && ct > et) return { text: p.current.text, t: ct, kind: 'assigned', note: st.s === 'idle' ? 'Assigned, no work logged since' : 'Assigned' };
    if (ev) return { text: clean(ev.summary), t: et, kind: st.s === 'idle' ? 'last' : 'now', note: st.s === 'idle' ? 'Idle. Last logged work' : st.s === 'working' ? 'Working now' : 'Latest work (within 24 h)' };
    return null;
  };
  const done24 = id => { const p = E()?.profiles?.[id]; const now = Date.now(); const a = (p?.done_times || []).map(tsOf); return { n24: a.filter(t => now - t < H24).length, n7: a.filter(t => now - t < 7 * H24).length, total: a.length, last: a.length ? Math.max(...a) : 0 }; };
  const counts = () => { const c = { working: 0, recent: 0, idle: 0 }; for (const n of nodes) if (n.type === 'agent') c[n.st.s]++; return c; };

  const AGENT_ORDER = ['ceo', 'cto', 'cso', 'product_manager', 'agent_builder', 'friend', 'motion'];
  const VPS_AGENTS = ['reed', 'evelyn', 'dutchess', 'skill_finder', 'up_skiller', 'gemforce', 'finisher'];
  function layout() {
    const e = E(); nodes = []; byId = new Map(); links = []; if (!e) return;
    const add = n => { n.st = n.type === 'agent' ? stateOf(n.id) : { s: 'none', t: 0 }; nodes.push(n); byId.set(n.id, n); return n; };
    const agents = new Set(Object.keys(e.profiles || {}));
    const devs = e.machines.filter(m => m.device), servers = e.machines.filter(m => !m.device);
    const grokTeam = AGENT_ORDER.filter(i => agents.has(i)), vpsTeam = VPS_AGENTS.filter(i => agents.has(i));
        if (!mob) {
      const CX = 800;
      add({ id: 'damon', type: 'agent', x: CX + 120, y: 110, r: 34, label: 'Damon', icon: 'damon' });
      add({ id: 'viv', type: 'agent', x: CX, y: 255, r: 36, label: 'Viv', icon: 'viv' });
      const row = (ids, y, x0, x1) => ids.forEach((id, i) => add({ id, type: 'agent', x: ids.length === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (ids.length - 1), y, r: 27, label: id, icon: AICON[id] || 'sparkles' }));
      row(grokTeam, 405, 85, 715); row(vpsTeam, 405, 885, 1515);
      devs.forEach((m, i) => add({ id: m.id, type: 'device', x: 128 + i * 146, y: 110, w: 134, h: 48, label: mname(m), icon: ICON_M[m.id] }));
      const sx = [300, 800, 1300];
      MPOS_ORDER.forEach((id, i) => { const m = servers.find(s => s.id === id); if (m) add({ id, type: 'machine', x: sx[i], y: 610, w: 290, h: 90, label: mname(m), icon: ICON_M[id] }); });
      const envs = e.environments; envs.forEach((en, i) => add({ id: en.id, type: 'env', x: 105 + i * (1390 / Math.max(1, envs.length - 1)), y: 790, w: 118, h: 42, label: mname(en), icon: ICON_E[en.id] || 'cloud' }));
      const as = e.assets, per = Math.ceil(as.length / 2);
      as.forEach((a, i) => { const r = i < per ? 0 : 1, c = i < per ? i : i - per, n = r ? as.length - per : per; add({ id: a.id, type: 'asset', x: 90 + c * (1420 / Math.max(1, n - 1)), y: 905 + r * 64, w: 106, h: 40, label: mname(a), icon: 'globe' }); });
    } else {
      const CX = 300;
      devs.forEach((m, i) => add({ id: m.id, type: 'device', x: CX + (i - (devs.length - 1) / 2) * 86, y: 70, w: 70, h: 70, label: '', icon: ICON_M[m.id] }));
      add({ id: 'damon', type: 'agent', x: CX, y: 200, r: 38, label: '', icon: 'damon' });
      add({ id: 'viv', type: 'agent', x: CX, y: 330, r: 40, label: '', icon: 'viv' });
      const grid = (ids, y0, cols, dx, dy, cx) => ids.forEach((id, i) => { const r = Math.floor(i / cols), c = i % cols, nn = Math.min(cols, ids.length - r * cols); add({ id, type: 'agent', x: cx + (c - (nn - 1) / 2) * dx, y: y0 + r * dy, r: 29, label: '', icon: AICON[id] || 'sparkles' }); });
      grid(grokTeam, 460, 4, 124, 78, CX); grid(vpsTeam, 640, 4, 124, 78, CX);
      MPOS_ORDER.forEach((id, i) => { const m = servers.find(s => s.id === id); if (m) add({ id, type: 'machine', x: CX + (i - 1) * 190, y: 830, w: 170, h: 84, label: '', icon: ICON_M[id] }); });
      const envs = e.environments; envs.forEach((en, i) => add({ id: en.id, type: 'env', x: CX + ((i % 4) - 1.5) * 124, y: 970 + Math.floor(i / 4) * 66, w: 96, h: 52, label: '', icon: ICON_E[en.id] || 'cloud' }));
      const as = e.assets; as.forEach((a, i) => add({ id: a.id, type: 'asset', x: CX + ((i % 5) - 2) * 104, y: 1175 + Math.floor(i / 5) * 62, w: 84, h: 48, label: '', icon: 'globe' }));
    }
    const L = (a, b, k, extra = {}) => { if (byId.has(a) && byId.has(b)) links.push({ a, b, k, ...extra }); };
    L('damon', 'viv', 'hier'); for (const id of [...grokTeam, ...vpsTeam]) L('viv', id, 'hier');
    for (const d of devs) L(d.id, 'damon', 'dev');
    for (const [id, hs] of Object.entries(e.hosts || {})) for (const h of hs || []) { if (byId.get(id)?.type === 'agent') L(id, h, 'host'); }
    L('contabo', 'oracle', 'plan');
    for (const a of e.assets) { if (a.on) L(a.id, a.on, 'asset'); }
    for (const l of V.D.links || []) { const a = l.from, b = l.to; if (byId.get(a)?.type === 'agent' && byId.get(b)?.type === 'agent' && !(a === 'viv' || b === 'viv') && l.count) L(a, b, 'a2a', { count: l.count }); }
    plates = [['grok', grokTeam], ['oracle', vpsTeam]].map(([h, ids]) => { const ns = ids.map(i => byId.get(i)).filter(Boolean); if (!ns.length) return null; const pad = mob ? 14 : 30; return { host: h, x0: Math.min(...ns.map(n => n.x - n.r)) - pad, x1: Math.max(...ns.map(n => n.x + n.r)) + pad, y0: Math.min(...ns.map(n => n.y - n.r)) - pad - 4, y1: Math.max(...ns.map(n => n.y + n.r)) + pad + (mob ? 4 : 30) }; }).filter(Boolean);
    bbox = nodes.reduce((b, n) => { const hw = (n.w || n.r * 2) / 2 + 20, hh = (n.h || n.r * 2) / 2 + 24; return { x0: Math.min(b.x0, n.x - hw), x1: Math.max(b.x1, n.x + hw), y0: Math.min(b.y0, n.y - hh), y1: Math.max(b.y1, n.y + hh) }; }, { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 });
    if (!mob) { bbox.y0 -= 20; bbox.y1 += 56; } else { bbox.y0 -= 56; bbox.y1 += 70; }
  }
  const PW = 392, shrinks = () => !mob && bbox && (W - PW) / (bbox.x1 - bbox.x0) >= 0.68, panelW = () => (selected && shrinks() ? PW : 0);
  function fit(snap) {
    if (!bbox) return; const aw = Math.max(200, W - panelW()), ah = mob ? H - (selected ? Math.min(H * 0.5, 380) : 0) : H;
    const bw = bbox.x1 - bbox.x0, bh = bbox.y1 - bbox.y0, z = Math.min(aw / bw, ah / bh, mob ? 1.2 : 1.4);
    cam.tz = z; cam.tx = (bbox.x0 + bbox.x1) / 2 - (aw / 2 - W / 2) / z; cam.ty = (bbox.y0 + bbox.y1) / 2 - (ah / 2 - H / 2) / z; cam.user = false;
    if (snap) { cam.x = cam.tx; cam.y = cam.ty; cam.z = cam.tz; }
  }
  const w2s = (x, y) => [(x - cam.x) * cam.z + W / 2, (y - cam.y) * cam.z + H / 2];
  const s2w = (x, y) => [(x - W / 2) / cam.z + cam.x, (y - H / 2) / cam.z + cam.y];

  const colOf = n => { if (n.type === 'agent') return n.id === 'damon' ? (C.waiting) : hue(n.id); if (n.type === 'device' || n.type === 'machine') return MCOL[n.id]?.[THEME === 'light' ? 1 : 0] || C.sub; if (n.type === 'env') return ECOL[THEME === 'light' ? 1 : 0]; return C.sub; };
  const upOf = id => { const a = E()?.assets?.find(x => x.id === id); return a ? a.status : null; };
  const here = (() => { if (PUB) return null; const ua = navigator.userAgent; return /iPhone|iPod/.test(ua) ? 'iphone' : /Android/.test(ua) ? (/Mobile/.test(ua) ? 'android_phone' : 'android_tab') : 'pc_main'; })();
  function curve(a, b, k) {
    const x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
    if (k === 'a2a') { const mx = (x1 + x2) / 2, off = -70 - Math.abs(x2 - x1) * 0.12; return [x1, y1, mx, y1 + off, mx, y2 + off, x2, y2]; }
    const my = (y1 + y2) / 2; return [x1, y1, x1, my, x2, my, x2, y2];
  }
  const bez = (c, t) => { const u = 1 - t; return [u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6], u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7]]; };
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  const linkLive = l => {
    const a = byId.get(l.a), b = byId.get(l.b);
    if (l.k === 'host') return a.st.s === 'working' ? 1 : a.st.s === 'recent' ? 0.4 : 0;
    if (l.k === 'a2a') return a.st.s !== 'idle' && b.st.s !== 'idle' ? 0.5 : 0;
    if (l.k === 'dev') { const d = E().machines.find(m => m.id === l.a)?.device; return d?.last_tag && Date.now() - tsOf(d.last_tag + 'T23:59:00-04:00') < H24 ? 0.7 : 0; }
    if (l.k === 'hier') return b.st.s === 'working' ? 0.8 : 0;
    return 0;
  };
  function drawLinks() {
    for (const l of links) {
      const a = byId.get(l.a), b = byId.get(l.b), c = curve(a, b, l.k), live = linkLive(l); if (l.k === 'asset' && cam.z < 0.5) continue;
      const sel = selected && (selected === l.a || selected === l.b);
      ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.bezierCurveTo(c[2], c[3], c[4], c[5], c[6], c[7]);
      const base = l.k === 'hier' ? 0.22 : l.k === 'asset' ? 0.1 : l.k === 'dev' ? 0.3 : l.k === 'host' ? 0.16 : 0.2;
      ctx.strokeStyle = rgba(sel ? C.active : l.k === 'a2a' ? colOf(a) : C.sub, sel ? 0.9 : live ? Math.min(0.75, base + 0.35) : base);
      ctx.lineWidth = (sel ? 2.2 : l.k === 'hier' ? 1.5 : 1.1) / Math.sqrt(cam.z) * Math.min(1, cam.z * 1.2 + 0.4);
      ctx.setLineDash(l.k === 'plan' ? [4, 6] : l.k === 'asset' ? [2, 5] : []); ctx.stroke(); ctx.setLineDash([]);
      if (live && !RM) {
        const len = Math.hypot(c[6] - c[0], c[7] - c[1]), nd = Math.max(1, Math.min(4, Math.round(len / 160))), sp = 0.12 + live * 0.18;
        ctx.fillStyle = rgba(l.k === 'dev' ? colOf(a) : colOf(l.k === 'hier' ? b : a), 0.95);
        for (let i = 0; i < nd; i++) { const t = ((tnow * sp + i / nd) % 1); const [px, py] = bez(c, l.k === 'dev' || l.k === 'host' ? t : t); ctx.beginPath(); ctx.arc(px, py, 3 / Math.sqrt(cam.z) + 0.8, 0, 7); ctx.fill(); }
      }
    }
  }
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dI = (nm, x, y, sz, col) => drawIcon(ctx, nm, x - sz / 2, y - sz / 2, sz, col, 2);
  const fs = px => Math.round(px) + 'px ';
  function label(txt, x, y, px, color, align = 'center', weight = 600, maxw = 0) { if (!txt || px * cam.z < 7) return; txt = String(txt); ctx.font = `${weight} ${px}px ${SANS}`; if (maxw) { while (txt.length > 3 && ctx.measureText(txt).width > maxw) txt = txt.slice(0, -2).trimEnd() + '…'; } ctx.font = `${weight} ${px}px ${SANS}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.lineWidth = 3.5; ctx.strokeStyle = rgba(C.bg, 0.92); ctx.strokeText(txt, x, y); ctx.fillStyle = color; ctx.fillText(txt, x, y); }
  function drawNode(n) {
    const col = colOf(n), sel = selected === n.id, hov = hover === n.id; const x = n.x, y = n.y;
    if (n.type === 'agent') {
      const s = n.st.s, r = n.r, pulse = s === 'working' && !RM ? (Math.sin(tnow * 3.2) + 1) / 2 : 0;
      if (s === 'working') { ctx.beginPath(); ctx.arc(x, y, r + 9 + pulse * 7, 0, 7); ctx.fillStyle = rgba(col, 0.1 + pulse * 0.1); ctx.fill(); ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.strokeStyle = rgba(col, 0.55 + pulse * 0.4); ctx.lineWidth = 2; ctx.stroke(); }
      else if (s === 'recent') { ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.strokeStyle = rgba(col, 0.4); ctx.lineWidth = 1.5; ctx.stroke(); }
      else if (s === 'idle') { ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.setLineDash([2, 5]); ctx.strokeStyle = rgba(C.dim, 0.6); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.strokeStyle = rgba(C.waiting, 0.55); ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = rgba(s === 'idle' ? C.muted : col, s === 'idle' ? 0.9 : 0.2); ctx.fill(); ctx.strokeStyle = rgba(col, s === 'idle' ? 0.5 : 1); ctx.lineWidth = sel || hov ? 3 : 1.8; ctx.stroke();
      dI(n.icon, x, y, r * 1.05, s === 'idle' ? rgba(col, 0.55) : col);
      if (!mob) label(nameOf(n.id), x, y + r + 20, 14, s === 'idle' ? C.sub : C.text);
      if (!mob && s !== 'human') label(s === 'working' ? 'working' : s === 'recent' ? 'active today' : 'idle', x, y + r + 34, 10, s === 'idle' ? C.dim : col, 'center', 400);
    } else {
      const w = n.w, h = n.h, rad = n.type === 'asset' ? 8 : 12; const up = n.type === 'asset' ? upOf(n.id) : n.type === 'machine' || n.type === 'device' ? (E().machines.find(m => m.id === n.id)?.status) : null;
      const isHere = here === n.id;
      rr(x - w / 2, y - h / 2, w, h, rad); ctx.fillStyle = rgba(n.type === 'machine' ? col : C.panel, n.type === 'machine' ? 0.12 : 1); ctx.fill();
      if (n.type === 'machine') { rr(x - w / 2, y - h / 2, w, h, rad); ctx.fillStyle = rgba(C.panel, 0.7); ctx.fill(); }
      ctx.lineWidth = sel || hov ? 2.6 : n.type === 'machine' ? 1.8 : 1.2; ctx.strokeStyle = rgba(col, sel || hov ? 1 : n.type === 'machine' ? 0.85 : 0.5); if (up === 'down' || up === 'offline') ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
      if (isHere) { rr(x - w / 2 - 5, y - h / 2 - 5, w + 10, h + 10, rad + 4); ctx.strokeStyle = rgba(C.active, 0.9); ctx.lineWidth = 2; ctx.stroke(); }
      const ic = n.type === 'asset' ? 15 : n.type === 'env' ? 17 : 26;
      if (mob) dI(n.icon, x, y, n.type === 'machine' ? 34 : n.type === 'device' ? 32 : n.type === 'env' ? 26 : 22, col);
      else if (n.type === 'machine') { dI(n.icon, x - w / 2 + 34, y, 30, col); label(n.label, x - w / 2 + 62, y - 6, 14, C.text, 'left', 700, w - 76); const m = E().machines.find(q => q.id === n.id); label(`${(m?.agents || []).length} agents · ${(m?.sites || []).length} sites`, x - w / 2 + 62, y + 14, 11, C.sub, 'left', 400); }
      else if (n.type === 'device') { dI(n.icon, x - w / 2 + 20, y, 20, col); label(shortLab(n.label), x - w / 2 + 38, y + 4, 12, C.text, 'left', 600, w - 44); }
      else if (n.type === 'env') { dI(n.icon, x, y - 7, 18, col); label(n.label, x, y + 14, 12, C.text, 'center', 600, w - 10); }
      else { dI(n.icon, x, y - 8, 15, col); label(n.label, x, y + 12, 11, C.text, 'center', 600, w - 8); }
      if (up && !mob || (mob && up && n.type !== 'env')) { const ok = up === 'up' || up === 'connected'; const dx = n.type === 'machine' ? x + w / 2 - 14 : x + w / 2 - 9, dy = y - h / 2 + 9; ctx.beginPath(); ctx.arc(dx, dy, 4, 0, 7); ctx.fillStyle = ok ? C.success : C.dim; ctx.fill(); }
    }
  }
  const nameOf = id => { const a = AG().find(x => x.id === id); return SHORT[id] || String(V.A?.[id]?.name || a?.name || id).replace(/\s*\(.*\)/, ''); };
  const fullName = id => { const a = AG().find(x => x.id === id); return id === 'damon' ? 'Damon' : id === 'viv' ? 'Viv' : String(V.A?.[id]?.name || a?.name || id); };
  const shortLab = s => PUB ? String(s || '') : String(s || '').replace(/\s*\(.*\)/, '');
  function zone(txt, y) { if (mob) return; const [sx, sy] = w2s(60, y); if (cam.z < 0.35) return; ctx.font = `700 ${Math.max(9, 11 * cam.z)}px ${MONO}`; ctx.textAlign = 'left'; ctx.fillStyle = rgba(C.dim, 0.9); ctx.fillText(txt, sx, sy); }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const g = 60 * cam.z; if (g > 14) { ctx.fillStyle = rgba(C.dim, 0.16); const ox = (W / 2 - cam.x * cam.z) % g, oy = (H / 2 - cam.y * cam.z) % g; for (let x = ox; x < W; x += g) for (let y = oy; y < H; y += g) ctx.fillRect(x, y, 1.5, 1.5); }
    if (!nodes.length) { label('No ecosystem data', W / 2, H / 2, 16, C.sub); return; }
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
    if (!mob) { ctx.font = `700 11px ${MONO}`; ctx.textAlign = 'left'; ctx.fillStyle = rgba(C.dim, 0.95); const Z = [['DAMON\u2019S DEVICES  (request source = real message tags)', 60, 52], ['TEAM', 60, 205], ['MACHINES', 60, 540], ['CLOUD ENVIRONMENTS', 60, 735], ['WEB ASSETS', 60, 850]]; for (const [t, x, y] of Z) ctx.fillText(t, x, y); for (const q of plates) { ctx.fillStyle = rgba(MCOL[q.host][THEME === 'light' ? 1 : 0], 0.95); ctx.fillText(q.host === 'grok' ? 'GROK BOT TEAM' : 'VPS TEAM (Oracle)', q.x0 + 14, q.y0 + 16); } }
    for (const q of plates) { const c = MCOL[q.host][THEME === 'light' ? 1 : 0]; rr(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0, 22); ctx.fillStyle = rgba(c, THEME === 'light' ? 0.07 : 0.07); ctx.fill(); ctx.setLineDash([6, 6]); ctx.strokeStyle = rgba(c, 0.4); ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]); }
    drawLinks();
    for (const n of nodes) drawNode(n);
    ctx.restore();
  }

  const chip = (id, txt, col) => `<button class="ec-chip" data-sel="${esc(id)}" style="--h:${col}">${esc(txt)}</button>`;
  const pill = (txt, col) => `<span class="ec-pill" style="--h:${col}">${esc(txt)}</span>`;
  const sec = (title, body, icon) => body ? `<section><h5>${icon ? svg(icon, 13) : ''}${esc(title)}</h5>${body}</section>` : '';
  const head = (n, sub, extra = '') => `<div class="ec-hd"><button class="ec-x" data-x aria-label="close">${svg('x', 18)}</button><span class="ec-ic" style="--h:${colOf(n)}">${svg(n.icon, 26)}</span><div class="ec-t"><b>${esc(n.name)}</b><span>${sub}</span></div>${extra}</div>`;
  const assetChip = a => { const s = a.status; return `<button class="ec-chip" data-sel="${esc(a.id)}" style="--h:${s === 'up' ? C.success : C.dim}"><i class="dot${s === 'up' ? ' on' : ''}"></i>${esc(mname(a))}</button>`; };
  function agentPanel(id) {
    const e = E(), p = e.profiles?.[id] || {}, st = stateOf(id), tk = taskOf(id), d = done24(id), col = colOf({ type: 'agent', id });
    const nm = nameOf(id), role = V.A?.[id]?.role || '';
    const stTxt = st.s === 'working' ? 'Working now' : st.s === 'recent' ? 'Active in the last 24 h' : 'Idle';
    const hosts = (p.host || []).map(h => { const m = e.machines.find(q => q.id === h) || e.environments.find(q => q.id === h); return m ? chip(h, mname(m), col) : ''; }).join('');
    const sk = p.skills || {}; const names = sk.names || (sk.shared && e.shared_skills?.[sk.shared]) || null; const ex = sk.extra || null;
    const last = sk.last_install ? `${etFmt(tsOf(sk.last_install))} (${agoS(tsOf(sk.last_install))})` : null;
    const recent = (sk.recent || []).slice(0, 5).map(([n, t]) => `<li><span>${esc(n)}</span><em>${esc(etDay(tsOf(t)))}</em></li>`).join('');
    const sugg = (p.suggestions || []).map(s => `<li>${esc(s.text)}<em>${esc(s.ts ? etDay(tsOf(s.ts)) : '')}${!PUB && s.src ? ' · ' + esc(s.src) : ''}</em></li>`).join('');
    const taskHtml = tk ? `<p class="ec-task">${esc(tk.text)}</p><p class="ec-meta">${esc(tk.note)} · ${esc(etFmt(tk.t))} (${esc(agoS(tk.t))})</p>` : `<p class="ec-meta">No work on record.</p>`;
    return `<div class="ec-hd"><button class="ec-x" data-x aria-label="close">${svg('x', 18)}</button><span class="ec-ic" style="--h:${col}">${svg(AICON[id] || 'sparkles', 26)}</span><div class="ec-t"><b>${esc(fullName(id))}</b><span>${esc(role)}</span></div></div>
    <div class="ec-row">${pill(stTxt, st.s === 'idle' ? C.dim : col)}${hosts}</div>
    ${sec('Operating instructions', p.summary ? `<p>${esc(p.summary)}</p>${!PUB && p.src ? `<p class="ec-meta">source: ${esc(p.src)}</p>` : ''}` : '', 'book')}
    ${sec(tk?.kind === 'assigned' ? 'Current task (assigned)' : st.s === 'idle' ? 'No active task (idle). Last logged work' : 'Current task', taskHtml, 'target')}
    ${sec('Completed in the last 24 h', `<div class="ec-big"><b>${d.n24}</b><span>${d.n24 === 1 ? 'task' : 'tasks'} · ${d.n7} in 7 days${d.last ? ' · last ' + esc(agoS(d.last)) : ''}</span></div>`, 'check')}
    ${sec('Suggestions', sugg ? `<ul class="ec-ul">${sugg}</ul>` : `<p class="ec-meta">None on record.</p>`, 'lightbulb')}
    ${sec('Skills', `<div class="ec-big"><b>${sk.count ?? 'unknown'}</b><span>installed${sk.builtin ? ' + ' + sk.builtin + ' bundled' : ''}</span></div><p class="ec-meta">Last installed: ${last ? esc(last) : 'unknown (not logged)'}</p>${recent ? `<ul class="ec-ul sk">${recent}</ul>` : ''}${sk.note ? `<p class="ec-meta">${esc(sk.note)}</p>` : ''}${names && !PUB ? `<details><summary>all ${names.length} skills</summary><div class="ec-names">${names.map(n => `<span>${esc(n)}</span>`).join('')}</div></details>` : ''}${ex ? `<p class="ec-meta">Plus ${ex.count} role skills of her own. ${esc(ex.note || '')}</p>` : ''}${ex?.names && !PUB ? `<details><summary>her ${ex.names.length} own skills</summary><div class="ec-names">${ex.names.map(n => `<span>${esc(n)}</span>`).join('')}</div></details>` : ''}`, 'wrench')}`;
  }
  function damonPanel() {
    const e = E(), devs = e.machines.filter(m => m.device);
    const rows = devs.map(m => `<li><button class="ec-chip" data-sel="${m.id}" style="--h:${colOf({ type: 'device', id: m.id })}">${esc(mname(m))}</button><span>${m.device.tagged ? m.device.tagged + ' tagged request' + (m.device.tagged === 1 ? '' : 's') + (m.device.last_tag ? ' · last ' + esc(m.device.last_tag.slice(5)) : '') : 'no tagged requests'}${m.device.connected ? ' · connected' : ''}${here === m.id ? ' · you are here' : ''}</span></li>`).join('');
    const w = V.waiting?.filter(x => !x.answer).length;
    return `<div class="ec-hd"><button class="ec-x" data-x aria-label="close">${svg('x', 18)}</button><span class="ec-ic" style="--h:${C.waiting}">${svg('damon', 26)}</span><div class="ec-t"><b>Damon</b><span>Owner. Every request starts here.</span></div></div>
    ${sec('Where requests come from', `<ul class="ec-ul dv">${rows}</ul><p class="ec-meta">${esc(e.untagged_note || '')}</p>`, 'monitor')}
    ${!PUB && w != null ? sec('Waiting on you', `<div class="ec-big"><b>${w}</b><span>open decisions</span></div>`, 'hourglass') : ''}
    <p class="ec-meta">${(e.notes || []).map(esc).join('<br>')}</p>`;
  }
  function machinePanel(id) {
    const e = E(), m = e.machines.find(x => x.id === id), col = colOf({ type: 'machine', id });
    const ag = (m.agents || []).map(a => { const s = stateOf(a); return chip(a, nameOf(a) + (s.s === 'working' ? ' · working' : ''), hue(a)); }).join('');
    const sites = (m.sites || []).map(sid => e.assets.find(a => a.id === sid)).filter(Boolean).map(assetChip).join('');
    const cons = (m.containers || []).map(c => `<li><i class="dot${c.up ? ' on' : ''}"></i><span>${esc(c.name)}</span><em>${esc(c.status)}</em></li>`).join('');
    const secs = (m.sections || []).map(s => sec(s.title, `<ul class="ec-ul tl">${(s.items || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`, s.t === 'data' ? 'database' : 'wrench')).join('');
    const dv = m.device ? sec('Requests from this device', `<div class="ec-big"><b>${m.device.tagged}</b><span>tagged message${m.device.tagged === 1 ? '' : 's'}${m.device.last_tag ? ' · last ' + esc(m.device.last_tag) : ''}</span></div><p class="ec-meta">${esc(m.device.note || '')}</p>${here === id ? '<p class="ec-meta">This browser looks like this device (from its user agent).</p>' : ''}`, 'send') : '';
    return `<div class="ec-hd"><button class="ec-x" data-x aria-label="close">${svg('x', 18)}</button><span class="ec-ic" style="--h:${col}">${svg(ICON_M[id], 26)}</span><div class="ec-t"><b>${esc(mname(m))}</b><span>${esc(m.pub_os || m.os || '')}</span></div></div>
    <div class="ec-row">${pill(m.status === 'up' ? 'online' : m.status === 'planned' ? 'planned' : m.status || '', m.status === 'up' ? C.success : C.dim)}</div>
    <p>${esc(m.pub_note ?? m.note ?? '')}</p>
    ${dv}${sec('Agents on this machine', ag ? `<div class="ec-chips">${ag}</div>` : '', 'users')}${sec('Sites & apps', sites ? `<div class="ec-chips">${sites}</div>` : '', 'globe')}
    ${sec(`Containers (${(m.containers || []).length})`, cons ? `<ul class="ec-ul ct">${cons}</ul>` : '', 'boxes')}${secs}`;
  }
  function envPanel(id) {
    const e = E(), en = e.environments.find(x => x.id === id); const assets = e.assets.filter(a => a.on === id).map(assetChip).join('');
    const ag = Object.entries(e.hosts || {}).filter(([k, hs]) => (hs || []).includes(id)).map(([k]) => chip(k, nameOf(k), hue(k))).join('');
    return `<div class="ec-hd"><button class="ec-x" data-x aria-label="close">${svg('x', 18)}</button><span class="ec-ic" style="--h:${ECOL[THEME === 'light' ? 1 : 0]}">${svg(ICON_E[id] || 'cloud', 26)}</span><div class="ec-t"><b>${esc(mname(en))}</b><span>Cloud environment</span></div></div><p>${esc(en.pub_what ?? en.what ?? '')}</p>${sec('Hosts', assets ? `<div class="ec-chips">${assets}</div>` : '', 'globe')}${sec('Agents here', ag ? `<div class="ec-chips">${ag}</div>` : '', 'users')}`;
  }
  function assetPanel(id) {
    const e = E(), a = e.assets.find(x => x.id === id); const on = e.machines.find(m => m.id === a.on) || e.environments.find(x => x.id === a.on);
    const link = a.pubhost ? `<p><a href="//${esc(a.pub ?? a.name)}" target="_blank" rel="noopener">${esc(mname(a))} ↗</a></p>` : '';
    return `<div class="ec-hd"><button class="ec-x" data-x aria-label="close">${svg('x', 18)}</button><span class="ec-ic" style="--h:${a.status === 'up' ? C.success : C.dim}">${svg('globe', 26)}</span><div class="ec-t"><b>${esc(mname(a))}</b><span>Web asset${a.kind ? ' · ' + esc(a.kind) : ''}</span></div></div>
    <div class="ec-row">${pill(a.status === 'up' ? 'online' : a.status || 'unknown', a.status === 'up' ? C.success : C.dim)}${on ? chip(a.on, mname(on), colOf({ type: e.machines.some(m => m.id === a.on) ? 'machine' : 'env', id: a.on })) : ''}</div>
    ${link}<p class="ec-meta">Status checked ${esc(a.checked ? etFmt(tsOf(a.checked)) : 'unknown')}${!PUB && a.code ? ' · HTTP ' + a.code : ''}</p>${!PUB && a.what ? `<p>${esc(a.what)}</p>` : ''}`;
  }
  function paintPanel() {
    if (!selected || !E()) { panel.hidden = true; wrap.classList.remove('has-panel'); return; }
    const n = byId.get(selected); if (!n) { panel.hidden = true; return; }
    const html = n.type === 'agent' ? (n.id === 'damon' ? damonPanel() : agentPanel(n.id)) : n.type === 'machine' || n.type === 'device' ? machinePanel(n.id) : n.type === 'env' ? envPanel(n.id) : assetPanel(n.id);
    const sc = panel.scrollTop; panel.innerHTML = html; panel.hidden = false; panel.scrollTop = sc; wrap.classList.add('has-panel');
  }
  function paintStats() {
    const c = counts(), e = E(); if (!e) return; const nUp = e.machines.filter(m => !m.device && m.status === 'up').length, nA = e.assets.filter(a => a.status === 'up').length;
    const chipS = (ic, n, t, col) => `<span class="st" title="${esc(t)}" style="--h:${col}">${svg(ic, mob ? 17 : 14)}<b>${n}</b>${mob ? '' : `<em>${esc(t)}</em>`}</span>`;
    stats.innerHTML = chipS('zap', c.working, 'working now', C.active) + chipS('clock', c.recent, 'active today', C.sub) + chipS('minus', c.idle, 'idle', C.dim) + chipS('server', nUp, 'servers up', C.success) + chipS('globe', `${nA}/${e.assets.length}`, 'sites up', C.success);
  }
  function paintLeg() {
    leg.innerHTML = mob ? '' : `<div class="lg"><span><i class="lw"></i>working: real work in the last 2 h (pulses show live work)</span><span><i class="lr"></i>active in the last 24 h</span><span><i class="li"></i>idle: no work in 24 h, no animation</span>${PUB ? '' : `<span><i class="ls"></i>this browser's device</span>`}</div><div class="lh">Click any node. Drag to pan, scroll or pinch to zoom, double-click to reset.</div>`;
  }
  function paintFab() {
    fab.innerHTML = mob ? [['theme', THEME === 'light' ? 'moon' : 'sun'], ['reset', 'locate'], ['classic', 'system'], ['dash', 'dashboard']].map(([a, ic]) => `<button data-a="${a}" aria-label="${a}">${svg(ic, 20)}</button>`).join('') : '';
  }

  const pts = new Map(); let drag = null, pinch = null, moved = 0, lastTap = 0;
  const hit = (sx, sy) => { const [wx, wy] = s2w(sx, sy); for (let i = nodes.length - 1; i >= 0; i--) { const n = nodes[i]; if (n.type === 'agent') { if (Math.hypot(wx - n.x, wy - n.y) <= n.r + 8) return n; } else if (Math.abs(wx - n.x) <= n.w / 2 + 4 && Math.abs(wy - n.y) <= n.h / 2 + 4) return n; } return null; };
  const tipText = n => { if (n.type === 'agent') { const s = n.st.s; return `<b>${esc(fullName(n.id))}</b> · ${s === 'working' ? 'working now' : s === 'recent' ? 'active today' : s === 'human' ? 'owner' : 'idle'}`; } return `<b>${esc(n.label || n.id)}</b>`; };
  const select = id => { selected = id && byId.has(id) ? id : null; paintPanel(); if (mob) { if (selected) { const n = byId.get(selected); cam.tx = n.x; cam.ty = n.y + (H * 0.22) / cam.tz; cam.tz = Math.max(cam.tz, 1); } else fit(); } else { if (!cam.user) fit(); if (selected && !shrinks()) { const n = byId.get(selected); const sx = (n.x - cam.tx) * cam.tz + W / 2; if (sx > W - PW - 70) cam.tx += (sx - (W - PW) / 2) / cam.tz; } } opt.onSelect?.(selected); };
  cv.addEventListener('pointerdown', e => { try { cv.setPointerCapture(e.pointerId); } catch { } pts.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: cam.z }; } });
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(); const sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); cam.z = cam.tz = Math.min(4, Math.max(0.2, pinch.z * d / pinch.d)); cam.user = true; moved = 99; return; }
    if (drag && pts.size === 1) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.hypot(dx, dy)); if (moved > 6) { cam.x = cam.tx = drag.cx - dx / cam.z; cam.y = cam.ty = drag.cy - dy / cam.z; cam.user = true; } return; }
    if (!mob && e.pointerType === 'mouse') { const n = hit(sx, sy); hover = n?.id || null; cv.style.cursor = n ? 'pointer' : 'grab'; if (n) { tip.hidden = false; tip.innerHTML = tipText(n); tip.style.left = Math.min(W - 200, sx + 14) + 'px'; tip.style.top = (sy + 16) + 'px'; } else tip.hidden = true; }
  });
  const up = e => { const r = cv.getBoundingClientRect(); const was = pts.size; pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
    if (was === 1 && moved <= 6 && e.type === 'pointerup') { const n = hit(e.clientX - r.left, e.clientY - r.top); const now = performance.now(); if (n) select(n.id === selected ? null : n.id); else { if (now - lastTap < 350) { fit(); } else if (selected) select(null); } lastTap = now; }
    if (!pts.size) drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', () => { hover = null; tip.hidden = true; });
  cv.addEventListener('dblclick', () => { fit(); });
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); const sx = e.clientX - r.left, sy = e.clientY - r.top; const [wx, wy] = s2w(sx, sy); const z = Math.min(4, Math.max(0.2, cam.tz * Math.exp(-e.deltaY * 0.0015))); cam.tz = z; cam.tx = wx - (sx - W / 2) / z; cam.ty = wy - (sy - H / 2) / z; cam.user = true; }, { passive: false });
  panel.addEventListener('click', e => { if (e.target.closest('[data-x]')) { select(null); return; } const b = e.target.closest('[data-sel]'); if (b) select(b.dataset.sel); });
  fab.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) opt.onAction?.(b.dataset.a); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && selected && wrap.style.pointerEvents !== 'none') select(null); });

  function resize(w, h) { W = Math.max(200, w); H = Math.max(200, h); dpr = Math.min(window.__dpr || 2, devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const m = W < 760 || (opt.mobile && W < 1000); if (m !== mob || !nodes.length) { mob = m; wrap.classList.toggle('mob', mob); layout(); paintFab(); paintLeg(); paintStats(); } fit(true); paintPanel(); }
  function rebuild() { const e = E(); const s = e ? JSON.stringify([e.generated_at, e.assets.map(a => a.status), (V.events || []).length]) : ''; if (s === sig) return; sig = s; const keep = selected; layout(); if (keep && !byId.has(keep)) selected = null; paintStats(); paintPanel(); if (!cam.user) fit(true); }
  function frame(now, dt) {
    tnow += dt; const k = 1 - Math.pow(0.001, dt); cam.x += (cam.tx - cam.x) * k; cam.y += (cam.ty - cam.y) * k; cam.z += (cam.tz - cam.z) * k;
    if (Math.abs(cam.tz - cam.z) < 0.0005) cam.z = cam.tz;
    for (const n of nodes) if (n.type === 'agent') n.st = stateOf(n.id);
    draw();
  }
  hint.innerHTML = svg('move3d', 34); setTimeout(() => hint.classList.add('gone'), 4200);
  return { resize, frame, rebuild, select, reset: () => { select(null); fit(); }, setTheme() { paintFab(); paintPanel(); }, get selected() { return selected; }, get nodes() { return byId; }, get cam() { return cam; }, get mob() { return mob; }, repaint() { paintStats(); paintPanel(); paintFab(); } };
}
