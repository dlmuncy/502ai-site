import * as THREE from './vendor/three.module.min.js';
import { C, THEME } from './palette.js';
import { hue, accent, subAgents, STATUS_RING } from './identity.js';
import { ICONS } from './icons.js';

const STAFF_IDS = ['viv', 'friend', 'motion', 'agent_builder', 'product_manager', 'cto'];
const TEAM_IDS = ['reed', 'evelyn', 'dutchess', 'skill_finder', 'up_skiller'];
const SUBS = new Set(['skill_finder', 'up_skiller']);
const ICON_OF = { hub: 'hub', drive: 'drive' };
const RES = [['hub', 'hub'], ['drive', 'drive']];
const Y0 = { damon: 265, staff: 205, ceo: 45, team: -60, sess: -168, floor: -250, res: -220 }, RS0 = { staff: 300, team: 190, res: 330, floor: 420 };
let Y = { ...Y0 }, RS = { ...RS0 };

export function createOrg(canvas, labelLayer, V, opt = {}) {
  const PUB = !!window.DASH_PUBLIC, lite = !!opt.lite;
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const maxDpr = opt.maxDpr || 2; R.setPixelRatio(Math.min(maxDpr, devicePixelRatio || 1));
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(C.deep, 900, 2600);
  const cam = new THREE.PerspectiveCamera(42, 1, 1, 6000);
  let W = 1, H = 1, root = null, built = null, selected = null, hoverId = null;
  const light = () => THEME === 'light';
  const cnv = (n = 256) => { const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d')]; };
  const T = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const glowTex = (() => { const [c, g] = cnv(128); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return T(c); })();
  const shadowTex = (() => { const [c, g] = cnv(128); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.55, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return T(c); })();
  const ringTex = (style, arc) => { const [c, g] = cnv(256); g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineWidth = style === 'thick' ? 16 : style === 'thin' ? 6 : 10;
    g.setLineDash(style === 'dashed' ? [26, 18] : style === 'dotted' ? [2, 20] : []); g.beginPath(); g.arc(128, 128, 112, 0, arc || Math.PI * 2); g.stroke(); return T(c); };
  const RT = { solid: ringTex('solid'), thin: ringTex('thin'), thick: ringTex('thick'), dashed: ringTex('dashed'), dotted: ringTex('dotted'), arc: ringTex('thick', 2.2), sel: ringTex('dashed') };
  const icon = (g, name, cx, cy, size, color, lw) => { const ps = ICONS[name] || ICONS.sparkles; g.save(); g.translate(cx - size / 2, cy - size / 2); g.scale(size / 24, size / 24);
    g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; ps.forEach(d => g.stroke(new Path2D(d))); g.restore(); };
  const badgeTex = (ic, h, shape) => { const [c, g] = cnv(256); const L = light();
    const path = () => { g.beginPath(); if (shape === 'square') { g.roundRect(30, 30, 196, 196, 46); } else g.arc(128, 128, 104, 0, Math.PI * 2); };
    if (L) { path(); g.fillStyle = h; g.fill(); const gr = g.createLinearGradient(0, 24, 0, 232); gr.addColorStop(0, 'rgba(255,255,255,.28)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); path(); g.fillStyle = gr; g.fill();
      g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.9)'; path(); g.stroke(); if (ic) icon(g, ic, 128, 128, 112, '#ffffff', 2.1); }
    else { path(); const gr = g.createRadialGradient(108, 92, 10, 128, 128, 120); gr.addColorStop(0, C.muted); gr.addColorStop(1, C.deep); g.fillStyle = gr; g.fill();
      g.lineWidth = 12; g.strokeStyle = h; path(); g.stroke(); if (ic) icon(g, ic, 128, 128, 112, h, 2.1); }
    return T(c); };
  const disposeAll = o => o.traverse(x => { x.geometry?.dispose?.(); const m = x.material; if (m) { (Array.isArray(m) ? m : [m]).forEach(mm => { if (mm.map && !Object.values(RT).includes(mm.map) && mm.map !== glowTex && mm.map !== shadowTex) mm.map.dispose(); mm.dispose(); }); } });
  const rig = { tgt: new THREE.Vector3(0, 0, 0), th: 2.4, ph: 1.2, r: 1000, d: { tgt: new THREE.Vector3(0, 0, 0), th: 2.4, ph: 1.2, r: 1000 }, vth: 0, vph: 0, lastInput: -99, fitR: 1000 };
  const home = () => ({ tgt: new THREE.Vector3(0, (Y.damon + Y.floor) / 2 + (opt.mobile ? 30 : -45), 0), th: rig.d.th, ph: 1.2, r: rig.fitR });
  const clampR = r => Math.max(140, Math.min(rig.fitR * 2.2, r));
  const setD = (o) => { if (o.tgt) rig.d.tgt.copy(o.tgt); if (o.th != null) rig.d.th = o.th; if (o.ph != null) rig.d.ph = Math.max(0.28, Math.min(1.75, o.ph)); if (o.r != null) rig.d.r = clampR(o.r); };
  let now = 0; const touch = () => { rig.lastInput = now; tour.on && api.tour(false); };
  let builtMobile = !!opt.mobile;
  function build() {
    builtMobile = !!opt.mobile; const MS = builtMobile ? 1.25 : 1, SY = builtMobile ? 1.75 : 1, SR = builtMobile ? 0.8 : 1;
    Y = Object.fromEntries(Object.entries(Y0).map(([k, v]) => [k, v * SY])); RS = Object.fromEntries(Object.entries(RS0).map(([k, v]) => [k, v * SR]));
    if (root) { scene.remove(root); disposeAll(root); }
    root = new THREE.Group(); scene.add(root); const L = light();
    R.setClearColor(C.deep); scene.fog.color.set(C.deep);
    const A = V.A, has = id => !!A[id];
    const N = new Map(); const node = (id, kind, p, size, extra = {}) => { const n = { id, kind, p, size: size * MS, ...extra, pulse: 0, heat: 0 }; N.set(id, n); return n; };
    if (has('damon')) node('damon', 'human', new THREE.Vector3(0, Y.damon, 0), 46);
    node('ceo', 'agent', new THREE.Vector3(0, Y.ceo, 0), 54);
    const staff = STAFF_IDS.filter(has), team = TEAM_IDS.filter(has);
    staff.forEach((id, i) => { const a = (i + 0.5) / staff.length * Math.PI * 2 + 0.35; node(id, 'agent', new THREE.Vector3(Math.cos(a) * RS.staff, Y.staff + (i % 2 ? -14 : 14) * SY, Math.sin(a) * RS.staff), 40, { parent: has('damon') ? 'damon' : 'ceo', ang: a }); });
    team.forEach((id, i) => { const a = i / team.length * Math.PI * 2 + 0.35 + Math.PI / team.length; const sub = SUBS.has(id);
      node(id, sub ? 'sub' : 'agent', new THREE.Vector3(Math.cos(a) * RS.team, Y.team + (sub ? 22 : 0) * SY, Math.sin(a) * RS.team), sub ? 30 : 42, { parent: 'ceo', ang: a, sub }); });
    const res = RES;
    res.forEach(([id], i) => { const a = (i / res.length) * Math.PI * 2 + 1.1; node(id, 'res', new THREE.Vector3(Math.cos(a) * RS.res, Y.res, Math.sin(a) * RS.res), 30); });
    const dyn = subAgents(V, { maxPer: lite ? 2 : 3 }).filter(s => !s.static);
    const kids = {}; dyn.forEach(s => { const par = s.known && N.has(s.parent) ? s.parent : 'hub'; (kids[par] = kids[par] || []).push(s); });
    Object.entries(kids).forEach(([par, ks]) => { const P = N.get(par).p; const base = Math.atan2(P.z, P.x) || 0;
      ks.forEach((s, j) => { const spread = ks.length === 1 ? 0 : (j / (ks.length - 1) - 0.5) * 1.6; const a = base + spread; const rr = par === 'ceo' ? 92 : 62;
        const p = par === 'ceo' ? new THREE.Vector3(Math.cos(a + 2.2) * rr, Y.ceo - 62 * SY, Math.sin(a + 2.2) * rr) : par === 'hub' ? new THREE.Vector3(P.x + Math.cos(base + spread) * 60, P.y + 70, P.z + Math.sin(base + spread) * 60)
          : new THREE.Vector3(P.x + Math.cos(a) * rr, Y.sess - (j % 2) * 18 * SY, P.z + Math.sin(a) * rr);
        node(s.id, 'session', p, 17, { parent: par, sub: s, known: s.known && par !== 'hub' }); }); });
    const gl = []; for (let r = 80; r <= RS.floor + 1; r += (RS.floor - 80) / 4) for (let k = 0; k < 96; k++) { const a0 = k / 96 * Math.PI * 2, a1 = (k + 1) / 96 * Math.PI * 2; gl.push(Math.cos(a0) * r, Y.floor, Math.sin(a0) * r, Math.cos(a1) * r, Y.floor, Math.sin(a1) * r); }
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; gl.push(Math.cos(a) * 80, Y.floor, Math.sin(a) * 80, Math.cos(a) * RS.floor, Y.floor, Math.sin(a) * RS.floor); }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(gl, 3));
    root.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: L ? C.activeLo : C.active, transparent: true, opacity: L ? 0.35 : 0.07, depthWrite: false })));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(RS.floor + 20, 72), new THREE.MeshBasicMaterial({ color: L ? '#ffffff' : C.navy, transparent: true, opacity: L ? 0.7 : 0.38, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = Y.floor - 1; root.add(disc);
    const dl = []; N.forEach(n => { if (n.kind !== 'session') dl.push(n.p.x, n.p.y - n.size * 0.55, n.p.z, n.p.x, Y.floor, n.p.z); });
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(dl, 3));
    const dlm = new THREE.LineDashedMaterial({ color: L ? '#9aa6b8' : C.sub, dashSize: 4, gapSize: 6, transparent: true, opacity: L ? 0.5 : 0.18, depthWrite: false }); const dls = new THREE.LineSegments(dg, dlm); dls.computeLineDistances(); root.add(dls);
    N.forEach(n => { if (n.kind === 'session') return; const s = new THREE.Mesh(new THREE.CircleGeometry(n.size * 0.42, 24), new THREE.MeshBasicMaterial({ color: L ? '#1f2a3d' : hue(n.kind === 'res' ? 'x' : n.id), transparent: true, opacity: L ? 0.12 : 0.22, depthWrite: false }));
      s.rotation.x = -Math.PI / 2; s.position.set(n.p.x, Y.floor + 0.5, n.p.z); root.add(s); });
    const plates = [[RS.staff, Y.staff], [RS.team, Y.team]].map(([r, y], i) => { const pts = []; for (let k = 0; k <= 160; k++) { const a = k / 160 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
      const m = new THREE.LineDashedMaterial({ color: L ? C.active : C.active, dashSize: 10, gapSize: 9, transparent: true, opacity: L ? 0.28 : 0.2, depthWrite: false });
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m); ln.computeLineDistances(); ln.position.y = y; root.add(ln); return ln; });
    const DN = L ? (lite ? 160 : 320) : (lite ? 700 : 1600), dp = new Float32Array(DN * 3);
    for (let i = 0; i < DN; i++) { const r = 520 + Math.random() * 1500, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1); dp[i * 3] = r * Math.sin(b) * Math.cos(a); dp[i * 3 + 1] = r * Math.cos(b) * 0.6; dp[i * 3 + 2] = r * Math.sin(b) * Math.sin(a); }
    const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ size: L ? 5 : 3.2, map: glowTex, color: L ? C.activeLo : C.sub, transparent: true, opacity: L ? 0.55 : 0.5, depthWrite: false, blending: L ? THREE.NormalBlending : THREE.AdditiveBlending }));
    root.add(dust);
    const E = new Map(); const ek = (a, b) => a < b ? a + '|' + b : b + '|' + a;
    const curveOf = (a, b, lift) => { const P = N.get(a).p, Q = N.get(b).p; const mid = P.clone().add(Q).multiplyScalar(0.5); const out = mid.clone().setY(0); if (out.length() > 1) out.normalize().multiplyScalar(lift * 0.6);
      mid.add(out); mid.y += lift; return new THREE.QuadraticBezierCurve3(P.clone(), mid, Q.clone()); };
    const tree = []; N.forEach(n => { if (n.parent && N.has(n.parent)) tree.push([n.parent, n.id, n.kind === 'session' && !n.known]); });
    if (N.has('damon')) tree.push(['damon', 'ceo', false]);
    tree.forEach(([a, b, unk]) => { const cv = curveOf(a, b, N.get(b).kind === 'session' ? 0 : -18); const pts = cv.getPoints(32); const g = new THREE.BufferGeometry().setFromPoints(pts);
      const col = unk ? C.sub : hue(N.get(b).kind === 'session' ? a : b);
      const m = unk ? new THREE.LineDashedMaterial({ color: C.sub, dashSize: 5, gapSize: 5, transparent: true, opacity: 0.55 }) : new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: L ? 0.55 : 0.38 });
      const ln = new THREE.Line(g, m); if (unk) ln.computeLineDistances(); root.add(ln); E.set(ek(a, b), { a, b, curve: cv, line: ln, base: m.opacity, tree: true }); });
    const fan = t => /team|reed\/evelyn\/dutchess/.test(t) ? ['reed', 'evelyn', 'dutchess'] : [t === 'board' ? 'drive' : t];
    const flows = new Map();
    const addFlow = (f, t, count) => { if (!N.has(f) || !N.has(t) || f === t) return; const k = f + '>' + t; const o = flows.get(k) || { f, t, count: null };
      if (count != null) o.count = (o.count || 0) + count; flows.set(k, o); };
    (V.D.links || []).filter(l => l.from !== 'vps agents').forEach(l => fan(l.to).forEach(t => addFlow(l.from, t, l.count)));
    addFlow('hub', 'ceo', V.D.meta?.hub_posts ?? null);
    flows.forEach(fl => { const k = ek(fl.f, fl.t); if (E.has(k)) return; const unk = fl.count == null && ![...flows.values()].some(o => ek(o.f, o.t) === k && o.count != null);
      const cv = curveOf(fl.f, fl.t, 70); const g = new THREE.BufferGeometry().setFromPoints(cv.getPoints(40));
      const m = unk ? new THREE.LineDashedMaterial({ color: C.sub, dashSize: 6, gapSize: 7, transparent: true, opacity: L ? 0.45 : 0.3 }) : new THREE.LineBasicMaterial({ color: L ? '#8fa3bf' : C.active, transparent: true, opacity: L ? 0.45 : 0.16 });
      const ln = new THREE.Line(g, m); if (unk) ln.computeLineDistances(); root.add(ln); E.set(k, { a: fl.f, b: fl.t, curve: cv, line: ln, base: m.opacity }); });
    const PF = []; flows.forEach(fl => { if (!fl.count) return; const e = E.get(ek(fl.f, fl.t)); const n = Math.min(lite ? 5 : 9, 1 + Math.round(fl.count * 0.55));
      const col = new THREE.Color(N.get(fl.f).kind === 'res' ? C.sub : hue(fl.f)); for (let i = 0; i < n; i++) PF.push({ e, rev: e.a !== fl.f, u: i / n + Math.random() * 0.05, v: 0.07 + 0.012 * Math.min(fl.count, 14), col }); });
    const pp = new Float32Array(Math.max(1, PF.length) * 3), pc = new Float32Array(Math.max(1, PF.length) * 3); PF.forEach((p, i) => p.col.toArray(pc, i * 3));
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
    const parts = new THREE.Points(pg, new THREE.PointsMaterial({ size: L ? 9 : 10, map: glowTex, vertexColors: true, transparent: true, opacity: L ? 0.95 : 1, depthWrite: false, blending: L ? THREE.NormalBlending : THREE.AdditiveBlending }));
    root.add(parts);
    const tagOf = id => V.A[id]?.tag; const hueOf = n => n.kind === 'res' ? (L ? '#5f6b7a' : C.sub) : n.kind === 'session' ? (n.known ? hue(n.parent) : C.sub) : hue(n.id);
    N.forEach(n => { const h = hueOf(n); n.hue = h; const s = n.size;
      if (L) { n.shadow = new THREE.Sprite(new THREE.SpriteMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.38 })); n.shadow.scale.set(s * 1.5, s * 1.5, 1); n.shadow.position.copy(n.p).add(new THREE.Vector3(0, -s * 0.22, -2)); root.add(n.shadow); }
      n.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: h, transparent: true, depthWrite: false, opacity: L ? 0.22 : 0.5, blending: L ? THREE.NormalBlending : THREE.AdditiveBlending }));
      n.glow.scale.set(s * (L ? 2 : 2.6), s * (L ? 2 : 2.6), 1); n.glow.position.copy(n.p); root.add(n.glow);
      const ic = n.kind === 'res' ? ICON_OF[n.id] : n.kind === 'session' ? null : n.id;
      n.badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex(ic, h, n.kind === 'res' ? 'square' : 'circle'), transparent: true, depthWrite: true, alphaTest: 0.05 })); n.badge.scale.set(s, s, 1); n.badge.position.copy(n.p); root.add(n.badge);
      if (n.kind !== 'res' && n.kind !== 'session' && V.A[n.id]) { n.ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: RT.solid, color: C.sub, transparent: true, depthWrite: false })); n.ring.scale.set(s * 1.34, s * 1.34, 1); n.ring.position.copy(n.p); root.add(n.ring); }
      if (n.sub || n.kind === 'sub') { const sid = n.kind === 'sub' ? n.id : n.sub.id; const ac = accent(sid).color;
        n.arc = new THREE.Sprite(new THREE.SpriteMaterial({ map: RT.arc, color: ac, transparent: true, depthWrite: false })); n.arc.scale.set(s * 1.55, s * 1.55, 1); n.arc.position.copy(n.p); root.add(n.arc);
        n.dot = new THREE.Mesh(new THREE.SphereGeometry(Math.max(2.2, s * 0.09), 10, 8), new THREE.MeshBasicMaterial({ color: ac })); root.add(n.dot); n.ph = accent(sid).ix; }
      if (labelLayer && opt.labels) { const el = document.createElement('div'); el.className = 'olabel' + (n.kind === 'session' ? ' s' : '') + (n.kind === 'res' ? ' r' : ''); labelLayer.appendChild(el); n.el = el; } });
    const t1 = V.events.length ? new Date(V.events[V.events.length - 1].time).getTime() : 0;
    N.forEach(n => { const k = V.events.filter(e => e.agent === n.id && t1 - new Date(e.time).getTime() <= 864e5).length; n.heat = Math.min(1, k / 12); });
    const selRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: RT.sel, color: C.active, transparent: true, depthWrite: false })); selRing.visible = false; root.add(selRing);
    built = { N, E, PF, parts, pp, plates, dust, selRing, t1, tagOf, comets: [], waves: [] };
    if (labelLayer) labelLayer.querySelectorAll('.olabel').forEach(el => { if (![...N.values()].some(n => n.el === el)) el.remove(); });
  }
  build();
  const cometMat = () => new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: light() ? THREE.NormalBlending : THREE.AdditiveBlending });
  const wave = (n, col) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: RT.thin, color: col, transparent: true, depthWrite: false })); s.position.copy(n.p); root.add(s); built.waves.push({ s, t: 0, base: n.size }); };
  const fire = (f, t) => { const { N, E } = built; if (!N.has(f) || !N.has(t)) return false; const k = f < t ? f + '|' + t : t + '|' + f; const e = E.get(k); if (!e) return false;
    const col = N.get(f).hue; const s = []; for (let i = 0; i < 7; i++) { const sp = new THREE.Sprite(cometMat()); sp.material.color.set(col); sp.material.opacity = (1 - i / 7) * (light() ? 0.9 : 1); const z = (light() ? 16 : 26) - i * 2.2; sp.scale.set(z, z, 1); root.add(sp); s.push(sp); }
    built.comets.push({ e, rev: e.a !== f, u: 0, s, to: t, col }); e.line.material.opacity = Math.min(0.95, e.base + 0.45); return true; };
  const tour = { on: false, i: 0, t: 0, stops: [] };
  const centroid = ids => { const v = new THREE.Vector3(); let k = 0; ids.forEach(id => { const n = built.N.get(id); if (n) { v.add(n.p); k++; } }); return k ? v.multiplyScalar(1 / k) : v; };
  const stopsOf = () => { const N = built.N, has = id => N.has(id); const st = [];
    st.push({ key: 'overview', ids: [], tgt: home().tgt, r: rig.fitR, ph: 1.16 });
    if (has('damon')) st.push({ key: 'damon', ids: ['damon'], tgt: N.get('damon').p.clone(), r: 330, ph: 1.25 });
    st.push({ key: 'ceo', ids: ['ceo'], tgt: N.get('ceo').p.clone(), r: 380, ph: 1.12 });
    const team = ['reed', 'evelyn', 'dutchess'].filter(has); if (team.length) st.push({ key: 'team', ids: team, tgt: centroid(team), r: 520, ph: 1.0 });
    const sk = ['skill_finder', 'up_skiller'].filter(has); if (sk.length) st.push({ key: 'skills', ids: sk, tgt: centroid(sk), r: 380, ph: 1.08 });
    const staff = STAFF_IDS.filter(has); if (staff.length) st.push({ key: 'staff', ids: staff, tgt: new THREE.Vector3(0, Y.staff, 0), r: 760, ph: 0.82 });
    const infra = RES.map(r => r[0]).filter(has); if (infra.length) st.push({ key: 'infra', ids: infra, tgt: centroid(infra).setY(Y.res + 40), r: 640, ph: 1.32 });
    st.push({ key: 'overview', ids: [], tgt: home().tgt, r: rig.fitR, ph: 1.2 }); return st; };
  const goStop = s => { const th = s.ids.length === 1 ? Math.atan2(s.tgt.z, s.tgt.x) : s.ids.length ? Math.atan2(centroid(s.ids).z, centroid(s.ids).x) : rig.d.th + 0.9;
    setD({ tgt: s.tgt, r: s.r, ph: s.ph, th: s.ids.length && (s.tgt.x || s.tgt.z) ? th : rig.d.th + 0.6 }); opt.onTour?.(s, tour.i, tour.stops.length); };
  const P = new Map(); let g0 = null, lastTap = { t: -9, x: 0, y: 0 }, moved = 0, downT = 0, multi = false;
  const rect = () => canvas.getBoundingClientRect();
  const panBy = (dx, dy) => { const k = rig.r * Math.tan(cam.fov * Math.PI / 360) * 2 / H; const right = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 1);
    rig.d.tgt.addScaledVector(right, -dx * k).addScaledVector(up, dy * k); rig.d.tgt.clampLength(0, 700); };
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', ev => { try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic/recorded pointers */ } P.set(ev.pointerId, { x: ev.clientX, y: ev.clientY, b: ev.button, sh: ev.shiftKey }); touch();
    if (P.size === 1) { moved = 0; downT = ev.timeStamp; multi = false; } else multi = true; rig.vth = rig.vph = 0; g0 = null; });
  canvas.addEventListener('pointermove', ev => { const q = P.get(ev.pointerId);
    if (!q) { if (ev.pointerType === 'mouse') { const r = rect(); const id = api.pick(ev.clientX - r.left, ev.clientY - r.top); if (id !== hoverId) { hoverId = id; opt.onHover?.(id, ev.clientX, ev.clientY); } else if (id) opt.onHover?.(id, ev.clientX, ev.clientY); canvas.style.cursor = id ? 'pointer' : 'grab'; } return; }
    const dx = ev.clientX - q.x, dy = ev.clientY - q.y; q.x = ev.clientX; q.y = ev.clientY; moved += Math.abs(dx) + Math.abs(dy); rig.lastInput = now;
    if (P.size === 1) { if (q.b === 2 || q.sh) panBy(dx, dy); else { const k = 0.0062 * (ev.pointerType === 'touch' ? 1.15 : 1); rig.d.th += dx * k; setD({ ph: rig.d.ph - dy * k }); rig.vth = dx * k * 60; rig.vph = -dy * k * 60; } }
    else if (P.size >= 2) { const [a, b] = [...P.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (g0) { if (d > 4 && g0.d > 4) setD({ r: rig.d.r * g0.d / d }); panBy(m.x - g0.m.x, m.y - g0.m.y); } g0 = { d, m }; } });
  const up = ev => { if (!P.has(ev.pointerId)) return; P.delete(ev.pointerId); g0 = null; rig.lastInput = now;
    if (P.size === 0 && !multi && moved < 10 && ev.timeStamp - downT < 450) { const r = rect(), x = ev.clientX - r.left, y = ev.clientY - r.top; const id = api.pick(x, y);
      const tNow = ev.timeStamp / 1000; const dbl = tNow - lastTap.t < 0.45 && Math.hypot(x - lastTap.x, y - lastTap.y) < 44; lastTap = dbl ? { t: -9, x: 0, y: 0 } : { t: tNow, x, y };
      if (dbl) { if (id) api.select(id, true, 0.55); else { api.select(null); api.reset(); } } else { if (id) api.select(id, true); else { api.select(null); } } }
    if (P.size === 0 && (multi || moved >= 10)) { /* inertia keeps the last velocity */ } else { rig.vth = rig.vph = 0; } };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse' && !P.size && hoverId) { hoverId = null; opt.onHover?.(null); } });
  canvas.addEventListener('wheel', ev => { ev.preventDefault(); touch(); setD({ r: rig.d.r * Math.exp(ev.deltaY * 0.0012) }); }, { passive: false });
  canvas.addEventListener('contextmenu', ev => ev.preventDefault());
  const v3 = new THREE.Vector3();
  const api = {
    paused: false, rig,
    get selected() { return selected; }, get nodes() { return built.N; }, get touring() { return tour.on; },
    setTheme() { build(); if (selected && !built.N.has(selected)) selected = null; },
    rebuild(nv) { V = nv; build(); if (selected && !built.N.has(selected)) selected = null; },
    enter() {},
    resize(w, h) { W = Math.max(1, w); H = Math.max(1, h); R.setSize(W, H, false); cam.aspect = W / H;
      if (!!opt.mobile !== builtMobile) build();
      cam.fov = cam.aspect < 0.8 ? 56 : cam.aspect < 1.2 ? 48 : 40;
      const tf = Math.tan(cam.fov * Math.PI / 360); const hy = (Y.damon - Y.floor) / 2 + 40, hx = RS.staff + 50; const fit = Math.max(hy / tf, hx / (tf * cam.aspect)) + RS.staff * 0.9; const was = rig.fitR; rig.fitR = fit;
      if (Math.abs(rig.d.r - was) < 2 || !api._fitOnce) { rig.d.r = rig.r = fit; const h0 = home(); rig.tgt.copy(h0.tgt); rig.d.tgt.copy(h0.tgt); api._fitOnce = true; } cam.updateProjectionMatrix(); },
    project(id) { const n = built.N.get(id); if (!n) return null; v3.copy(n.p).project(cam); return { x: (v3.x * 0.5 + 0.5) * W, y: (-v3.y * 0.5 + 0.5) * H, z: v3.z, px: n.size * H / (2 * Math.tan(cam.fov * Math.PI / 360) * cam.position.distanceTo(n.p)) }; },
    pick(x, y) { let best = null, bd = 1e9; built.N.forEach((n, id) => { const q = api.project(id); if (!q || q.z > 1) return; const d = Math.hypot(q.x - x, q.y - y), lim = Math.max(18, q.px * 0.62) + (opt.mobile ? 10 : 4); if (d < lim && d - q.px * 0.2 < bd) { bd = d - q.px * 0.2; best = id; } }); return best; },
    select(id, fly = true, zoom = 1) { selected = id; const n = id ? built.N.get(id) : null; opt.onSelect?.(id);
      if (n && fly) { const th = Math.atan2(n.p.z, n.p.x); const axis = n.id === 'ceo' || n.id === 'damon';
        const r = (n.kind === 'session' ? 170 : axis ? 330 : 270) * zoom * (opt.mobile ? 1.9 : 1);
        const tgt = n.p.clone(); if (opt.mobile) tgt.y -= r * 0.24;
        setD({ tgt, r, th: (n.p.x || n.p.z) ? th : rig.d.th, ph: n.kind === 'session' ? 1.05 : axis ? 1.38 : 1.18 }); } },
    reset() { setD(home()); },
    orbit(dx, dy) { touch(); rig.d.th += dx; setD({ ph: rig.d.ph + dy }); },
    zoom(k) { touch(); setD({ r: rig.d.r * k }); },
    tour(on) { tour.on = on ?? !tour.on; if (tour.on) { tour.stops = stopsOf(); tour.i = 0; tour.t = 0; goStop(tour.stops[0]); } else opt.onTour?.(null); return tour.on; },
    event(e) { const { N } = built; let any = false; (e.route || []).forEach(([f, t]) => { any = fire(f, t) || any; }); const a = N.get(e.agent); if (a) { a.pulse = 1; if (!any) wave(a, a.hue); } },
    frame(t, dt) { now = t; const { N, E, PF, parts, pp, plates, dust, selRing } = built; const L = light();
      const idle = now - rig.lastInput > 4 && !P.size;
      if (!P.size) { rig.d.th += rig.vth * dt; setD({ ph: rig.d.ph + rig.vph * dt }); rig.vth *= Math.pow(0.04, dt); rig.vph *= Math.pow(0.04, dt); }
      if (idle && !tour.on && !api.paused) rig.d.th += dt * (opt.reduced ? 0.025 : 0.07);
      if (tour.on) { tour.t += dt; if (tour.t > (tour.i === 0 ? 3.2 : 5.6)) { tour.t = 0; tour.i++; if (tour.i >= tour.stops.length) { tour.on = false; opt.onTour?.(null); } else goStop(tour.stops[tour.i]); } }
      const k = 1 - Math.exp(-dt * (tour.on ? 2.2 : 6)); rig.th += (rig.d.th - rig.th) * k; rig.ph += (rig.d.ph - rig.ph) * k; rig.r += (rig.d.r - rig.r) * k; rig.tgt.lerp(rig.d.tgt, k);
      cam.position.set(rig.tgt.x + rig.r * Math.sin(rig.ph) * Math.cos(rig.th), rig.tgt.y + rig.r * Math.cos(rig.ph), rig.tgt.z + rig.r * Math.sin(rig.ph) * Math.sin(rig.th)); cam.lookAt(rig.tgt);
      scene.fog.near = rig.r * 0.9; scene.fog.far = rig.r * 2.6;
      plates.forEach((p, i) => p.rotation.y += dt * (i ? -0.05 : 0.035)); dust.rotation.y += dt * 0.006;
      PF.forEach((p, i) => { p.u = (p.u + p.v * dt) % 1; const q = p.e.curve.getPoint(p.rev ? 1 - p.u : p.u); pp[i * 3] = q.x; pp[i * 3 + 1] = q.y; pp[i * 3 + 2] = q.z; }); parts.geometry.attributes.position.needsUpdate = true;
      E.forEach(e => { if (e.line.material.opacity > e.base) e.line.material.opacity = Math.max(e.base, e.line.material.opacity - dt * 0.35); });
      built.comets = built.comets.filter(c => { c.u += dt * 0.75; c.s.forEach((sp, j) => { const u = Math.max(0, Math.min(1, c.u - j * 0.028)); sp.position.copy(c.e.curve.getPoint(c.rev ? 1 - u : u)); });
        if (c.u > 1.2) { c.s.forEach(sp => { root.remove(sp); sp.material.dispose(); }); const n = N.get(c.to); if (n) { n.pulse = 1; wave(n, c.col); } return false; } return true; });
      built.waves = built.waves.filter(w => { w.t += dt; const s = w.base * (1.2 + w.t * 2.6); w.s.scale.set(s, s, 1); w.s.material.opacity = Math.max(0, 0.9 - w.t * 0.8); if (w.t > 1.15) { root.remove(w.s); w.s.material.dispose(); return false; } return true; });
      N.forEach(n => { n.pulse *= Math.pow(0.25, dt); const breath = 1 + 0.04 * Math.sin(t * 1.6 + n.p.x * 0.01);
        const gs = n.size * (L ? 2 : 2.6) * (1 + n.pulse * 0.6 + n.heat * 0.25) * breath; n.glow.scale.set(gs, gs, 1); n.glow.material.opacity = (L ? 0.16 : 0.35) + n.heat * (L ? 0.12 : 0.3) + n.pulse * 0.3;
        const bs = n.size * (1 + n.pulse * 0.12) * (hoverId === n.id || selected === n.id ? 1.12 : 1); n.badge.scale.set(bs, bs, 1);
        if (n.ring) { const ag = V.A[n.id]; const r = STATUS_RING(ag.tag, V.blk?.agents?.get(n.id)); const tx = r.pulse ? RT.thick : r.style === 'dashed' ? RT.dashed : r.style === 'dotted' ? RT.dotted : r.width <= 1 ? RT.thin : RT.solid;
          if (n.ring.material.map !== tx) { n.ring.material.map = tx; n.ring.material.needsUpdate = true; } n.ring.material.color.set(r.color); n.ring.material.opacity = r.pulse ? 0.55 + 0.45 * Math.sin(t * 5) : (r.alpha || 0.95);
          n.ring.material.rotation = r.style === 'dashed' || r.style === 'dotted' ? t * 0.4 : 0; const rs = n.size * 1.36 * (r.pulse ? 1 + 0.06 * Math.sin(t * 5) : 1); n.ring.scale.set(rs, rs, 1); }
        if (n.arc) { n.arc.material.rotation = -(t * 1.5 + n.ph); const a = t * 1.5 + n.ph + 3.4, rr = n.size * 0.72; v3.set(Math.cos(a) * rr, Math.sin(a) * rr, 0).applyQuaternion(cam.quaternion); n.dot.position.copy(n.p).add(v3); }
        if (n.el) { const q = api.project(n.id); const vis = q && q.z < 1 && q.x > -60 && q.x < W + 60 && q.y > -40 && q.y < H + 40; const show = vis && (n.kind !== 'session' || hoverId === n.id || selected === n.id || selected === n.parent);
          if (show) { n.el.style.transform = `translate(${q.x.toFixed(1)}px,${(q.y + q.px * 0.62 + 4).toFixed(1)}px)`; n.el.style.opacity = 1; const html = opt.labelHtml ? opt.labelHtml(n) : n.id; if (n.el._h !== html) { n.el.innerHTML = html; n.el._h = html; } n.el.classList.toggle('on', hoverId === n.id || selected === n.id); }
          else n.el.style.opacity = 0; } });
      const sn = selected && N.get(selected); selRing.visible = !!sn; if (sn) { selRing.position.copy(sn.p); const s = sn.size * (1.75 + 0.06 * Math.sin(t * 3)); selRing.scale.set(s, s, 1); selRing.material.rotation = -t * 0.6; selRing.material.color.set(C.active); }
      R.render(scene, cam); },
  };
  return api;
}
