import { C, rgba, MONO, SANS, TAG, THEME } from './palette.js';
import { hue, accent, isSub, subAgents, STATUS_RING } from './identity.js';
import { fmtET } from './derive.js';
import { drawIcon } from './icons.js';
import { STEPS, FORMULAS, stepOf } from './insights.js';
export const W = 1600, H = 840;
const PUB = typeof window !== 'undefined' && !!window.DASH_PUBLIC;
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
export const AICON = { ceo: 'ceo', reed: 'reed', evelyn: 'evelyn', dutchess: 'dutchess', viv: 'viv', motion: 'motion', friend: 'friend', agent_builder: 'agent_builder', skill_finder: 'skill_finder', up_skiller: 'up_skiller', product_manager: 'product_manager', cto: 'cto', damon: 'damon' };
export const SHORT = { agent_builder: 'Builder', skill_finder: 'Finder', up_skiller: 'Up-Skiller', product_manager: 'PM', cto: 'CTO', dutchess: 'Dutchess', viv: 'Viv', ceo: 'CEO', damon: 'Damon' };
const short = (id, A) => SHORT[id] || (A[id]?.name || id);
const STG = ['intake', 'route', 'execute', 'QA', 'human gate', 'outcome'];
const STGI = ['intake', 'route', 'build', 'qa', 'gate', 'deliver'];

export function createPipeline(canvas, V, prev, LY) {
  const MOB = !!(LY && LY.mobile);
  const ctx = canvas.getContext('2d', { alpha: false });
  const D = V.D, I = V.I || { steps: {}, streams: { links: {}, channels: {}, stages: {}, types: {}, rows: {} }, board: { rows: [], rank: [] } };
  const S = { panels: {}, links: [], spineHeat: prev?.spineHeat || new Float32Array(40), flash: prev?.flash || {}, log: prev?.log || [], cursor: prev?.cursor || null, born: prev?.born ?? null, view: { z: 1, ox: 0, oy: 0 }, tips: [], lbY: prev?.lbY || {}, lbRank: prev?.lbRank || {}, lbGlow: prev?.lbGlow || {} };
  const BLK = V.blk || { agents: new Map(), projects: new Map(), links: new Set() }; const lk = (f, t) => BLK.links.has(f + '>' + t);
  const tip = (x, y, w, h, html) => S.tips.push({ x, y, w, h, html });
  const P = (id, x, y, w, h, kind, order) => (S.panels[id] = { id, x, y, w, h, kind, order });
  const IN3 = 'skills';
  let WH = H, WW = W, RX = 0, laneX = 0;
  const BOARD_NARROW = 330, boardH = w => w >= BOARD_NARROW ? 264 : 190 + (Object.keys(V.A).length + 1) * 13.2 + 12;
  const streamsH = () => 70 + 15 * (Object.keys(D.meta.hub_channels || {}).length + STG.length) + 6;
  if (MOB) {
    WW = LY.ww; const M = 8; laneX = 58; RX = 76; const RW = WW - M - RX, cols = RW >= 2 * 170 + 10 ? 2 : 1, cw = (RW - (cols - 1) * 10) / cols; let y = M, o = 0;
    const place = (items, x0, colw, n) => { for (let i = 0; i < items.length; i += n) { const row = items.slice(i, i + n); const rh = Math.max(...row.map(r => r[1]));
      row.forEach(([id, h, kind], c) => P(id, x0 + c * (colw + 10), y, colw, h, kind, o++)); y += rh + 12; } };
    place([['damon', 160, 'input'], ['drive', 118, 'input'], [IN3, 118, 'input'], ['hub', 112, 'input']], RX, cw, cols);
    place(['reed', 'evelyn', 'dutchess', 'skill_finder', 'up_skiller', 'viv', 'agent_builder', 'friend', 'motion', 'product_manager', 'cto'].filter(id => V.A[id]).map(id => [id, 258, 'agent']), RX, cw, cols);
    P('ceo', M, M, 50, y - 12 - M, 'ceo', o++); y += 6;
    const FW = WW - 2 * M, wc = FW >= 2 * 270 + 10 ? 2 : 1, ww = (FW - (wc - 1) * 10) / wc;
    place([['brain', 258, 'widget'], ['streams', streamsH(), 'widget'], ['runlog', 264, 'bottom'], ['spectro', 264, 'widget'], ['board', boardH(ww), 'bottom'], ['output', 264, 'bottom']], M, ww, wc);
    WH = y - 12 + M;
  } else {
  P('damon', 10, 10, 240, 160, 'input', 0); P('drive', 10, 180, 240, 118, 'input', 1);
  P(IN3, 10, 308, 240, 118, 'input', 2); P('hub', 10, 436, 240, 112, 'input', 3);
  P('ceo', 290, 10, 100, 538, 'ceo', 4);
  const GX = 430, GAP = 12, CW = (1160 - 5 * GAP) / 6, RH = 258;
  const grid = [['reed', 'evelyn', 'dutchess', 'skill_finder', 'up_skiller', 'viv'], ['brain', 'agent_builder', 'friend', 'motion', 'product_manager', 'streams']];
  grid.forEach((row, r) => row.forEach((id, c) => { if (id !== 'brain' && id !== 'streams' && !V.A[id]) return; P(id, GX + c * (CW + GAP), 10 + r * (RH + 22), CW, RH, id === 'brain' || id === 'streams' ? 'widget' : 'agent', 5 + r * 6 + c); }));
  P('runlog', 10, 566, 470, 264, 'bottom', 17); P('spectro', 490, 566, 390, 264, 'widget', 18);
  P('board', 890, 566, 340, 264, 'bottom', 19); P('output', 1240, 566, 350, 264, 'bottom', 20);
  }
  const LANE = 10 + 258 + 11;
  const BUS = 557;
  const fan = t => /team|reed\/evelyn\/dutchess/.test(t) ? ['reed', 'evelyn', 'dutchess'] : [t === 'board' ? 'drive' : t];
  const raw = [...D.links.filter(l => l.from !== 'vps agents'),
    { from: 'hub', to: 'ceo', channel: 'Agent HQ hub posts read', count: D.meta.hub_posts }];
  raw.forEach(l => fan(l.to).forEach(to => { if (S.panels[l.from] && S.panels[to] && S.panels[to].kind !== 'widget') S.links.push({ ...l, to, parts: [], tracers: [], lead: I.streams.links[l.from + '>' + l.to] }); }));
  const isAgent = id => S.panels[id].kind === 'agent';
  const ceo = S.panels.ceo;
  const agentPort = (p, k) => { const row1 = p.y < LANE; return [[p.x, row1 ? p.y + p.h - 34 - k * 7 : p.y + 34 + k * 7], [p.x - 7 + (k % 3) * 1.5, row1 ? p.y + p.h - 34 - k * 7 : p.y + 34 + k * 7]]; };
  const portM = (q, i) => { if (q.x < RX + 5) { const y = q.y + 40 + (i % 5) * 6; return [[q.x, y], [laneX + 2 + (i % 6) * 2.3, y]]; }
    const ax = q.x + 14 + (i % 4) * 5, gy = q.y - 4 - (i % 3) * 1.5; return [[ax, q.y], [ax, gy], [laneX + 2 + (i % 6) * 2.3, gy]]; };
  const routeM = (l, i) => { const f = S.panels[l.from], t = S.panels[l.to], ce = ceo.x + ceo.w;
    if (l.to === 'ceo') { const a = portM(f, i); return [...a, [ce, a[a.length - 1][1]]]; }
    if (l.from === 'ceo') { const b = portM(t, i).reverse(); return [[ce, b[0][1]], ...b]; }
    return [...portM(f, i), ...portM(t, i + 1).reverse()]; };
  const routeOf = (l, i) => { if (MOB) return routeM(l, i);
    const f = S.panels[l.from], t = S.panels[l.to], off = ((i % 7) - 3) * 2.2;
    if (f.kind === 'input' && l.to === 'ceo') { const y = f.y + f.h * 0.55; return [[f.x + f.w, y], [f.x + f.w + 20, y], [ceo.x - 14, y], [ceo.x, y]]; }
    if (l.from === 'ceo' && t.kind === 'input') { const y = t.y + t.h * 0.35; return [[ceo.x, y], [ceo.x - 14, y], [t.x + t.w + 20, y], [t.x + t.w, y]]; }
    if (f.kind === 'input' && isAgent(l.to)) { const [e, g] = agentPort(t, 2); const y0 = f.y + f.h * 0.8; return [[f.x + f.w, y0], [f.x + f.w + 12, y0], [f.x + f.w + 12, BUS + off], [g[0], BUS + off], g, e]; }
    const port = (id, k) => agentPort(S.panels[id], k);
    const a = l.from === 'ceo' ? [[ceo.x + ceo.w, LANE + off], [ceo.x + ceo.w + 10, LANE + off]] : port(l.from, 1);
    const b = l.to === 'ceo' ? [[ceo.x + ceo.w, LANE + off + 1], [ceo.x + ceo.w + 10, LANE + off + 1]] : port(l.to, 0);
    return [a[0], a[1], [a[1][0], LANE + off], [b[1][0], LANE + off], b[1], b[0]]; };
  const sample = pts => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6));
      for (let k = 0; k < n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); } out.push(pts[pts.length - 1]);
    let s = out; for (let it = 0; it < 2; it++) { const r = [s[0]]; for (let i = 0; i < s.length - 1; i++) { r.push([s[i][0] * .75 + s[i + 1][0] * .25, s[i][1] * .75 + s[i + 1][1] * .25], [s[i][0] * .25 + s[i + 1][0] * .75, s[i][1] * .25 + s[i + 1][1] * .75]); } r.push(s[s.length - 1]); s = r; }
    const L = [0]; for (let i = 1; i < s.length; i++) L.push(L[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1])); return { s, L, len: L[L.length - 1] }; };
  const at = (P, u) => { const d = u * P.len; let lo = 0, hi = P.L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; P.L[m] < d ? lo = m : hi = m; }
    const f = (d - P.L[lo]) / ((P.L[hi] - P.L[lo]) || 1); return [P.s[lo][0] + (P.s[hi][0] - P.s[lo][0]) * f, P.s[lo][1] + (P.s[hi][1] - P.s[lo][1]) * f]; };
  S.links.forEach((l, i) => { l.path = sample(routeOf(l, i)); l.unknown = l.count == null; l.mid = at(l.path, 0.5);
    const n = l.unknown ? 0 : Math.min(MOB ? 6 : 14, 2 + Math.round(l.count)); for (let k = 0; k < n; k++) l.parts.push({ u: k / n, v: (40 + 6 * Math.min(l.count, 12)) / l.path.len });
    l.spineY = l.to === 'ceo' || l.from === 'ceo' ? (l.to === 'ceo' ? l.path.s[l.path.s.length - 1][1] : l.path.s[0][1]) : null; });
  const spr = (col, r) => { const c = document.createElement('canvas'); c.width = c.height = r * 2; const g = c.getContext('2d'); const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, rgba(col, 1)); gr.addColorStop(0.25, rgba(col, 0.55)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); return c; };
  const SP = { w: spr(C.activeHi, 10), lime: spr(C.active, 16), cream: spr(C.waiting, 12) };
  const SPC = new Map(); const sprC = (col, r = 16) => { const k = col + r; if (!SPC.has(k)) SPC.set(k, spr(col, r)); return SPC.get(k); };
  const SUBS = subAgents(V);
  const font = (px, w = 400, fam = MONO) => ctx.font = `${w} ${px}px ${fam}`;
  const FIT = new Map();
  const fit = (s, mw) => { s = String(s ?? 'unknown'); if (mw > 5000) return s; const key = ctx.font + '|' + mw + '|' + s; const hit = FIT.get(key); if (hit !== undefined) return hit;
    let r = s; if (ctx.measureText(s).width > mw) { let lo = 0, hi = s.length; while (lo < hi) { const m = (lo + hi + 1) >> 1; ctx.measureText(s.slice(0, m) + '…').width <= mw ? lo = m : hi = m - 1; } r = s.slice(0, lo) + '…'; }
    if (FIT.size > 5000) FIT.clear(); FIT.set(key, r); return r; };
  const txt = (s, x, y, col = C.text, px = 11, w = 400, al = 'left', fam = MONO, mw = 9999) => { font(px, w, fam); ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = 'alphabetic'; ctx.fillText(fit(s, mw), x, y); return ctx.measureText(fit(s, mw)).width; };
  const kv = (k, v, x, y, w, vc = C.text, px = 11) => { txt(k, x, y, C.sub, px); const kw = ctx.measureText(k).width; txt(v, x + w, y, vc, px, 400, 'right', MONO, w - kw - 10); };
  const ikv = (icon, v, x, y, w, vc = C.text, t = '', ic = C.sub, mw = w - 18) => { drawIcon(ctx, icon, x, y - 10, 12, ic, 2); txt(v, x + w, y, vc, 11, 400, 'right', MONO, mw); if (t) tip(x - 2, y - 12, w + 4, 15, t); };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const panel = (p, title, sub, acc, tmax, icon, tipHtml) => { const fl = S.flash[p.id] || 0;
    ctx.fillStyle = C.panel; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.fillStyle = C.panelHd; ctx.fillRect(p.x, p.y, p.w, 26);
    ctx.strokeStyle = fl > 0.02 ? rgba(acc, 0.35 + 0.65 * fl) : C.border; ctx.lineWidth = 1; ctx.strokeRect(p.x + .5, p.y + .5, p.w - 1, p.h - 1);
    ctx.fillStyle = C.border; ctx.fillRect(p.x, p.y + 26, p.w, 1); ctx.fillStyle = acc; ctx.fillRect(p.x, p.y, 3, 26);
    const sa = isSub(p.id) ? accent(p.id) : null; let tx = p.x + 10;
    if (sa) { ctx.fillStyle = sa.color; ctx.fillRect(p.x + 3, p.y, 3, 26); }
    if (icon) { drawIcon(ctx, icon, tx, p.y + 5, 16, acc, 2); tx += 21; }
    if (sa) { txt(sa.glyph, tx, p.y + 18, sa.color, 10, 700); tx += 11; }
    txt(title.toUpperCase(), tx, p.y + 18, C.text, 12, 700, 'left', MONO, (tmax || p.w * 0.58) - (tx - p.x - 10));
    if (sub) txt(sub, p.x + p.w - 8, p.y + 17, C.sub, 10, 400, 'right', MONO, p.w * 0.4);
    if (tipHtml) tip(p.x, p.y, Math.min(p.w, tx - p.x + 120), 26, tipHtml); };
  const sring = (x, y, r, st, t) => { ctx.save(); ctx.strokeStyle = st.pulse ? rgba(st.color, 0.6 + 0.4 * Math.sin(t * 4)) : st.alpha ? rgba(st.color, st.alpha) : st.color; ctx.lineWidth = st.width;
    ctx.setLineDash(st.style === 'dashed' ? [3, 2.5] : st.style === 'dotted' ? [1, 2.5] : []); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore(); };
  const orb = (x, y, r, id, opt = {}) => { const h = opt.hue || hue(id), t = V.now || 0;
    ctx.drawImage(sprC(h, 16), x - r * 2.6, y - r * 2.6, r * 5.2, r * 5.2); ctx.fillStyle = h; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    if (opt.status) sring(x, y, r + 3.5, opt.status, t);
    if (opt.acc) { const a = opt.acc, ph = t * 1.6 + a.ix; ctx.strokeStyle = a.color; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, r + (opt.status ? 6.5 : 3), ph, ph + 2.2); ctx.stroke(); ctx.lineWidth = 1;
      const dx = x + Math.cos(ph + 3.6) * (r + 5), dy = y + Math.sin(ph + 3.6) * (r + 5); ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(dx, dy, 1.8, 0, 7); ctx.fill(); } };
  const chip = (id, x, y, r = 8, share = null, alpha = 1) => { if (!id) { txt('n/a', x, y + 4, C.dim, 9, 400, 'center'); return 14; } const h = hue(id); ctx.globalAlpha *= alpha;
    ctx.fillStyle = C.panel; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = h; ctx.lineWidth = 1.4; ctx.stroke(); ctx.lineWidth = 1;
    drawIcon(ctx, AICON[id] || 'sparkles', x - r * 0.62, y - r * 0.62, r * 1.24, h, 2.2); let w = r * 2;
    if (share != null) w += 3 + txt(Math.round(share * 100) + '%', x + r + 3, y + 3.5, h, 9, 700); ctx.globalAlpha /= alpha; return w; };
  const statusIcon = (a, nb) => a.tag === 'waiting' || a.tag === 'human' ? ['hourglass', C.waiting] : a.tag === 'idle' ? ['pause', C.dim] : a.tag === 'pending' ? ['clock', C.sub] : a.tag === 'unresp' ? ['alert', C.sub] : ['check', C.success];
  const segBar = (x, y, w, pct, col, segs = 20, h = 7) => { const sw = w / segs; for (let i = 0; i < segs; i++) { const on = pct != null && (i + 1) / segs <= pct / 100 + 1e-6; ctx.fillStyle = on ? col : C.muted; ctx.fillRect(x + i * sw, y, sw - 2, h); } };
  const strip = s => String(s || 'unknown').replace(/^\d{4}-\d\d-\d\d[ ~]*\d+:\d\d[^:]*: /, '').replace(/^#[\w-]+: /, '');
  const leadTip = (L, what) => L && L.id ? `<b>${esc(what)}</b><br>lead: <b style="color:${hue(L.id)}">${esc(V.A[L.id]?.name || L.id)}</b> · ${L.n}/${L.total} events (${Math.round(L.share * 100)}%)<br><span class="tm">${esc(FORMULAS.lead)}</span>` : `<b>${esc(what)}</b><br>lead: n/a (no events in the loaded timeline)`;
  const agentPanel = (p, a) => {
    const nb = BLK.agents.get(a.id) || 0, T = TAG[a.tag], [si, sc] = statusIcon(a, nb);
    const nm = short(a.id, V.A).replace(/ \(formerly.*\)/, '');
    panel(p, nm, '', hue(a.id), p.w - 50, AICON[a.id], `<b style="color:${hue(a.id)}">${esc(a.name)}</b> · ${esc(a.platform)}<br>${esc(a.role)}${'' + esc(a.host || '') + '</span>'}`);
    const pul = nb ? 0.65 + 0.35 * Math.sin(V.now * 3) : 1; ctx.globalAlpha *= pul; drawIcon(ctx, si, p.x + p.w - 22, p.y + 5, 15, sc, 2.2); ctx.globalAlpha /= pul;
    
    tip(p.x + p.w - 42, p.y, 42, 26, `status: <b style="color:${T.color}">${esc(T.label)}</b><br>${esc(a.status || '')}`);
    
    const x = p.x + 9, w = p.w - 18; let y = p.y + 43;
    const ct = a.container ? a.container.status.toLowerCase().replace(/ \(healthy\)/, ' ✓').replace('about ', '') : null, plat = a.platform.toLowerCase().replace('nousresearch hermes agent', 'hermes').replace(' superagent', '');
    drawIcon(ctx, /grok/.test(plat) ? 'cloud' : 'server', x, y - 10, 12, ct && !/^up/.test(ct) ? C.sub : C.sub, 2);
    txt(plat + (ct ? ' · ' + ct : ''), x + 17, y, ct ? (/^up/.test(ct) ? C.sub : C.sub) : C.dim, 10, 400, 'left', MONO, w - 17);
    tip(x - 2, y - 12, w + 4, 15, `${esc(a.platform)}${ct ? ' · container ' + esc(a.container.name) + ' ' + esc(a.container.status) + ' (live)' : ''}${'' + esc(a.host || '')}`); y += 17;
    const pct = a.project_pct, pb = BLK.projects.has(a.project);
    drawIcon(ctx, 'project', x, y - 10, 12, C.sub, 2); txt(a.project ?? 'unknown', x + 17, y, a.project ? C.text : C.dim, 10, 400, 'left', MONO, w - 60);
    txt(pct == null ? 'n/a' : Math.round(pct) + '%', x + w, y, pct == null ? C.dim : C.text, 11, 700, 'right');
    segBar(x, y + 4, w, pct, a.tag === 'waiting' ? C.waiting : C.active, 24, 4);
    tip(x - 2, y - 12, w + 4, 20, `project: <b>${esc(a.project ?? 'unknown')}</b><br>% to goal: ${pct == null ? 'unknown (no metric in sources)' : pct + '%'}`); y += 20;
    const SI = I.steps[a.id] || { st: {}, current: null };
    const cx0 = x + 6, rowH = 21, y0 = y + 3;
    ctx.strokeStyle = C.border; ctx.beginPath(); ctx.moveTo(cx0, y0 + 6); ctx.lineTo(cx0, y0 + 6 + rowH * 4); ctx.stroke();
    STEPS.forEach((st, i) => { const v = SI.st[st.id] || { n: 0, last: null }, yy = y0 + i * rowH, cur = SI.current === st.id, on = v.n > 0, h = hue(a.id);
      if (cur) { ctx.fillStyle = rgba(h, 0.14 + 0.08 * Math.sin(V.now * 3)); ctx.fillRect(x - 3, yy - 2, w + 6, rowH - 1); ctx.fillStyle = h; ctx.fillRect(x - 3, yy - 2, 2, rowH - 1); }
      ctx.fillStyle = cur ? h : C.panel; ctx.beginPath(); ctx.arc(cx0, yy + 6.5, 7.5, 0, 7); ctx.fill(); ctx.strokeStyle = on ? h : C.border; ctx.stroke();
      drawIcon(ctx, st.icon, cx0 - 5, yy + 1.5, 10, cur ? C.panel : on ? h : C.dim, 2.4);
      txt(on ? String(v.n) : '·', x + 34, yy + 10, on ? C.text : C.dim, 10, 700, 'right');
      txt(on ? strip(v.last.summary).toLowerCase() : st.label, x + 38, yy + 10, cur ? C.text : on ? C.sub : C.dim, 9.5, 400, 'left', MONO, w - 40);
      tip(x - 3, yy - 2, w + 6, rowH - 1, `<b>${esc(st.label)}</b>${cur ? ' <b style="color:' + h + '">◀ current step</b>' : ''} · ${v.n} event${v.n === 1 ? '' : 's'}<br>${on ? `latest ${fmtET(v.last.time)} et: ${esc(strip(v.last.summary))}` : 'no events at this step'}<br><span class="tm">${esc(st.tip)}</span>`); });
    y = y0 + rowH * 5 + 12;
    const lin = S.links.filter(l => l.to === a.id), lout = S.links.filter(l => l.from === a.id);
    const sum = ls => ls.reduce((s, l) => s + (l.count || 0), 0) + (ls.some(l => l.count == null) ? '+?' : '');
    const cw3 = w / 3, all = V.perAgent(a.id);
    drawIcon(ctx, 'a2a', x, y - 10, 12, C.sub, 2); txt(`${sum(lin)}/${sum(lout)}`, x + 16, y, C.text, 10, 700, 'left', MONO, cw3 - 18); tip(x, y - 12, cw3, 15, `a2a messages in / out (known link counts): ${sum(lin)} / ${sum(lout)}`);
    drawIcon(ctx, 'events', x + cw3, y - 10, 12, C.sub, 2); txt(String(all.length), x + cw3 + 16, y, C.text, 10, 700); tip(x + cw3, y - 12, cw3, 15, `${all.length} timeline events involve ${esc(a.name)}`);
    drawIcon(ctx, 'clock', x + 2 * cw3, y - 10, 12, C.sub, 2); txt(a.last_active ? (a.last_active.length > 10 ? fmtET(a.last_active).slice(6) : fmtET(a.last_active)) : '?', x + 2 * cw3 + 16, y, a.last_active ? C.text : C.dim, 10, 700); tip(x + 2 * cw3, y - 12, cw3, 15, `last active ${a.last_active ? fmtET(a.last_active) + ' et' : 'unknown'}`);
    y += 9;
    const ev = all.slice(-48), cols = 24, cs = w / cols;
    for (let i = 0; i < 48; i++) { const cx = x + (i % cols) * cs, cy = y + Math.floor(i / cols) * cs; const e = ev[i];
      if (!e) { ctx.strokeStyle = C.border; ctx.strokeRect(cx + .5, cy + .5, cs - 2.5, cs - 2.5); continue; }
      const done = /deliverable|verified|report|checkin/.test(e.type) || /done/i.test(e.outcome || ''); const hot = S.cursor === e;
      if (done || hot) { ctx.fillStyle = hot ? C.activeHi : rgba(hue(a.id), 0.85); ctx.fillRect(cx, cy, cs - 1.5, cs - 1.5); }
      else { ctx.strokeStyle = /block|pending|wait/i.test((e.outcome || '') + e.type) ? C.waiting : rgba(hue(a.id), 0.9); ctx.strokeRect(cx + .5, cy + .5, cs - 2.5, cs - 2.5); } }
    tip(x, y, w, cs * 2, `activity: newest ${Math.min(48, all.length)} of ${all.length} events (filled = done/verified/report)`);
    y += cs * 2 + 14;
    if (a.kpi) { const [k, v] = a.kpi[0]; drawIcon(ctx, a.id === 'skill_finder' ? 'research' : 'deliver', x, y - 10, 12, C.sub, 2); txt(String(v), x + 17, y, /unknown|not created/.test(String(v)) ? C.dim : C.text, 10, 400, 'left', MONO, w - 17); tip(x, y - 12, w, 15, esc(k) + ': ' + esc(v)); }
    const q = (V.queued || {})[a.id] || [], yb = p.y + p.h - 9;
  };
  const inputPanel = p => {
    const x = p.x + 10, w = p.w - 20; let y = p.y + 44; const R = (k, v, c) => { kv(k, v, x, y, w, c); y += 15; };
    const RI = (icon, k, v, c) => { let mw; if (MOB) { font(10); mw = w - 26 - Math.min(ctx.measureText(k).width, w * 0.55); } ikv(icon, v, x, y, w, c, k, C.sub, mw); txt(k, x + 17, y, C.dim, 10, 400, 'left', MONO, w * 0.55); y += 15; };
    if (p.id === 'damon') { panel(p, 'owner', '', hue('damon'), 0, 'damon', 'human gate: the only decision-maker');
      RI('check', 'approvals logged', V.approvals ?? 'unknown', C.waiting);
      if (PUB) { RI('hourglass', 'decisions pending', (V.waitingCount ?? 'unknown'), C.waiting); RI('gate', 'gate', 'owner approves sends + spend', C.sub); }
    }
    if (p.id === 'drive') { panel(p, 'audit log', '', C.active, 0, 'drive', 'Team record: audit log rows, timeline, board updates, daily reports');
      RI('events', 'audit log rows', D.meta.audit_rows); RI('log', 'timeline events', D.events.length); RI('deliver', 'ceo writes', D.links.find(l => l.from === 'ceo' && l.to === 'drive')?.count ?? 'unknown');
      RI('project', 'board updates', D.links.find(l => /board/.test(l.to))?.count ?? 'unknown'); RI('drive', 'daily reports', (/Day (\d+)/.exec(D.freshness?.daily?.as_of || '') || [])[1] ? 'day 1-' + /Day (\d+)/.exec(D.freshness.daily.as_of)[1] : 'unknown'); }
    if (p.id === 'skills') { const sf = V.A.skill_finder, us = V.A.up_skiller; panel(p, 'skills pipeline', '', C.active, 0, 'skill_finder', 'Skill-Finder vets skills, Up-Skiller installs them on the VPS agents');
      RI('skill_finder', 'finder runs', sf?.metrics?.runs ?? 'unknown'); RI('research', 'last run vetted', sf?.metrics?.found ?? 'unknown'); RI('up_skiller', 'installer runs', us?.metrics?.runs ?? 'unknown'); RI('deliver', 'installed (last run)', us?.metrics?.installed_last ?? 'unknown'); }
    if (p.id === 'hub') { panel(p, 'agent hq hub', V.hubLive ? 'live' : 'snapshot', C.active, 0, 'hub', 'Agent HQ hub: posts per channel; chip = lead agent (most posts) + share');
      const chs = Object.entries(D.meta.hub_channels), mx = Math.max(1, ...chs.map(c => c[1])), rh = Math.min(15, 68 / Math.max(1, chs.length));
      chs.forEach(([k, v]) => { const L = I.streams.channels[k]; txt('#' + k, x, y, C.sub, 10, 400, 'left', MONO, 70); segBar(x + 72, y - 6, w - 150, v / mx * 100, C.activeLo, 10, 5); txt(String(v), x + w - 50, y, C.text, 10, 400, 'right');
        if (L?.id) chip(L.id, x + w - 38, y - 3.5, 5.5, L.share); else txt('n/a', x + w - 32, y, C.dim, 9); tip(x - 2, y - 11, w + 4, rh, leadTip(L, '#' + k + ' · ' + v + ' posts')); y += rh; });
      txt(`${D.meta.hub_posts} posts`, x, p.y + p.h - 7, C.dim, 10); }
  };
  const heat = y => { if (y == null) return; const i = Math.round((y - (ceo.y + 40)) / ((ceo.h - 70) / 39)); for (let k = -1; k <= 1; k++) if (i + k >= 0 && i + k < 40) S.spineHeat[i + k] = Math.max(S.spineHeat[i + k], k ? 0.5 : 1); };
  const ceoPanel = (p, dt) => { const nb = BLK.agents.get('ceo') || 0; ctx.fillStyle = C.panel; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.fillStyle = C.panelHd; ctx.fillRect(p.x, p.y, p.w, 26); ctx.strokeStyle = C.border; ctx.strokeRect(p.x + .5, p.y + .5, p.w - 1, p.h - 1); ctx.fillStyle = hue('ceo'); ctx.fillRect(p.x, p.y, 3, 26);
    drawIcon(ctx, 'ceo', p.x + 10, p.y + 5, 16, hue('ceo'), 2); txt('CEO', p.x + 32, p.y + 18, C.text, 12, 700); tip(p.x, p.y, p.w, 26, `<b style="color:${hue('ceo')}">CEO</b> · ${esc(V.A.ceo.platform)}<br>${esc(V.A.ceo.role)}`);
     const x = p.x + p.w / 2;
    drawIcon(ctx, 'route', x - 7, p.y + 31, 14, C.sub, 2); ctx.strokeStyle = C.border; ctx.beginPath(); ctx.moveTo(x, p.y + 48); ctx.lineTo(x, p.y + p.h - 34); ctx.stroke();
    for (let i = 0; i < 40; i++) { const y = p.y + 40 + 10 + i * ((p.h - 84) / 39), h = S.spineHeat[i]; S.spineHeat[i] *= Math.pow(0.15, dt);
      if (h > 0.05) { ctx.globalAlpha = Math.min(1, h * 1.2); ctx.drawImage(SP.lime, x - 9, y - 9, 18, 18); ctx.globalAlpha = 1; } ctx.fillStyle = h > 0.05 ? C.active : C.muted; ctx.fillRect(x - 3, y - 3, 6, 6); }
    drawIcon(ctx, 'events', x - 22, p.y + p.h - 30, 11, C.sub, 2); txt(String(V.perAgent('ceo').length), x - 8, p.y + p.h - 21, C.text, 10, 700);
    drawIcon(ctx, 'clock', x - 22, p.y + p.h - 17, 11, C.sub, 2); txt(fmtET(V.A.ceo.last_active).slice(6), x - 8, p.y + p.h - 8, C.dim, 10);
    tip(p.x, p.y + 30, p.w, p.h - 30, `router spine: lights up as messages pass through CEO<br>${V.perAgent('ceo').length} events · last ${fmtET(V.A.ceo.last_active)} et`); };
  const brain = (p, t) => { panel(p, 'core', '', C.active, 0, 'globe', 'Team core: CEO at the centre, agents orbit with their sub-agents');
    const cx = p.x + p.w / 2, cy = p.y + 130, R = Math.min(70, p.w * 0.33), rot = t * 0.25, tilt = 0.45;
    const pr = (lat, lon) => { const x = Math.cos(lat) * Math.cos(lon + rot), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon + rot); const Y = y * Math.cos(tilt) - z * Math.sin(tilt), Z = y * Math.sin(tilt) + z * Math.cos(tilt); return [cx + x * R, cy + Y * R, Z]; };
    ctx.save(); ctx.beginPath(); ctx.rect(p.x + 1, p.y + 27, p.w - 2, p.h - 28); ctx.clip();
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); for (let k = 0; k <= 48; k++) { const q = pr(i * Math.PI / 8, k / 48 * 2 * Math.PI); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.strokeStyle = rgba(C.active, 0.18); ctx.stroke(); }
    for (let j = 0; j < 12; j++) { ctx.beginPath(); for (let k = 0; k <= 40; k++) { const q = pr(-Math.PI / 2 + k / 40 * Math.PI, j * Math.PI / 6); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.strokeStyle = rgba(C.active, 0.13); ctx.stroke(); }
    const n = Math.min(60, V.a2aKnown);
    for (let i = 0; i < n; i++) { const q = i % 2 ? pr(((i % 7) - 3) * Math.PI / 8, (t * 0.6 + i * 0.37) % 6.283) : pr(-Math.PI / 2 + ((t * 0.3 + i * 0.11) % 1) * Math.PI, i * 0.52); ctx.globalAlpha = q[2] > 0 ? 0.9 : 0.35; ctx.drawImage(SP.w, q[0] - 3.5, q[1] - 3.5, 7, 7); }
    ctx.globalAlpha = 1; const pul = 1 + 0.08 * Math.sin(t * 2) + (S.flash.ceo || 0) * 0.3; ctx.drawImage(sprC(hue('ceo')), cx - 26 * pul, cy - 26 * pul, 52 * pul, 52 * pul);
    orb(cx, cy, 5, 'ceo', { status: STATUS_RING(V.A.ceo.tag, BLK.agents.get('ceo')) });
    const kids = par => SUBS.filter(s => s.parent === par);
    const drawKids = (par, px, py, rr, sz) => kids(par).forEach((s, j, arr) => { const a = t * 0.9 + j / arr.length * Math.PI * 2 + (par === 'ceo' ? 0.5 : 0); const kx = px + Math.cos(a) * rr, ky = py + Math.sin(a) * rr * 0.7;
      ctx.strokeStyle = rgba(s.hue, 0.6); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(kx, ky); ctx.stroke(); orb(kx, ky, sz, s.id, { hue: s.hue, acc: s.accent }); });
    drawKids('ceo', cx, cy, 30, 2.6);
    const sats = ['reed', 'evelyn', 'dutchess', 'viv', 'agent_builder', 'friend', 'motion', 'product_manager', 'cto'].filter(id => V.A[id]);
    sats.forEach((id, i) => { const ang = t * 0.35 + i / sats.length * Math.PI * 2; const sx = cx + Math.cos(ang) * p.w * 0.38, sy = cy + Math.sin(ang) * 46 + 6; const ag = V.A[id], f = S.flash[id] || 0;
      ctx.globalAlpha = Math.sin(ang) > -0.2 ? 1 : 0.55; drawKids(id, sx, sy, 12, 1.6);
      orb(sx, sy, 3 + f * 2, id, { status: STATUS_RING(ag.tag, BLK.agents.get(id)) }); drawIcon(ctx, AICON[id], sx + 6, sy - 15, 10, hue(id), 2); });
    ctx.restore(); ctx.globalAlpha = 1; drawIcon(ctx, 'sparkles', p.x + 9, p.y + p.h - 20, 12, C.dim, 2); txt(`${n} = known a2a msgs`, p.x + 25, p.y + p.h - 9, C.dim, 10); };
  const streams = p => { panel(p, 'stream leads', '', C.active, 0, 'route', `<b>Who leads each stream</b><br><span class="tm">${esc(FORMULAS.lead)}</span>`);
    const x = p.x + 9, w = p.w - 18; let y = p.y + 42;
    txt('hub channels', x, y, C.dim, 9); y += 13;
    Object.entries(D.meta.hub_channels).forEach(([k, v]) => { const L = I.streams.channels[k]; drawIcon(ctx, 'hub', x, y - 9, 11, C.sub, 2); txt('#' + k, x + 15, y, C.sub, 10, 400, 'left', MONO, 66);
      if (L?.id) { chip(L.id, x + 92, y - 3.5, 6.5); segBar(x + 102, y - 6, w - 104 - 30, L.share * 100, hue(L.id), 8, 5); txt(Math.round(L.share * 100) + '%', x + w, y, hue(L.id), 9, 700, 'right'); } else txt('n/a · ' + v, x + w, y, C.dim, 9, 400, 'right');
      tip(x - 2, y - 11, w + 4, 15, leadTip(L, '#' + k + ' channel (' + v + ' posts)')); y += 15; });
    y += 6; txt('pipeline stages', x, y, C.dim, 9); y += 13;
    STG.forEach((sname, i) => { const L = I.streams.stages[i]; drawIcon(ctx, STGI[i], x, y - 9, 11, i === 4 ? C.waiting : C.sub, 2); txt(sname, x + 15, y, C.sub, 10, 400, 'left', MONO, 66);
      if (L?.id) { chip(L.id, x + 92, y - 3.5, 6.5); segBar(x + 102, y - 6, w - 104 - 30, L.share * 100, hue(L.id), 8, 5); txt(Math.round(L.share * 100) + '%', x + w, y, hue(L.id), 9, 700, 'right'); } else txt('n/a', x + w, y, C.dim, 9, 400, 'right');
      tip(x - 2, y - 11, w + 4, 15, leadTip(L, sname + ' stage')); y += 15; }); };
  const ids8 = ['ceo', 'reed', 'evelyn', 'dutchess', 'skill_finder', 'up_skiller', 'viv', 'agent_builder', 'friend', 'motion', 'product_manager', 'cto'].filter(id => V.A[id]);
  const t0 = new Date(V.events[0].time).getTime(), t1 = new Date(V.events[V.events.length - 1].time).getTime();
  const NB = 24, bw = (t1 - t0) / NB + 1;
  const SG = ids8.map(id => { const row = new Array(NB).fill(0); V.events.forEach(e => { if (e.agent === id || e.route.some(r => r.includes(id))) row[Math.min(NB - 1, Math.floor((new Date(e.time) - t0) / bw))]++; }); return row; });
  const sgMax = Math.max(1, ...SG.flat());
  const spectro = (p, t) => { panel(p, 'a2a spectrogram', `${NB} × ${(bw / 36e5).toFixed(1)}h`, C.active, 0, 'grid', 'Agents × time buckets from the real timeline; right column = each agent\'s share of all involvement');
    const x0 = p.x + 30, y0 = p.y + 34, cw = (p.w - 74) / NB, ch = (p.h - 58) / ids8.length;
    const cb = S.cursor ? Math.min(NB - 1, Math.floor((new Date(S.cursor.time) - t0) / bw)) : -1;
    ids8.forEach((id, r) => { const hu = hue(id), sa = isSub(id) ? accent(id) : null, yy = y0 + r * ch;
      drawIcon(ctx, AICON[id], p.x + 9, yy + ch / 2 - 6.5, 12, hu, 2.2); if (sa) txt(sa.glyph, p.x + 23, yy + ch / 2 + 3, sa.color, 8, 700);
      for (let b = 0; b < NB; b++) { const v = SG[r][b] / sgMax, sh = 0.82 + 0.18 * Math.sin(t * 2.2 + b * 0.6 + r * 1.3);
        ctx.fillStyle = v ? rgba(hu, Math.min(1, (0.15 + v * 0.85) * sh)) : C.muted; ctx.fillRect(x0 + b * cw, yy, cw - 2, ch - 3);
        if (b === cb) { ctx.strokeStyle = C.activeHi; ctx.strokeRect(x0 + b * cw + .5, yy + .5, cw - 3, ch - 4); } }
      const R = I.streams.rows[id]; txt(R?.share != null ? Math.round(R.share * 100) + '%' : 'n/a', p.x + p.w - 8, yy + ch / 2 + 3, R?.n ? hu : C.dim, 9, 700, 'right');
      tip(p.x, yy, p.w, ch, `<b style="color:${hu}">${esc(V.A[id].name)}</b> · ${R?.n ?? 0} events involved (${R?.share != null ? Math.round(R.share * 100) : 0}% of all involvement)`); });
    txt(fmtET(V.events[0].time), x0, p.y + p.h - 8, C.dim, 9); txt(`max ${sgMax}/cell`, p.x + p.w / 2, p.y + p.h - 8, C.dim, 9, 400, 'center');
    txt(fmtET(V.events[V.events.length - 1].time), p.x + p.w - 40, p.y + p.h - 8, C.dim, 9, 400, 'right'); };
  const TY = { task_assigned: ['route', C.active, 'route'], deliverable: ['done', C.success, 'deliver'], a2a_message: ['a2a', C.activeHi, 'a2a'], checkin: ['intake', C.sub, 'intake'], report: ['report', C.sub, 'log'], verified: ['verify', C.success, 'check'], activity: ['log', C.dim, 'events'] };
  const runlog = p => { panel(p, 'run log', V.hubLive ? 'live' : 'replay', C.active, 0, 'log', 'Real timeline, replayed; new hub posts fire live. Chips = lead agent of each event-type stream');
    const x = p.x + 10; let cx = x;
    Object.entries(I.streams.types).sort((a, b) => b[1].total - a[1].total).forEach(([ty, L]) => { const [lab, col, ic] = TY[ty] || ['log', C.dim, 'events']; if (cx > p.x + p.w - 60) return;
      drawIcon(ctx, ic, cx, p.y + 32, 11, col, 2); const w1 = chip(L.id, cx + 20, p.y + 37.5, 5.5, L.share); tip(cx - 2, p.y + 29, w1 + 26, 16, leadTip(L, lab + ' stream (' + L.total + ' events)')); cx += w1 + 30; });
    const lines = S.log.slice(-11);
    lines.forEach((L, i) => { const e = L.e, y = p.y + 64 + i * 17; ctx.globalAlpha = Math.min(1, 0.25 + (V.now - L.at) * 3);
      const [lab, col, ic] = TY[e.type] || ['log', C.dim, 'events']; txt(fmtET(e.time).slice(6), x, y, C.dim, 10); drawIcon(ctx, ic, x + 40, y - 9, 11, col, 2);
      if (V.A[e.agent]) chip(e.agent, x + 64, y - 3.5, 6.5, null); else txt('?', x + 64, y, C.dim, 10, 700, 'center');
      txt(strip(e.summary).toLowerCase(), x + 78, y, e.fresh ? C.active : C.sub, 10, e.fresh ? 700 : 400, 'left', MONO, p.w - 88);
      tip(x - 2, y - 12, p.w - 16, 16, `${fmtET(e.time)} et · <b>${esc(lab)}</b> · ${esc(V.A[e.agent]?.name || e.agent)} · step: ${esc(stepOf(e))}<br>${esc(strip(e.summary))}`); });
    ctx.globalAlpha = 1; txt('team $ replay events ' + (Math.floor(V.now * 2) % 2 ? '█' : ''), x, p.y + p.h - 8, C.active, 10); };
  const B = I.board;
  const board = (p, t, dt) => { panel(p, 'agent leaderboard', 'live', C.active, 0, 'trophy', `<b>Agent Leaderboard</b><br>All metrics from the real timeline; n/a = not enough data.<br><span class="tm">${esc(FORMULAS.top)}</span>`);
    const x = p.x + 8, NW = p.w < BOARD_NARROW, tw = NW ? (p.w - 16 - 5) / 2 : (p.w - 16 - 15) / 4;
    const tiles = [['zap', 'works most', B.works, r => `${r.w24} · 24h`, FORMULAS.works],
      ['target', 'effective', B.effective, r => Math.round(r.eff * 100) + '%', FORMULAS.effective],
      ['hourglass', 'idles most', B.idle, r => r.idleH < 48 ? r.idleH.toFixed(1) + 'h' : Math.floor(r.idleH / 24) + 'd ' + Math.round(r.idleH % 24) + 'h', FORMULAS.idle],
      ['medal', '#1 overall', B.top, r => r.score + (r.partial ? '*' : ''), FORMULAS.top]];
    tiles.forEach(([ic, lab, r, fmt, f], i) => { const tx = x + (NW ? i % 2 : i) * (tw + 5), ty = p.y + 33 + (NW ? Math.floor(i / 2) * 69 : 0), th = 64, hu = r ? hue(r.id) : C.dim, g = r && S.lbGlow['t' + i] || 0;
      ctx.fillStyle = rgba(hu, 0.08 + 0.12 * g); ctx.fillRect(tx, ty, tw, th); ctx.strokeStyle = rgba(hu, 0.5); ctx.strokeRect(tx + .5, ty + .5, tw - 1, th - 1);
      drawIcon(ctx, ic, tx + 5, ty + 5, 12, i === 2 ? C.waiting : C.active, 2.2); txt(lab, tx + 20, ty + 14, C.sub, 9, 400, 'left', MONO, tw - 22);
      if (r) { chip(r.id, tx + 13, ty + 32, 8); txt(short(r.id, V.A), tx + 25, ty + 36, hu, 10, 700, 'left', MONO, tw - 27); txt(fmt(r), tx + tw / 2, ty + 56, C.text, 11, 700, 'center', MONO, tw - 6); }
      else txt('n/a', tx + tw / 2, ty + 40, C.dim, 11, 700, 'center');
      tip(tx, ty, tw, th, `<b>${esc(lab)}</b>${r ? `: <b style="color:${hu}">${esc(V.A[r.id].name)}</b> · ${esc(fmt(r))}${i === 0 ? ' (' + r.w7 + ' in 7 d)' : ''}` : ': n/a'}<br><span class="tm">${esc(f)}</span>`); });
    const ly = p.y + (NW ? 186 : 112), rh = NW ? 14 : 13.2, rx = p.x + p.w - 10, c7 = NW ? rx - 112 : x + 140, cE = NW ? rx - 72 : x + 178, cI = NW ? rx - 38 : x + 214, nmW = NW ? c7 - 24 - (x + 31) : 74;
    txt('#', x + 2, ly, C.dim, 9); txt('agent', x + 30, ly, C.dim, 9); txt('7d', c7, ly, C.dim, 9, 400, 'right'); txt('eff', cE, ly, C.dim, 9, 400, 'right'); txt('idle', cI, ly, C.dim, 9, 400, 'right'); txt('score', rx, ly, C.dim, 9, 400, 'right');
    const list = [...B.rank, ...B.rows.filter(r => r.score == null)];
    list.forEach((r, i) => { const target = ly + 6 + i * rh; if (S.lbY[r.id] == null) S.lbY[r.id] = target; S.lbY[r.id] += (target - S.lbY[r.id]) * Math.min(1, dt * 4);
      if (S.lbRank[r.id] != null && r.rank != null && S.lbRank[r.id] !== r.rank) S.lbGlow[r.id] = 1; S.lbRank[r.id] = r.rank; S.lbGlow[r.id] = (S.lbGlow[r.id] || 0) * Math.pow(0.3, dt);
      const yy = S.lbY[r.id], hu = hue(r.id), g = S.lbGlow[r.id] || 0; if (g > 0.02) { ctx.fillStyle = rgba(hu, 0.25 * g); ctx.fillRect(x, yy, p.w - 16, rh - 1); }
      txt(r.rank ? String(r.rank) : '–', x + 4, yy + 10, r.rank === 1 ? C.active : C.sub, 10, 700); chip(r.id, x + 22, yy + 6, 5.5); txt(short(r.id, V.A), x + 31, yy + 10, r.score == null ? C.dim : C.text, 10, 400, 'left', MONO, nmW);
      txt(String(r.w7), c7, yy + 10, C.sub, 9.5, 400, 'right'); txt(r.eff == null ? 'n/a' : Math.round(r.eff * 100) + '%', cE, yy + 10, r.eff == null ? C.dim : C.sub, 9.5, 400, 'right');
      txt(r.idleH == null ? 'n/a' : r.idleH < 48 ? r.idleH.toFixed(0) + 'h' : Math.floor(r.idleH / 24) + 'd', cI, yy + 10, r.idleH == null ? C.dim : r.idleH > 24 ? C.waiting : C.sub, 9.5, 400, 'right');
      if (r.score != null && !NW) { const bwid = p.w - 16 - 228 - 28; ctx.fillStyle = C.muted; ctx.fillRect(x + 222, yy + 4, bwid, 5); ctx.fillStyle = hu; ctx.fillRect(x + 222, yy + 4, bwid * r.score / 100 * (0.97 + 0.03 * Math.sin(t * 2 + i)), 5); }
      txt(r.score == null ? 'n/a' : r.score + (r.partial ? '*' : ''), p.x + p.w - 10, yy + 10, r.score == null ? C.dim : r.rank === 1 ? C.active : C.text, 10, 700, 'right');
      tip(x, yy, p.w - 16, rh, `<b style="color:${hu}">${esc(V.A[r.id].name)}</b> ${r.rank ? '· rank #' + r.rank : '· not ranked (no events in 7 d)'}<br>work: ${r.w24} events/24h · ${r.w7}/7d${r.W != null ? ' (W ' + r.W.toFixed(2) + ')' : ''}<br>effectiveness: ${r.eff == null ? 'n/a (denominator ' + r.den + ' < 2)' : Math.round(r.eff * 100) + '% = (' + r.completed + ' done) / ' + r.den}<br>idle: ${r.idleH == null ? 'n/a' : r.idleH.toFixed(1) + ' h'} · active share 24h ${Math.round(r.activeShare * 100)}%${r.R != null ? ' (R ' + r.R.toFixed(2) + ')' : ''}<br>score: ${r.score == null ? 'n/a' : r.score + (r.partial ? ' (* missing term dropped, weights renormalised)' : '')}`); });
  };
  const ring = (cx, cy, r, lw, pct, col) => { ctx.lineWidth = lw; ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    if (pct) { ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * pct / 100); ctx.stroke(); } ctx.lineWidth = 1; };
  const projRows = (x, y0, w, rows) => rows.forEach(([lab, name, note, ic], i) => { const pr = D.projects.find(q => q.name === name), y = y0 + i * 18, pc = pr ? pr.pct : null;
    drawIcon(ctx, ic || 'project', x, y - 10, 12, C.sub, 2); txt(lab, x + 17, y, C.text, 10, 700, 'left', MONO, Math.min(110, w - 142)); if (note) txt(note, x + 130, y, C.waiting, 9, 400, 'left', MONO, 70);
    const bk = BLK.projects.has(name); segBar(x + w - 120, y - 7, 80, pc, pc >= 50 ? C.active : C.waiting, 10, 6); 
    txt(pc == null ? 'n/a' : pc + '%', x + w, y, C.text, 10, 700, 'right'); tip(x - 2, y - 12, w + 4, 16, `<b>${esc(name)}</b>: ${pc == null ? 'n/a' : pc + '%'}${pr && pr.formula && !PUB ? '<br><span class="tm">' + esc(pr.formula) + '</span>' : ''}`); });
  const output = (p, t) => {
    if (PUB) { panel(p, 'team projects', '% to goal', C.active, 0, 'project', 'Progress on the team\'s public projects');
      projRows(p.x + 12, p.y + 50, p.w - 24, (D.public_projects || []).map(q => [q.label, q.name, '', q.icon]));
      const W0 = V.waitingCount ?? 0; drawIcon(ctx, 'gate', p.x + 12, p.y + p.h - 19, 12, C.waiting, 2); txt(`human gate · ${W0} decisions pending owner`, p.x + 29, p.y + p.h - 9, Math.sin(t * 3) > 0 ? C.waiting : rgba(C.waiting, 0.5), 10, 400, 'left', MONO, p.w - 40); return; }
  };
  const drawLinks = (dt, k) => {
    S.links.forEach(l => { const P = l.path, hot = l.tracers.length > 0;
      const bl = lk(l.from, l.to); ctx.strokeStyle = l.unknown ? rgba(C.sub, 0.45) : rgba(C.active, hot ? 0.8 : 0.32); ctx.lineWidth = l.unknown ? 1 : 1.2 + Math.min(2, (l.count || 0) / 8);
      ctx.setLineDash(l.unknown ? [4, 5] : []); ctx.beginPath(); const n = Math.floor(P.s.length * k); for (let i = 0; i < n; i++) i ? ctx.lineTo(P.s[i][0], P.s[i][1]) : ctx.moveTo(P.s[i][0], P.s[i][1]); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      if (k < 1) return;
      l.parts.forEach(pt => { pt.u = (pt.u + pt.v * dt) % 1; const q = at(P, pt.u); ctx.drawImage(SP.w, q[0] - 4, q[1] - 4, 8, 8);
        if (l.spineY != null && ((l.to === 'ceo' && pt.u > 0.985) || (l.from === 'ceo' && pt.u < 0.015))) heat(l.spineY); });
      l.tracers = l.tracers.filter(tr => { tr.u += dt * 260 / P.len; if (tr.u > 1) { S.flash[l.to] = 1; if (l.to === 'ceo') heat(l.spineY); return false; }
        for (let j = 0; j < 6; j++) { const q = at(P, Math.max(0, tr.u - j * 0.015)); ctx.globalAlpha = 1 - j / 6; ctx.drawImage(tr.col ? sprC(tr.col) : SP.lime, q[0] - 9, q[1] - 9, 18, 18); } ctx.globalAlpha = 1; return true; });
      const nm = id => esc(V.A[id]?.name || id);
      tip(l.mid[0] - 6, l.mid[1] - 6, 12, 12, `<b>flow ${nm(l.from)} → ${nm(l.to)}</b> · ${l.count == null ? 'count unknown' : l.count + ' known'}${'' + esc(l.channel || '')}<br>${l.lead?.id ? `lead: <b style="color:${hue(l.lead.id)}">${nm(l.lead.id)}</b> ${Math.round(l.lead.share * 100)}% of ${l.lead.total} routed events` : 'lead: n/a (no routed events)'}`);
    });
    S.links.forEach(l => { if (l.tracers.length && l.lead?.id) { chip(l.lead.id, l.mid[0], l.mid[1], 7, null); } }); };
  return {
    enter(t) { if (!S.born) S.born = t; },
    event(e) { S.cursor = e; S.log.push({ e, at: V.now }); if (S.log.length > 40) S.log.shift(); S.flash[e.agent] = 1;
      e.route.forEach(([f, to]) => { const l = S.links.find(x => x.from === f && x.to === to) || S.links.find(x => x.from === to && x.to === f); if (l) l.tracers.push({ u: 0, col: hue(f) }); }); },
    flowLead(e) { const r = (e.route || [])[0]; if (!r) return null; const l = S.links.find(x => (x.from === r[0] && x.to === r[1]) || (x.from === r[1] && x.to === r[0])); return l ? { link: l, lead: l.lead } : null; },
    frame(t, dt, vw, vh, scrollY) {
      if (!S.born) S.born = t; const dpr = Math.min(2, devicePixelRatio || 1); S.tips = [];
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, vw, vh);
      const z = MOB ? vw / WW : Math.min(vw / W, vh / H), ox = MOB ? 0 : (vw - W * z) / 2, oy = MOB ? -(scrollY || 0) : (vh - H * z) / 2; S.view = { z, ox, oy };
      const wy0 = -oy / z - 20, wy1 = (vh - oy) / z + 20;
      ctx.strokeStyle = C.grid; ctx.beginPath(); const gs = 40 * z; for (let x = ox % gs; x < vw; x += gs) { ctx.moveTo(x, 0); ctx.lineTo(x, vh); } for (let y = oy % gs; y < vh; y += gs) { ctx.moveTo(0, y); ctx.lineTo(vw, y); } ctx.stroke();
      ctx.save(); ctx.translate(ox, oy); ctx.scale(z, z);
      Object.keys(S.flash).forEach(k => S.flash[k] *= Math.pow(0.15, dt));
      const r = ease((t - S.born) / 1.2);
      ctx.globalAlpha = r; drawLinks(dt, ease((t - S.born - 0.3) / 1.0)); ctx.globalAlpha = 1;
      const linkTips = S.tips; S.tips = [];
      Object.values(S.panels).forEach(p => { if (MOB && (p.y > wy1 || p.y + p.h < wy0)) return; ctx.save(); ctx.globalAlpha = r;
        if (p.kind === 'agent') agentPanel(p, V.A[p.id]); else if (p.kind === 'input') inputPanel(p); else if (p.id === 'ceo') ceoPanel(p, dt);
        else if (p.id === 'brain') brain(p, t); else if (p.id === 'streams') streams(p); else if (p.id === 'spectro') spectro(p, t); else if (p.id === 'runlog') runlog(p);
        else if (p.id === 'board') board(p, t, dt); else if (p.id === 'output') output(p, t); ctx.restore(); });
      S.tips = S.tips.concat(linkTips);
      ctx.restore();
    },
    panels: S.panels, links: S.links, state: S, worldW: WW, worldH: WH, mobile: MOB,
    panelRect(id) { const p = S.panels[id]; return p ? { x: p.x, y: p.y, w: p.w, h: p.h } : null; },
    hit(cx, cy) { const { z, ox, oy } = S.view, x = (cx - ox) / z, y = (cy - oy) / z; return Object.values(S.panels).find(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h)?.id || null; },
    tipAt(cx, cy) { const { z, ox, oy } = S.view, x = (cx - ox) / z, y = (cy - oy) / z; const hits = S.tips.filter(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h); return hits.length ? hits.reduce((a, b) => (a.w * a.h <= b.w * b.h ? a : b)).html : null; },
  };
}
