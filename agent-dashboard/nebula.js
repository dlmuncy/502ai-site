import * as THREE from './vendor/three.module.min.js';
import { C, TAG, THEME, keyOf } from './palette.js';
import { hue, accent, subAgents, STATUS_RING } from './identity.js';
import { fmtET } from './derive.js';

const HUE_IDS = new Set(['ceo', 'reed', 'evelyn', 'dutchess', 'viv', 'motion', 'friend', 'agent_builder', 'product_manager', 'cto', 'cso', 'damon']);
export function createNebula(canvas, labelLayer, V, opt = {}) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setClearColor(C.deep);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(C.deep, 0.0009);
  const cam = new THREE.PerspectiveCamera(50, 1, 1, 8000); let fitK = 1;
  const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const N = opt.lite ? 1600 : 4500, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const r = 250 + Math.pow(Math.random(), 0.6) * 1300, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(b) * Math.cos(a); pos[i * 3 + 1] = r * Math.cos(b) * 0.55; pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 3, map: tex, color: C.sub, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);
  const brain = new THREE.Group(); scene.add(brain); brain.rotation.z = 0.42;
  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(90, 18, 12)), new THREE.LineBasicMaterial({ color: C.active, transparent: true, opacity: 0.18 }));
  brain.add(wire);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: C.active, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); core.scale.set(150, 150, 1); scene.add(core);
  const core2 = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), new THREE.MeshBasicMaterial({ color: C.activeHi })); scene.add(core2);
  const bpN = Math.min(80, V.a2aKnown); const bp = []; const bpGeo = new THREE.BufferGeometry(); const bpPos = new Float32Array(bpN * 3); bpGeo.setAttribute('position', new THREE.BufferAttribute(bpPos, 3));
  for (let i = 0; i < bpN; i++) bp.push({ lat: ((i % 9) - 4) * Math.PI / 10, lon: Math.random() * 6.28, mer: i % 2, sp: 0.3 + Math.random() * 0.4 });
  brain.add(new THREE.Points(bpGeo, new THREE.PointsMaterial({ size: 7, map: tex, color: C.activeHi, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  const ringTex = (style, arc) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.strokeStyle = '#fff'; g.lineWidth = style === 'thick' ? 9 : 6;
    g.setLineDash(style === 'dashed' ? [14, 10] : style === 'dotted' ? [3, 9] : []); g.lineCap = 'round'; g.beginPath(); g.arc(64, 64, 54, 0, arc || Math.PI * 2); g.stroke(); return new THREE.CanvasTexture(c); };
  const RT = { solid: ringTex('solid'), thick: ringTex('thick'), dashed: ringTex('dashed'), dotted: ringTex('dotted'), arc: ringTex('thick', 2.3) };
  const dynMats = [];
  const dyn = (mat, fn) => { mat.userData.dyn = true; dynMats.push([mat, fn]); return mat; };
  const sat = ['reed', 'evelyn', 'dutchess', 'viv', 'agent_builder', 'friend', 'motion', 'product_manager', 'cto', 'cso'].filter(id => V.A[id]);
  const PUB = !!window.DASH_PUBLIC;
  const ext = [['damon', 'owner', 'human gate'], ['drive', 'drive', 'audit log'], ['hub', 'agent hq', 'hub']];
  const nodes = { ceo: { p: new THREE.Vector3(0, 0, 0), id: 'ceo' } };
  sat.forEach((id, i) => { const a = i / sat.length * Math.PI * 2; nodes[id] = { id, p: new THREE.Vector3(Math.cos(a) * 390, Math.sin(i * 1.7) * 90, Math.sin(a) * 390) }; });
  ext.forEach(([id], i) => { const a = i / ext.length * Math.PI * 2 + 0.4; nodes[id] = { id, p: new THREE.Vector3(Math.cos(a) * 640, (i % 2 ? 1 : -1) * 160, Math.sin(a) * 640) }; });
  const SUBS = subAgents(V);
  const kidsOf = {}; SUBS.forEach(s => (kidsOf[s.known ? s.parent : 'hub'] = kidsOf[s.known ? s.parent : 'hub'] || []).push(s));
  Object.entries(kidsOf).forEach(([par, ks]) => { const P = nodes[par]?.p || new THREE.Vector3(); const out = P.length() ? P.clone().setY(0).normalize() : new THREE.Vector3(1, 0, 0);
    const base = Math.atan2(out.z, out.x), rr = par === 'ceo' ? 200 : 120;
    ks.forEach((s, j) => { const spread = par === 'ceo' ? Math.PI * 2 : 2.2; const a = par === 'ceo' ? (j + 0.5) / ks.length * spread + Math.PI / 7 : base + (ks.length === 1 ? 0 : (j / (ks.length - 1) - 0.5) * spread);
      nodes[s.id] = { id: s.id, sub: s, par, p: new THREE.Vector3(P.x + Math.cos(a) * rr, P.y + (par === 'ceo' ? -70 + (j % 2) * 140 : 45 - j * 45), P.z + Math.sin(a) * rr) }; }); });
  Object.values(nodes).forEach(n => { const ag = V.A[n.id], sb = n.sub; const hfn = () => sb ? (sb.known ? hue(sb.parent) : C.sub) : ag ? hue(n.id) : C.sub;
    const big = n.id === 'ceo' ? 0 : sb ? 46 : ag ? 80 : 44;
    if (big) { n.glow = new THREE.Sprite(dyn(new THREE.SpriteMaterial({ map: tex, color: hfn(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), hfn)); n.glow.scale.set(big, big, 1); n.glow.position.copy(n.p); scene.add(n.glow);
      const m = new THREE.Mesh(new THREE.SphereGeometry(sb ? 5.5 : ag ? 9 : 4, 14, 10), dyn(new THREE.MeshBasicMaterial({ color: hfn() }), hfn)); m.position.copy(n.p); scene.add(m); n.base = big; }
    if (ag && !sb) { n.ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: RT.solid, color: C.sub, transparent: true, depthWrite: false })); n.ring.userData.dyn = true; n.ring.scale.set(n.id === 'ceo' ? 205 : 40, n.id === 'ceo' ? 205 : 40, 1); n.ring.position.copy(n.p); scene.add(n.ring); }
    if (sb) { const afn = () => accent(sb.id).color;
      n.arc = new THREE.Sprite(dyn(new THREE.SpriteMaterial({ map: RT.arc, color: afn(), transparent: true, depthWrite: false }), afn)); n.arc.scale.set(30, 30, 1); n.arc.position.copy(n.p); scene.add(n.arc);
      n.dot = new THREE.Mesh(new THREE.SphereGeometry(2.6, 8, 6), dyn(new THREE.MeshBasicMaterial({ color: afn() }), afn)); n.dot.position.copy(n.p); scene.add(n.dot); n.ph = sb.accent.ix;
      const P = nodes[n.par].p, g = new THREE.BufferGeometry().setFromPoints([P, n.p]);
      const tm = sb.known ? dyn(new THREE.LineBasicMaterial({ color: hfn(), transparent: true, opacity: 0.55 }), hfn) : dyn(new THREE.LineDashedMaterial({ color: C.sub, dashSize: 6, gapSize: 6, transparent: true, opacity: 0.7 }), () => C.sub);
      const tl = new THREE.Line(g, tm); if (!sb.known) tl.computeLineDistances(); scene.add(tl); }
    const el = document.createElement('div'); el.className = 'nlabel' + (sb ? ' sub' : ''); labelLayer.appendChild(el); n.el = el; n.state = 'idle'; });
  const fan = t => /team|reed\/evelyn\/dutchess/.test(t) ? ['reed', 'evelyn', 'dutchess'] : [t === 'board' ? 'drive' : t];
  const links = [];
  const add = (f, t, count) => { if (!nodes[f] || !nodes[t]) return; const a = nodes[f].p, b = nodes[t].p; const mid = a.clone().add(b).multiplyScalar(0.5); mid.y += 60 + (links.length % 3) * 30;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b); const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const unknown = count == null; const mat = unknown ? new THREE.LineDashedMaterial({ color: C.sub, dashSize: 8, gapSize: 8, transparent: true, opacity: 0.35 }) : new THREE.LineBasicMaterial({ color: C.active, transparent: true, opacity: 0.18 + Math.min(0.3, count / 40) });
    const line = new THREE.Line(g, mat); if (unknown) line.computeLineDistances(); scene.add(line);
    const n = unknown ? 0 : Math.min(opt.lite ? 8 : 16, 2 + Math.round(count * 1.2)); const pg = new THREE.BufferGeometry(); const pp = new Float32Array(Math.max(1, n) * 3); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 9, map: tex, color: C.activeHi, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); pts.visible = n > 0; scene.add(pts);
    links.push({ f, t, curve, line, pts, pp, n, us: Array.from({ length: n }, (_, k) => k / n), v: 0.05 + 0.01 * Math.min(count || 0, 12), tracers: [] }); };
  V.D.links.filter(l => l.from !== 'vps agents').forEach(l => fan(l.to).forEach(t => add(l.from, t, l.count)));
  add('hub', 'ceo', V.D.meta.hub_posts);
  const trMat = new THREE.SpriteMaterial({ map: tex, color: C.active, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const fire = (f, t) => { const l = links.find(x => x.f === f && x.t === t) || links.find(x => x.f === t && x.t === f); if (!l) return; const rev = l.f !== f;
    const s = []; for (let k = 0; k < 8; k++) { const sp = new THREE.Sprite(trMat.clone()); sp.material.color.set(nodes[f]?.sub ? (nodes[f].sub.known ? hue(nodes[f].sub.parent) : C.sub) : hue(f)); sp.material.opacity = 1 - k / 8; sp.scale.set(34 - k * 3, 34 - k * 3, 1); scene.add(sp); s.push(sp); }
    l.tracers.push({ u: 0, s, rev }); l.line.material.opacity = Math.min(0.9, l.line.material.opacity + 0.4); };
  const stateWords = { task_assigned: 'queued', checkin: 'reading', a2a_message: 'messaging', deliverable: 'done', verified: 'done', report: 'writing', activity: 'working' };
  const lastEv = {};
  let w = 1, h = 1, born = 0, rotT = 0;
  const mats = new Set([trMat]); scene.traverse(o => { if (o.material && o.material.color) mats.add(o.material); });
  mats.forEach(m => { m.userData.ck = m.userData.dyn ? null : keyOf('#' + m.color.getHexString()); m.userData.add = m.blending === THREE.AdditiveBlending; m.userData.op0 = m.opacity; m.userData.line = !!m.isLineBasicMaterial || !!m.isLineDashedMaterial; });
  let lineFloor = 0.25; const meshes = []; scene.traverse(o => { if (o.isMesh && o !== core2) meshes.push(o); });
  const applyTheme = () => { R.setClearColor(C.deep); scene.fog.color.set(C.deep);
    dynMats.forEach(([m, fn]) => m.color.set(fn()));
    mats.forEach(m => { if (m.userData.ck && !m.userData.dyn) m.color.set(C[m.userData.ck]); if (m.userData.add) m.blending = THEME === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending; if (m.userData.line) m.opacity = THEME === 'light' ? Math.min(0.85, m.userData.op0 * 2.4) : m.userData.op0; m.needsUpdate = true; });
    lineFloor = THEME === 'light' ? 0.55 : 0.25; meshes.forEach(o => o.scale.setScalar(THEME === 'light' ? 1.6 : 1)); dust.material.opacity = THEME === 'light' ? 0.5 : 0.35; };
  applyTheme();
  const api = {
    subs: SUBS,
    paused: false,
    setTheme() { applyTheme(); Object.values(nodes).forEach(nd => { if (nd.el) nd.el._h = ''; }); },
    enter(t) { if (!born) born = t; },
    event(e) { e.route.forEach(([f, t]) => fire(f, t)); const ids = new Set([e.agent, ...e.route.flat()]); ids.forEach(id => { if (nodes[id]) { lastEv[id] = { e, at: V.now }; nodes[id].pulse = 1; } }); },
    resize(vw, vh) { w = vw; h = vh; R.setSize(vw, vh, false); cam.aspect = vw / vh; cam.fov = cam.aspect < 1.3 ? Math.min(118, 2 * Math.atan(Math.tan(25 * Math.PI / 180) * 1.7 / cam.aspect) * 180 / Math.PI) : 50; fitK = cam.aspect < 1.3 ? 1.15 : 1; scene.fog.density = 0.0009 / fitK; cam.updateProjectionMatrix(); },
    frame(t, dt) {
      const k = t - born; if (!api.paused) rotT += dt; const rdt = api.paused ? 0 : dt;
      const ang = rotT * 0.018 + 0.6, rad = 1000 - 90 * (0.5 + 0.5 * Math.sin(rotT * 0.03)), el = 430 + 50 * Math.sin(rotT * 0.025);
      cam.position.set(Math.cos(ang) * rad * fitK, el * fitK, Math.sin(ang) * rad * fitK); cam.lookAt(0, -10, 0);
      dust.rotation.y += rdt * 0.004; dust.rotation.x = Math.sin(t * 0.02) * 0.05;
      brain.rotation.y += rdt * 0.12; const ps = 1 + 0.06 * Math.sin(t * 2) + (nodes.ceo.pulse || 0) * 0.25; core.scale.set(150 * ps, 150 * ps, 1);
      bp.forEach((b, i) => { b.lon += rdt * b.sp; let x, y, z; if (b.mer) { const la = Math.sin(b.lon) * Math.PI / 2; x = Math.cos(la) * Math.cos(b.lat * 3); y = Math.sin(la); z = Math.cos(la) * Math.sin(b.lat * 3); }
        else { x = Math.cos(b.lat) * Math.cos(b.lon); y = Math.sin(b.lat); z = Math.cos(b.lat) * Math.sin(b.lon); } bpPos[i * 3] = x * 91; bpPos[i * 3 + 1] = y * 91; bpPos[i * 3 + 2] = z * 91; });
      bpGeo.attributes.position.needsUpdate = true;
      links.forEach(l => { for (let i = 0; i < l.n; i++) { l.us[i] = (l.us[i] + l.v * dt) % 1; const q = l.curve.getPoint(l.us[i]); l.pp.set([q.x, q.y, q.z], i * 3); } l.pts.geometry.attributes.position.needsUpdate = true;
        if (l.line.material.opacity > lineFloor && l.n) l.line.material.opacity -= dt * 0.2;
        l.tracers = l.tracers.filter(tr => { tr.u += dt * 0.8; tr.s.forEach((sp, k) => { const u = Math.max(0, Math.min(1, tr.u - k * 0.025)); sp.position.copy(l.curve.getPoint(tr.rev ? 1 - u : u)); });
          if (tr.u > 1.2) { tr.s.forEach(sp => { scene.remove(sp); sp.material.dispose(); }); const tgt = nodes[tr.rev ? l.f : l.t]; if (tgt) tgt.pulse = 1; return false; } return true; }); });
      Object.values(nodes).forEach(n => { n.pulse = (n.pulse || 0) * Math.pow(0.2, dt); if (n.glow) { const s = n.base * (1 + n.pulse * 0.8 + 0.05 * Math.sin(t * 2 + n.p.x)); n.glow.scale.set(s, s, 1); }
        if (n.ring && V.A[n.id]) { const r = STATUS_RING(V.A[n.id].tag, V.blk?.agents?.get(n.id)); const tx = r.pulse ? RT.thick : RT[r.style] || RT.solid;
          if (n.ring.material.map !== tx) { n.ring.material.map = tx; n.ring.material.needsUpdate = true; } n.ring.material.color.set(r.color); n.ring.material.opacity = r.pulse ? 0.6 + 0.4 * Math.sin(t * 4) : (r.alpha || 1); }
        if (n.arc) { n.arc.material.rotation = -(t * 1.6 + n.ph); const a = t * 1.6 + n.ph + 3.6; n.dot.position.set(n.p.x + Math.cos(a) * 17, n.p.y + Math.sin(a) * 17, n.p.z); }
        const v = n.p.clone(); v.y += n.id === 'ceo' ? 120 : n.sub ? 14 : 26; v.project(cam); const vis = v.z < 1; const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
        n.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; n.el.style.opacity = vis ? Math.min(1, (k - 0.5) * 1.5) : 0;
        const ag = V.A[n.id]; const L = lastEv[n.id]; const tag = ag ? TAG[ag.tag] : null;
        const st = L && V.now - L.at < 6 ? (stateWords[L.e.type] || 'working') : (ag ? ({ active: 'listening', waiting: 'waiting', idle: 'idle', unresp: 'no reply', human: 'gate', pending: 'pending setup' })[ag.tag] : 'source');
        const sb = n.sub; if (sb) { const ac = accent(sb.id), hh = sb.known ? hue(sb.parent) : C.sub; const sh = `<b style="color:${hh}"><span style="color:${ac.color}">${ac.glyph}</span> ${sb.name.replace(/_/g, '-').replace(/^(reed|evelyn|dutchess) · /, '').replace(/^weeds-[a-z]+-/, 'weeds ')}</b>${sb.known ? '' : ' <i>parent unknown</i>'}${L && V.now - L.at < 6 ? '<br><span class="st">' + (stateWords[L.e.type] || 'working') + '</span>' : ''}`;
          if (n.el._h !== sh) { n.el.innerHTML = sh; n.el._h = sh; } return; }
        const hc = ag || nodes[n.id] && HUE_IDS.has(n.id) ? hue(n.id) : null;
        const html = `<b${hc ? ` style="color:${hc}"` : ''}>${n.id.replace('agent_builder', 'agent builder').replace('skill_finder', 'skill-finder').replace('up_skiller', 'up-skiller')}</b>${tag ? ` <i style="color:${tag.color}">${tag.label}</i>` : ''}<br><span class="st">${st}${L && V.now - L.at < 6 ? ' &gt; ' + L.e.summary.toLowerCase().slice(0, 46).replace(/</g, '') : ag ? ' · last ' + fmtET(ag.last_active) : ''}</span>`;
        if (n.el._h !== html) { n.el.innerHTML = html; n.el._h = html; } });
      R.render(scene, cam);
    },
  };
  return api;
}
