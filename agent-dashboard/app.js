import { C, TAG, THEMES, THEME, setTheme } from './palette.js';
import { HUES, TOP, hue, accent, isSub, subAgents, ACCENTS, GLYPHS, STATUS_RING } from './identity.js';
const TQ = new URLSearchParams(location.search).get('theme');
setTheme(THEMES[TQ] ? TQ : (() => { try { return localStorage.getItem('dash-theme'); } catch { return null; } })() || 'dark');
import { derive, fmtET, mergeLive, gates, age } from './derive.js';
import { createPipeline } from './pipeline.js';
import { createNebula } from './nebula.js';
import { createOrg } from './orgchart.js';
import { createRetro } from './retro.js';
import { tiers } from './hier.js';
import { insights, FORMULAS, STEPS, stepOf } from './insights.js';
import { svg } from './icons.js';
import { AICON } from './pipeline.js';
const PUB = !!window.DASH_PUBLIC;

const POLL_MS = 20000;
let BASE = window.DASH_DATA, LIVE = null, liveMode = 'connecting', lastPollOk = null, lastSig = '';
const V = {}; const build = () => { const now = V.now || 0; const src = LIVE?.vps || BASE.hub_snapshot; const M = mergeLive(BASE, src ? { vps: src } : null); const nv = derive(M); for (const k of Object.keys(V)) delete V[k];
  Object.assign(V, nv, { now, hubLive: !!LIVE?.vps }); const G = gates(V, LIVE?.outbox, LIVE?.resolved); Object.assign(V, G); if (PUB) { V.blockers = V.D.public_blockers || []; V.waiting = []; V.answered = []; V.waitingCount = V.D.public_waiting_count ?? null; } V.I = insights(V); };
build();
const Q = new URLSearchParams(location.search);
const pin = Q.get('scene'); const skip = parseFloat(Q.get('t') || '0');
const EV_EVERY = matchMedia('(prefers-reduced-motion: reduce)').matches ? 3.2 : 1.6;
const $ = s => document.querySelector(s);
document.querySelectorAll('[data-ic]').forEach(b => b.insertAdjacentHTML('afterbegin', svg(b.dataset.ic, b.classList.contains('hd') ? 15 : 14)));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const NAME = { skill_finder: 'Skill-Finder', up_skiller: 'Up-Skiller', ceo: 'CEO', reed: 'Reed', evelyn: 'Evelyn', dutchess: 'Dutchess', viv: 'Viv', agent_builder: 'Agent Builder', friend: 'Friend', motion: 'Motion', product_manager: 'Product Manager', cto: 'CTO', cso: 'CSO', damon: 'Damon' };

const odo = (el, str) => { el.innerHTML = ''; [...String(str)].forEach((ch, i) => { if (!/\d/.test(ch)) { el.append(ch); return; }
  const o = document.createElement('span'); o.className = 'odo'; const col = document.createElement('span'); col.innerHTML = Array.from({ length: 10 }, (_, d) => `<i>${d}</i>`).join('');
  o.append(col); el.append(o); col.style.transform = 'translateY(0)'; setTimeout(() => col.style.transform = `translateY(-${+ch * 1.15}em)`, 80 + i * 90); }); };
const metricVals = () => [['users', 'agents online (active in 24 h)', `${V.online}/${V.aiCount}`, ''], ['a2a', 'known agent-to-agent messages', V.a2aKnown, 'lime'], ['check', 'owner approvals logged', V.approvals ?? 'unknown', 'cream'], ['events', 'timeline events loaded', V.events.length, ''], ['link', 'links between agents/sources', V.D.links.length, ''],
];
let shownM = metricVals();
$('#metrics').innerHTML = shownM.map(([ic, k, v, c], i) => `<div class="m" title="${k}"><span class="k">${svg(ic, 14)}</span><span class="v ${c}" id="mv${i}"></span></div>`).join('');
const runMetrics = () => shownM.forEach(([, , v], i) => odo($('#mv' + i), v));
const updMetrics = () => { const nm = metricVals(); nm.forEach(([, , v], i) => { if (String(v) !== String(shownM[i][2])) { const el = $('#mv' + i); odo(el, v); el.classList.remove('chg'); void el.offsetWidth; el.classList.add('chg'); } }); shownM = nm; };
const STAGES = ['INTAKE', 'ROUTE', 'EXECUTE', 'QA', 'HUMAN GATE', 'OUTCOME'];
const STGI = ['intake', 'route', 'build', 'qa', 'gate', 'deliver'];
const chipH = (id, share) => id ? `<span class="lchip" style="--h:${hue(id)}" title="lead: ${esc(NAME[id] || id)}${share != null ? ' · ' + Math.round(share * 100) + '% of events' : ''}">${svg(AICON[id] || 'sparkles', 11, hue(id))}${share != null ? Math.round(share * 100) + '%' : ''}</span>` : '<span class="lchip na">n/a</span>';
const paintTicker = () => { $('#ticker').innerHTML = STAGES.map((s, i) => { const L = V.I.streams.stages[i]; return `<span class="stg ${i === 4 ? 'gate' : ''}" id="stg${i}" title="${s.toLowerCase()} stage · lead: ${L.id ? esc(NAME[L.id] || L.id) + ' ' + Math.round(L.share * 100) + '% of ' + L.total + ' events' : 'n/a'}">${svg(STGI[i], 12)} ${s.toLowerCase()} ${chipH(L.id, L.share)}</span>`; }).join('<span class="arrow">›</span>') + '<span id="tev"></span>'; };
paintTicker();
const fresh = () => { const F = { ...(V.D.freshness || {}) }, st = LIVE?.vps_status;
  if (st) { const okAt = st.last_ok_at; const stale = !st.ok || !okAt || (Date.now() - new Date(okAt)) > 3 * (st.interval_s || 60) * 1000;
    F.hub = { label: 'vps hub', mode: stale ? 'stale' : 'live', fetched_at: okAt, note: st.ok ? `every ${st.interval_s}s` : 'poll paused: ' + (st.error || '') };
    F.docker = { ...F.hub, label: 'vps containers' }; }
  return F; };
const paintFoot = () => { const F = fresh();
  $('#foot').innerHTML = Object.values(F).sort((a, b) => (b.mode === 'live') - (a.mode === 'live')).map(f => { const live = f.mode === 'live'; const cls = live ? 'lv' : 'st';
    const when = f.fetched_at ? (live ? age(f.fetched_at) + ' ago' : fmtET(f.fetched_at).slice(6) + ' et (' + age(f.fetched_at) + ' old)') : 'unknown';
    return `<span class="fs" title="${esc(f.note || f.as_of || '')}"><b class="${cls}">${live ? '● live' : f.mode === 'stale' ? '◐ stale' : '◐ box'}</b> ${esc(f.label)} ${esc(when)}${f.approx ? ' (approx)' : ''}</span>`; }).join('') +
    '<span>unknown = not in sources · no invented numbers</span>'; };
const paintMode = () => { const m = V.D.mode, el = $('#mode'); if (!m) { el.hidden = true; return; } el.hidden = false; const met = V.rev.current > 0;
  el.textContent = `mode: ${m.name.toLowerCase()}${met ? ' · exit condition met' : ''}`; el.title = `${m.rule}. Source: ${m.source}.${m.last_seen ? ' Last loop post ' + fmtET(m.last_seen) + ' et (' + m.posts + ' posts).' : ''}`; };
const paintLive = () => { const el = $('#live'), tx = $('#livetx');
  if (liveMode === 'live') { el.className = ''; tx.textContent = `LIVE · updated ${age(lastPollOk)} ago`; }
  else if (liveMode === 'stale') { el.className = 'stale'; tx.textContent = `STALE · last update ${lastPollOk ? age(lastPollOk) + ' ago' : 'never'}`; }
  else if (liveMode === 'public') { el.className = 'stale'; tx.textContent = `PUBLIC SNAPSHOT · ${fmtET(V.D.generated_at)} et · censored`; }
  else if (liveMode === 'snapshot') { el.className = 'stale'; tx.textContent = `SNAPSHOT · ${fmtET(V.D.generated_at)} et (no live server)`; }
  else { el.className = 'stale'; tx.textContent = 'connecting…'; } };
const pipeCanvas = $('#pipe'), nebWrap = $('#nebwrap');
const MQ = matchMedia('(max-width: 999px)'), RM = matchMedia('(prefers-reduced-motion: reduce)');
const layoutFor = () => { if (!MQ.matches) return null; const w = document.documentElement.clientWidth || innerWidth; return { mobile: true, ww: w <= 480 ? Math.min(270, w / 1.4) : w / 1.4 }; };
let LY = layoutFor();
let A = createPipeline(pipeCanvas, V, null, LY);
let B = null; try { B = createNebula($('#neb'), $('#labels'), V, { lite: Math.min(screen.width, screen.height) < 700 || MQ.matches }); } catch (err) { console.warn('webgl unavailable, nebula disabled', err); }
const orgWrap = $('#orgwrap');
const OOPT = { lite: Math.min(screen.width, screen.height) < 700 || MQ.matches, mobile: !!LY, labels: true, reduced: RM.matches,
  onSelect: id => { paintInsp(id); paintMCard(id); }, onHover: (id, x, y) => { if (!id) { tipEl.hidden = true; return; } showTip(nodeTip(id), x, y); }, onTour: s => paintCap(s), labelHtml: n => labelOf(n) };
const STYLES = ['retro', 'classic'];
const STYLE = (() => { let q = new URLSearchParams(location.search).get('orgstyle'); if (!STYLES.includes(q)) { try { q = localStorage.getItem('dash-orgstyle'); } catch { q = null; } } return STYLES.includes(q) ? q : 'retro'; })();
const ARC = STYLE === 'retro';
document.documentElement.classList.add('style-' + STYLE); if (STYLE === 'retro') document.documentElement.classList.add('style-arcade');
if (STYLE === 'retro') OOPT.labels = false;
let O = null; try { O = STYLE === 'classic' ? createOrg($('#org'), $('#olabels'), V, OOPT) : createRetro($('#org'), $('#olabels'), V, OOPT); } catch (err) { console.warn('webgl unavailable, org chart disabled', err); }
const nextStyle = () => STYLE === 'classic' ? 'retro' : 'classic';
const cycleStyle = () => { const n = nextStyle(); try { localStorage.setItem('dash-orgstyle', n); } catch {} const u = new URL(location); if (u.searchParams.has('orgstyle')) u.searchParams.set('orgstyle', n); location.href = u.toString(); };
const STYLE_NAME = { retro: 'Pixel Quest (retro game)', classic: 'Classic 3D org chart' };
function rethemeScenes() { A = createPipeline(pipeCanvas, V, A.state, LY); B?.setTheme?.(); O?.setTheme(); paintGate(); paintDrawer(); paintLegend(); paintOrgHud(); }
let cur = null, sceneT = -10, revealed = false;
const btns = document.querySelectorAll('#toggle button[data-s]');
const show = s => { if (s === 'b' && !B) s = 'a'; if (s === 'o' && !O) s = 'a'; if (s === cur) return; cur = s; sceneT = V.now;
  pipeCanvas.style.opacity = s === 'a' ? 1 : 0; nebWrap.style.opacity = s === 'b' ? 1 : 0; nebWrap.style.pointerEvents = s === 'b' ? 'auto' : 'none'; pipeCanvas.style.pointerEvents = s === 'a' ? 'auto' : 'none';
  orgWrap.style.opacity = s === 'o' ? 1 : 0; orgWrap.style.pointerEvents = s === 'o' ? 'auto' : 'none'; document.documentElement.classList.toggle('scene-o', s === 'o'); if (s !== 'o') O?.tour(false);
  $('#pause').style.display = s === 'b' ? '' : 'none'; btns.forEach(x => x.classList.toggle('on', x.dataset.s === s));
  (s === 'a' ? A : B)?.enter(V.now);
  if (!revealed) { revealed = true; runMetrics(); }
  if (LY) { resize(); if (s === 'b') scrollTo({ top: stageEl.offsetTop, behavior: RM.matches ? 'auto' : 'smooth' }); if (s === 'o') scrollTo(0, 0); } else resize();
  const u = new URL(location); if (s !== 'o') u.searchParams.set('scene', s); else u.searchParams.delete('scene'); history.replaceState(null, '', u); };
btns.forEach(b => b.onclick = () => show(b.dataset.s));
const typing = e => /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
addEventListener('keydown', e => { if (typing(e)) { if (e.key === 'Escape') { closeAssign(); e.target.blur(); } return; } if (e.key === 'Escape' && STYLE === 'retro' && O?.selected) { O.select(null); return; } const k = e.key.toLowerCase();
  if (k === 'escape' && (!$('#assign').hidden || !$('#drawer').hidden)) { closeAssign(); closeDrawer(); return; }
  if (k === 'l') { toggleTheme(); return; }
  if (k === 'v') { cycleStyle(); return; }
  if (k === 'g') { toggleLegend(); return; }
  if (k === 'n') show(cur === 'b' ? 'o' : 'b'); if (k === 'd') show('a'); if (k === 'o' || k === 'escape') show('o');
  if ((k === ' ' || k === 'p') && cur === 'b') { e.preventDefault(); togglePause(); }
  if (cur === 'o') { if (k === ' ' || k === 'p') { e.preventDefault(); togglePlay(); } if (k === 't') O?.tour(); if (k === 'r') { O?.select(null); O?.reset(); } } });
const togglePause = () => { if (!B) return; B.paused = !B.paused; $('#pause').innerHTML = B.paused ? svg('play', 13) : svg('pause', 13); };
$('#pause').onclick = togglePause;
const stageEl = $('#stage');
function sizeStage() { const de = document.documentElement; de.classList.toggle('mob', !!LY); de.classList.toggle('mob-b', !!LY && cur === 'b'); de.classList.toggle('mob-o', !!LY && cur === 'o');
  stageEl.style.height = LY && cur === 'a' ? Math.ceil(A.worldH * (vw / A.worldW)) + 'px' : ''; }
let vw = 0, vh = 0; const resize = () => { const nl = layoutFor(); if (JSON.stringify(nl) !== JSON.stringify(LY)) { LY = nl; A = createPipeline(pipeCanvas, V, A.state, LY); }
  const r = stageEl.getBoundingClientRect(); vw = r.width; if (LY) { vw = document.documentElement.clientWidth; sizeStage(); }
  const c = pipeCanvas.getBoundingClientRect(); vh = LY ? c.height : r.height; const d = Math.min(2, devicePixelRatio || 1);
  pipeCanvas.width = Math.round(vw * d); pipeCanvas.height = Math.round(vh * d); if (B) { const n = $('#nebwrap').getBoundingClientRect(); B.resize(n.width || vw, n.height || vh); }
  OOPT.mobile = !!LY; if (O) { const n = orgWrap.getBoundingClientRect(); O.resize(n.width || vw, n.height || innerHeight); } paintTrack(); };
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 250));
const pipeScroll = () => LY ? Math.max(0, pipeCanvas.getBoundingClientRect().top - stageEl.getBoundingClientRect().top) : 0;
let ei = 0, nextEv = 0.8; const freshQ = [];
const fireEvent = e => { A.event(e); B?.event(e); O?.event(e); feedPush(e); curEv = e; paintHead();
  STAGES.forEach((_, i) => $('#stg' + i).classList.toggle('live', i === e.stage));
  const fl = A.flowLead(e); $('#tev').innerHTML = `${e.fresh ? '<b class="nw">NEW</b> ' : ''}${fmtET(e.time)} ${V.A[e.agent] ? svg(AICON[e.agent], 12, hue(e.agent)) : esc(e.agent)} ${fl ? `<span class="fl" title="flow lead (most events on this route)">${svg('route', 11)} ${chipH(fl.lead?.id, fl.lead?.share)}</span>` : ''} ${esc(e.summary.replace(/^#[\w-]+: /, '').toLowerCase())}`;
  const ne = $('#nebev'); if (ne) ne.textContent = '> ' + e.agent + ' · ' + e.summary.toLowerCase().slice(0, 110); };
const nextReplay = () => { const e = V.events[ei % V.events.length]; ei++; return e; };
let playing = true, speed = 1, curEv = null; const SPEEDS = [1, 3, 8];
const seek = i => { ei = Math.max(0, Math.min(V.events.length - 1, i)); fireEvent(nextReplay()); nextEv = V.now + EV_EVERY / speed; };
if (skip > 0) { const n = Math.floor(skip / EV_EVERY); for (let i = 0; i < n; i++) nextReplay(); }

let tab = 'waiting';
const sinceTx = x => x.since ? `waiting ${age(x.since)} · since ${fmtET(x.since)} et` : `since: ${x.since_note || 'unknown'}`;
const failedAns = () => false;
const paintGate = () => { const W = V.waiting, Bk = V.blockers, open = W.filter(w => !w.answer || failedAns(w)).length;
  $('#wcount').textContent = PUB ? (V.waitingCount ?? 0) : open; $('#bcount').textContent = Bk.length;
  $('#wchips').innerHTML = [...W.filter(failedAns), ...W.filter(w => !w.answer), ...W.filter(w => w.answer && !failedAns(w))].map(w => `<button class="chip ${failedAns(w) ? '' : w.answer ? 'done' : ''}" data-tab="waiting" data-id="${esc(w.id)}" title="${esc(w.title)}">${esc(w.title)}<i>${failedAns(w) ? '' : w.answer ? 'answered' : w.since ? age(w.since) : ''}</i></button>`).join('') +
    (V.answered.length ? `<button class="chip hist" data-tab="answered" title="Answered items (history)">answered (${V.answered.length})</button>` : '');
  const tb = document.querySelector('#drawer .tabs button[data-tab="answered"]'); if (tb) tb.textContent = `answered (${V.answered.length})`;
  $('#bchips').innerHTML = ''; };
const drawerBody = () => {

  const F = fresh(); return `<table class="src">${Object.values(F).map(f => `<tr><td>${esc(f.label)}</td><td class="${f.mode === 'live' ? 'lv' : 'st'}">${esc(f.mode)}</td><td>${f.fetched_at ? fmtET(f.fetched_at) + ' et (' + age(f.fetched_at) + ' ago)' : 'unknown'}${f.approx ? ' approx' : ''}<br><span class="meta">${esc(f.note || f.as_of || '')}</span></td></tr>`).join('')}</table>
${(V.D.resources || []).length ? `<h4 style="margin-top:10px">new resources tracked</h4><table class="src">${V.D.resources.map(r => `<tr><td>${esc(r.name)}</td><td>${esc(r.kind)}</td><td>${esc(r.owner)} · ${r.since && r.since.length > 12 ? fmtET(r.since) + ' et' : esc(r.since || '')}<br><span class="meta">${esc(r.note)}</span></td></tr>`).join('')}</table>` : ''}
    <p class="meta" style="margin-top:8px">${'Public snapshot, refreshed by a daily job. Names of clients and leads, contacts, hosts, IDs, paths and message bodies are censored.'}</p>`; };
const paintDrawer = () => { if ($('#drawer').hidden) return; const keep = {}; document.querySelectorAll('#dbody .card textarea').forEach(t => { const id = t.closest('.card').id; if (t.value) keep[id] = t.value; });
  const sel = {}; document.querySelectorAll('#dbody .card button.sel').forEach(b => sel[b.closest('.card').id] = b.dataset.d);
  const st = $('#dbody').scrollTop; $('#dbody').innerHTML = drawerBody(); $('#dbody').scrollTop = st;
  Object.entries(keep).forEach(([id, v]) => { const t = document.querySelector(`#${CSS.escape(id)} textarea`); if (t) t.value = v; });
  Object.entries(sel).forEach(([id, d]) => document.querySelector(`#${CSS.escape(id)} button[data-d="${d}"]`)?.classList.add('sel'));
  document.querySelectorAll('#drawer .tabs button[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab)); };
const openDrawer = (t, id) => { tab = t; $('#drawer').hidden = false; paintDrawer(); if (id) { const c = document.getElementById('c-' + id); if (c) { c.scrollIntoView({ block: 'center' }); c.classList.add('flash'); } } };
const closeDrawer = () => { $('#drawer').hidden = true; };
const paintThemeBtn = () => { const b = $('#theme'); if (b) { b.innerHTML = THEME === 'light' ? svg('moon', 14) : svg('sun', 14); b.title = `Switch to ${THEME === 'light' ? 'dark' : 'light'} mode (L)`; } };
const toggleTheme = () => { setTheme(THEME === 'light' ? 'dark' : 'light'); try { localStorage.setItem('dash-theme', THEME); } catch {}
  const u = new URL(location.href); if (u.searchParams.has('theme')) { u.searchParams.set('theme', THEME); history.replaceState(null, '', u); }
  rethemeScenes(); paintThemeBtn(); };
$('#gate').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) openDrawer(b.dataset.tab, b.dataset.id); };
$('#drawer .tabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; paintDrawer(); } };
$('#dclose').onclick = closeDrawer;
$('#theme').onclick = toggleTheme; paintThemeBtn();
const paintLegend = () => { const el = $('#legend'); if (el.hidden) return; const subs = subAgents(V);
  const sw = (c, extra = '') => `<span class="sw" style="background:${c};${extra}"></span>`;
  el.innerHTML = `<div class="lh"><b>Legend</b><button id="lgx" title="Close (G)">×</button></div>
   <div class="lt">Agent hues (identity; never changes with status)</div><div class="lg">${[...TOP, 'damon'].map(id => `<span>${sw(hue(id))}${HUES[id].name}</span>`).join('')}</div>
   <div class="lt">Status = a separate ring</div><div class="lg"><span><i class="rg" style="border:2px dashed ${C.waiting}"></i>waiting on you</span><span><i class="rg" style="border:1.5px dashed ${C.sub}"></i>pending setup</span><span><i class="rg" style="border:1.5px dotted ${C.dim}"></i>idle</span><span><i class="rg" style="border:1px solid ${C.sub};opacity:.6"></i>active</span></div>
   <div class="lt">Sub-agents: parent's hue, smaller orb, own accent (2nd-colour arc + orbiting dot + glyph), tether to parent (dashed = parent unknown)</div>
   <div class="ls">${subs.map(x => `<div>${sw(x.hue)}<b style="color:${x.accent.color}">${x.accent.glyph}</b> ${esc(x.name)} <span class="meta">→ ${x.known ? esc(HUES[x.parent]?.name || x.parent) : 'parent unknown'} · ${esc(x.accent.name)}</span></div>`).join('')}</div>`;
  $('#lgx').onclick = toggleLegend; };
const toggleLegend = () => { const el = $('#legend'); el.hidden = !el.hidden; $('#lgbtn').classList.toggle('on', !el.hidden); paintLegend(); };
$('#lgbtn').onclick = toggleLegend;
$('#stylebtn').onclick = cycleStyle; $('#stylebtn').title = `Design: ${STYLE_NAME[STYLE]} (click for ${STYLE_NAME[nextStyle()]}) · V`;
const closeAssign = () => {}; const idleAt = () => null;
const tipEl = $('#tip');
const showTip = (h, cx, cy) => { if (!h) { tipEl.hidden = true; return; } tipEl.innerHTML = h; tipEl.hidden = false; const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
  tipEl.style.left = Math.max(8, Math.min(innerWidth - tw - 8, cx + 14)) + 'px'; tipEl.style.top = Math.max(8, cy + 16 + th > innerHeight ? cy - th - 10 : cy + 16) + 'px'; };
const canvasTip = ev => { const r = pipeCanvas.getBoundingClientRect(); return A.tipAt(ev.clientX - r.left, ev.clientY - r.top); };
pipeCanvas.addEventListener('pointermove', ev => { if (ev.pointerType !== 'mouse') return; pipeCanvas.classList.toggle('hand', !PUB && !!idleAt(ev)); showTip(canvasTip(ev), ev.clientX, ev.clientY); });
pipeCanvas.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') tipEl.hidden = true; });
let tipFrom = null;
pipeCanvas.addEventListener('click', ev => { const id = PUB ? null : idleAt(ev); if (id) { tipEl.hidden = true; openAssign(id); return; }
  if (ev.pointerType === 'touch' || ev.pointerType === 'pen') { const h = canvasTip(ev); if (h && !(tipFrom === h && !tipEl.hidden)) { showTip(h, ev.clientX, ev.clientY); tipFrom = h; } else { tipEl.hidden = true; tipFrom = null; } } });
document.addEventListener('click', ev => { const t = ev.target.closest('.m,.stg,.lchip,.fs,#mode,#live,#gwait span.hd,#nebhud'); if (ev.target === pipeCanvas) return;
  const tch = ev.pointerType === 'touch' || ev.pointerType === 'pen'; if (t && tch && t.title) { showTip(esc(t.title), ev.clientX, ev.clientY); tipFrom = t; return; } if (tch) { tipEl.hidden = true; tipFrom = null; } }, true);
addEventListener('scroll', () => { if (tipFrom) { tipEl.hidden = true; tipFrom = null; } }, { passive: true });

const PLATF = id => V.A[id]?.platform || '';
const RES_NAME = { hub: 'agent hub', drive: 'shared docs' }, RES_ICON = { hub: 'hub', drive: 'drive' };
const nm = id => NAME[id] || V.A[id]?.name || RES_NAME[id] || id;
const subName = n => String(n.sub?.name || n.id).replace(/_/g, '-').replace(/^(reed|evelyn|dutchess|ceo) · /, '').replace(/^weeds-[a-z]+-/, 'weeds ');
const labelOf = n => n.kind === 'session' ? `<span style="color:${n.hue}">${esc(subName(n))}</span>` : n.kind === 'res' ? `<span>${esc(RES_NAME[n.id] || n.id)}</span>` : `<b style="color:${n.hue}">${esc(nm(n.id))}</b>`;
const T1 = () => V.events.length ? new Date(V.events[V.events.length - 1].time).getTime() : Date.now();
const hourly = id => { const t1 = T1(), b = new Array(24).fill(0); V.events.forEach(e => { if (e.agent !== id) return; const h = Math.floor((t1 - new Date(e.time).getTime()) / 36e5); if (h >= 0 && h < 24) b[23 - h]++; }); return b; };
const spark = (id, w = 220, h = 34, col) => { const b = hourly(id), mx = Math.max(1, ...b), bw = w / 24; col = col || hue(id);
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${b.map((v, i) => `<rect x="${(i * bw + 1).toFixed(1)}" y="${(h - 2 - (v ? Math.max(3, v / mx * (h - 4)) : 1.5)).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${(v ? Math.max(3, v / mx * (h - 4)) : 1.5).toFixed(1)}" rx="1.5" fill="${v ? col : C.border}"/>`).join('')}</svg>`; };
const rowOf = id => V.I.board.rows.find(r => r.id === id);
const stepsOf = id => V.I.steps[id];
const ringOf = id => V.A[id] ? STATUS_RING(V.A[id].tag, V.blk?.agents?.get(id)) : null;
const badgesOf = id => { const B = V.I.board; return [['trophy', B.top?.id === id, 'overall #1 right now'], ['zap', B.works?.id === id, 'works the most'], ['target', B.effective?.id === id, 'most effective'], ['hourglass', B.idle?.id === id, 'idles the most']].filter(x => x[1]); };
const nodeTip = id => { const n = O?.nodes.get(id); if (!n) return '';
  if (n.kind === 'res') return `<b>${esc(RES_NAME[id] || id)}</b><br>${id === 'hub' ? (V.D.meta?.hub_posts ?? 'unknown') + ' hub posts read · ' + Object.keys(V.D.meta?.hub_channels || {}).length + ' channels' : id === 'drive' ? 'shared docs and logs the team writes to' : 'read-only source'}`;
  if (n.kind === 'session') return `<b style="color:${n.hue}">${esc(subName(n))}</b><br>${n.known ? 'runs as ' + esc(nm(n.parent)) : 'parent unknown'}${n.sub?.last_seen ? ' · last seen ' + fmtET(n.sub.last_seen) + ' et' : ''}`;
  const a = V.A[id], r = rowOf(id), st = stepsOf(id), rg = ringOf(id);
  return `<b style="color:${hue(id)}">${esc(nm(id))}</b> · ${esc(PLATF(id))}<br>${esc(a.role || '')}<br><span class="tm">${esc(rg?.label || '')} · last active ${a.last_active ? fmtET(a.last_active) + ' et' : 'unknown'}${st?.current ? ' · step: ' + st.current : ''}${r?.rank ? ' · rank #' + r.rank : ''}</span>`; };
const statChip = id => { const rg = ringOf(id); return rg ? `<span class="sc" style="--r:${rg.color}"><i class="${rg.style}${rg.pulse ? ' pulse' : ''}"></i>${esc(rg.label)}</span>` : ''; };
const stepRow = (id, mob) => { const st = stepsOf(id); if (!st) return ''; return `<div class="${mob ? 'msteps' : 'isteps'}">${STEPS.map(s => { const n = st.st[s.id].n, on = st.current === s.id;
  return `<span class="sx${on ? ' on' : ''}${n ? '' : ' z'}" style="--h:${hue(id)}" title="${esc(s.tip)}${mob ? '' : ': ' + n + ' events'}">${svg(s.icon, mob ? 20 : 15)}${mob ? `<em>${'<i></i>'.repeat(Math.min(5, Math.ceil(n / 3)))}</em>` : `<b>${n}</b>`}</span>`; }).join(mob ? '' : '<i class="ar">›</i>')}</div>`; };

const arcBars = (id, r) => { const rows = V.I.board.rows, mx = k => Math.max(1, ...rows.map(x => x[k] || 0)); const h = hue(id);
  const seg = (p, h) => `<em class="sg">${Array.from({ length: 10 }, (_, k) => `<u class="${p != null && k < Math.round(p / 10) ? 'on' : ''}" style="--h:${h}"></u>`).join('')}</em>`;
  const row = (ic, k, p, v, t) => `<div class="sb" title="${esc(t || k)}">${svg(ic, 13)}<span>${k}</span>${seg(p, h)}<b>${v ?? 'n/a'}</b></div>`;
  return `<div class="sbs"><div class="lv">${r?.rank ? 'RANK ' + r.rank : 'UNRANKED'}</div>${row('medal', 'SCORE', r?.score, r?.score != null ? r.score + (r.partial ? '*' : '') : null, FORMULAS.top)}${row('zap', 'EVENTS 7D', r?.w7 != null ? r.w7 / mx('w7') * 100 : null, r?.w7, FORMULAS.works)}${row('events', 'EVENTS 24H', r?.w24 != null ? r.w24 / mx('w24') * 100 : null, r?.w24, 'events in the last 24 h of the loaded timeline')}${row('target', 'EFFECT', r?.eff != null ? r.eff * 100 : null, r?.eff != null ? Math.round(r.eff * 100) + '%' : null, FORMULAS.effective)}${row('a2a', 'FLOW', V.I.streams.rows[id]?.share != null ? V.I.streams.rows[id].share * 100 : null, V.I.streams.rows[id]?.share != null ? Math.round(V.I.streams.rows[id].share * 100) + '%' : null, FORMULAS.lead)}${row('clock', 'IDLE', null, r?.idleH != null ? (r.idleH < 1 ? Math.round(r.idleH * 60) + 'm' : Math.round(r.idleH) + 'h') : null, FORMULAS.idle)}</div>`; };
let inspId = null;
const paintInsp = id => { const el = $('#inspb'); if (!el) return; id = id || V.I.board.top?.id || 'ceo'; inspId = id; const n = O?.nodes.get(id);
  if (n && n.kind !== 'agent' && n.kind !== 'sub' && n.kind !== 'human') { el.innerHTML = `<div class="ih"><span class="ib" style="--h:${n.hue}">${svg(n.kind === 'res' ? RES_ICON[id] : AICON[n.parent] || 'sparkles', 22)}</span><div><b>${n.kind === 'res' ? esc(RES_NAME[id]) : esc(subName(n))}</b><div class="ir">${nodeTip(id).split('<br>').slice(1).join(' · ')}</div></div></div>`; return; }
  const a = V.A[id]; if (!a) { el.innerHTML = ''; return; } const r = rowOf(id), h = hue(id);
  const kv = (ic, k, v, t) => `<div class="kv" title="${esc(t || k)}">${svg(ic, 13)}<b>${v ?? 'n/a'}</b><span>${k}</span></div>`;
  el.innerHTML = `<div class="ih"><span class="ib" style="--h:${h}">${svg(AICON[id] || 'sparkles', 22)}</span><div><b style="color:${h}">${esc(nm(id))}</b> <span class="ip">${esc(PLATF(id))}</span><div class="ir">${esc(a.role || '')}</div></div></div>
    <div class="irow">${statChip(id)}${badgesOf(id).map(([ic, , t]) => `<span class="bdg" title="${t}">${svg(ic, 13)}${t}</span>`).join('')}</div>
    ${a.kind === 'human' ? `<div class="kvs">${kv('hourglass', 'decisions pending', PUB ? (V.waitingCount ?? 'n/a') : V.waiting.filter(w => !w.answer).length)}${kv('check', 'approvals logged', V.approvals ?? 'unknown')}</div>` : `
    <div class="ilab">${svg('route', 12)} step chain <span>(current step pulses)</span></div>${stepRow(id)}
    <div class="ilab">${svg('events', 12)} activity · last 24 h of the loaded timeline</div>${spark(id, 286, 36)}
${ARC ? arcBars(id, r) : `<div class="kvs">${kv('trophy', 'rank', r?.rank ? '#' + r.rank : null, FORMULAS.top)}${kv('medal', 'score', r?.score != null ? r.score + (r.partial ? '*' : '') : null, FORMULAS.top)}${kv('zap', 'events 7 d', r?.w7, FORMULAS.works)}${kv('target', 'effective', r?.eff != null ? Math.round(r.eff * 100) + '%' : null, FORMULAS.effective)}${kv('clock', 'idle', r?.idleH != null ? (r.idleH < 1 ? Math.round(r.idleH * 60) + 'm' : Math.round(r.idleH) + 'h') : null, FORMULAS.idle)}${kv('a2a', 'share of flow', V.I.streams.rows[id]?.share != null ? Math.round(V.I.streams.rows[id].share * 100) + '%' : null, FORMULAS.lead)}</div>`}`}
    ${PUB ? '' : inspPriv(id)}`; };
const inspPriv = () => '';
const paintLbMini = () => { const el = $('#lbmini'); if (!el) return; const B = V.I.board;
  const tile = (ic, t, r, v) => `<button class="lt" data-sel="${r?.id || ''}" title="${esc(t)}${r ? ': ' + esc(nm(r.id)) : ': n/a'}">${svg(ic, 14)}${r ? svg(AICON[r.id] || 'sparkles', 16, hue(r.id)) : '<i>n/a</i>'}<b>${r ? v(r) : ''}</b></button>`;
  el.innerHTML = `<div class="ilab">${svg('trophy', 12)} ${ARC ? 'high scores' : 'leaderboard'} <span>now</span></div><div class="lts">${tile('zap', 'works the most', B.works, r => r.w24 + '/24h')}${tile('target', 'most effective', B.effective, r => Math.round(r.eff * 100) + '%')}${tile('hourglass', 'idles the most', B.idle, r => Math.round(r.idleH) + 'h')}${tile('trophy', 'overall #1', B.top, r => r.score)}</div>
    <div class="lrs">${B.rank.slice(0, ARC ? 30 : 6).map(r => `<button class="lr" data-sel="${r.id}" title="${esc(nm(r.id))}: score ${r.score}${r.partial ? '*' : ''}"><i>${r.rank}</i>${svg(AICON[r.id] || 'sparkles', 14, hue(r.id))}<span>${esc(nm(r.id))}</span><em><u style="width:${r.score}%;background:${hue(r.id)}"></u></em><b>${r.score}</b></button>`).join('')}</div>`; };
$('#lbmini').addEventListener('click', e => { const b = e.target.closest('[data-sel]'); if (b && b.dataset.sel) O?.select(b.dataset.sel); });
const feedPush = e => { const el = $('#feedl'); if (!el || !e || cur !== 'o' || LY) return; const id = V.A[e.agent] ? e.agent : null, h = id ? hue(id) : C.sub;
  const rec = [...new Set((e.route || []).filter(([f]) => f === e.agent).map(([, t]) => t))].filter(t => t !== e.agent).slice(0, 4);
  const c = document.createElement('button'); c.className = 'fc' + (e.fresh ? ' nw' : ''); c.style.setProperty('--h', h); c.dataset.sel = id || '';
  c.innerHTML = `<span class="fa">${svg(id ? AICON[id] : 'sparkles', 15, h)}</span><span class="ft"><span class="fm">${svg(STEPS.find(s => s.id === stepOf(e))?.icon || 'build', 11)}<b>${fmtET(e.time).slice(6)}</b>${rec.length ? svg('route', 10) + rec.map(t => svg(AICON[t] || ({ hub: 'hub', drive: 'drive' })[t] || 'sparkles', 11, V.A[t] ? hue(t) : C.sub)).join('') : ''}${e.fresh ? '<em>new</em>' : ''}</span><span class="fs">${esc(e.summary.replace(/^#[\w-]+: /, '').toLowerCase().slice(0, 96))}</span></span>`;
  el.prepend(c); while (el.children.length > 9) el.lastChild.remove(); };
$('#feedl').addEventListener('click', e => { const b = e.target.closest('[data-sel]'); if (b && b.dataset.sel) O?.select(b.dataset.sel); });
const track = $('#track'), trackC = $('#trackc');
const span = () => { const t0 = V.events.length ? new Date(V.events[0].time).getTime() : 0; return [t0, Math.max(t0 + 1, T1())]; };
function paintTrack() { if (!trackC) return; const r = track.getBoundingClientRect(); if (!r.width) return; const d = Math.min(2, devicePixelRatio || 1); trackC.width = Math.round(r.width * d); trackC.height = Math.round(r.height * d);
  const g = trackC.getContext('2d'); g.scale(d, d); g.clearRect(0, 0, r.width, r.height); const [t0, t1] = span(), X = t => 6 + (t - t0) / (t1 - t0) * (r.width - 12);
  g.fillStyle = C.border; g.fillRect(6, r.height / 2 - 0.5, r.width - 12, 1);
  const days = new Set(V.events.map(e => e.time.slice(0, 10))); if (!LY) days.forEach(dd => { const t = new Date(dd + 'T00:00:00-04:00').getTime(); if (t > t0 && t < t1) { g.fillStyle = C.dim; g.fillRect(X(t), 3, 1, r.height - 6); g.font = '10px ' + '"JetBrains Mono", monospace'; g.fillText(dd.slice(5), X(t) + 3, 11); } });
  const stack = {}; V.events.forEach(e => { const x = Math.round(X(new Date(e.time).getTime())); const k = stack[x] = (stack[x] || 0) + 1; g.fillStyle = V.A[e.agent] ? hue(e.agent) : C.sub; g.globalAlpha = 0.9;
    g.fillRect(x - 1, r.height / 2 + 4 - k * 4.2, 2.4, 3.4); }); g.globalAlpha = 1; paintHead(); }
function paintHead() { const hd = $('#thead'), ck = $('#tclock'); if (!hd || !curEv) return; const r = track.getBoundingClientRect(); const [t0, t1] = span();
  hd.style.left = (6 + (new Date(curEv.time).getTime() - t0) / (t1 - t0) * (r.width - 12)) + 'px'; hd.style.setProperty('--h', V.A[curEv.agent] ? hue(curEv.agent) : C.sub); if (ck) ck.textContent = fmtET(curEv.time) + ' et'; }
const scrubTo = x => { const r = track.getBoundingClientRect(); const [t0, t1] = span(); const t = t0 + Math.max(0, Math.min(1, (x - r.left - 6) / (r.width - 12))) * (t1 - t0);
  let bi = 0, bd = 1e18; V.events.forEach((e, i) => { const d = Math.abs(new Date(e.time).getTime() - t); if (d < bd) { bd = d; bi = i; } }); if (V.events[bi] !== curEv) seek(bi); };
let scrubbing = false; track.addEventListener('pointerdown', e => { scrubbing = true; track.setPointerCapture(e.pointerId); scrubTo(e.clientX); });
track.addEventListener('pointermove', e => { if (scrubbing) scrubTo(e.clientX); }); track.addEventListener('pointerup', () => scrubbing = false); track.addEventListener('pointercancel', () => scrubbing = false);
const paintPlay = () => { $('#tplay').innerHTML = svg(playing ? 'pause' : 'play', 16); $('#tspeed').innerHTML = svg('speed', 14) + `<b>${speed}×</b>`; };
const togglePlay = () => { playing = !playing; if (playing) nextEv = V.now + 0.2; paintPlay(); };
$('#tplay').onclick = togglePlay; $('#tspeed').onclick = () => { speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; nextEv = Math.min(nextEv, V.now + EV_EVERY / speed); paintPlay(); };
$('#ttour').onclick = () => O?.tour(); $('#treset').onclick = () => { O?.select(null); O?.reset(); };
const CAPS = {
  overview: () => [svg('system', 16), 'The whole system', `${V.aiCount} agents · ${V.D.links.length} links · ${V.events.length} events loaded`],
  damon: () => [svg('damon', 16, hue('damon')), 'Owner · the human gate', PUB ? `${V.waitingCount ?? 'n/a'} decisions pending with the owner` : `${V.waiting.filter(w => !w.answer).length} items waiting on you · ${V.approvals ?? 'unknown'} approvals logged`],
  ceo: () => { const n = V.events.filter(e => e.agent === 'ceo').length, k = Object.values(V.I.streams.stages).filter(s => s.id === 'ceo').length; return [svg('ceo', 16, hue('ceo')), 'CEO · routes the work', `${n} of ${V.events.length} events · leads ${k} of 6 pipeline stages`]; },
  team: () => { const ids = ['reed', 'evelyn', 'dutchess'].filter(i => V.A[i]); const n = V.events.filter(e => ids.includes(e.agent)).length; const m = V.D.links.filter(l => ids.includes(l.from) && l.to === 'ceo').reduce((s, l) => s + (l.count || 0), 0);
    return [ids.map(i => svg(i, 15, hue(i))).join(''), 'VPS team · ' + ids.map(nm).join(', '), `${n} events · ${m} known messages back to the CEO`]; },
  skills: () => { const sf = V.A.skill_finder, us = V.A.up_skiller; return [svg('skill_finder', 15, hue('ceo')) + svg('up_skiller', 15, hue('ceo')), 'Skills loop · Skill-Finder vets, Up-Skiller installs', `${sf?.metrics?.runs ?? 'unknown'} finder runs · ${us?.metrics?.installed_last ?? 'unknown'} installed on the last run`]; },
  viv: () => { const rest = tiers(V.A).rest, on = rest.filter(i => { const h = V.hrs(V.A[i]); return h != null && h <= 24; }).length; return [svg('viv', 16, hue('viv')), 'Viv · everyone reports to her', `${rest.length} agents under Viv · ${on} active in the last 24 h`]; },
  staff: () => { const ids = tiers(V.A).peers; const on = ids.filter(i => { const h = V.hrs(V.A[i]); return h != null && h <= 24; }).length;
    return [ids.slice(0, 7).map(i => svg(i, 15, hue(i))).join(''), 'Under Viv · ' + ids.map(nm).join(', '), `${on} of ${ids.length} active in the last 24 h`]; },
  infra: () => [svg('hub', 15) + svg('drive', 15), 'Shared infrastructure', `${V.D.meta?.hub_posts ?? 'unknown'} hub posts across ${Object.keys(V.D.meta?.hub_channels || {}).length} channels · shared docs`],
};
const paintCap = (s, i, n) => { const el = $('#ocap'); $('#ttour')?.classList.toggle('on', !!s); $('#mfab [data-a=tour]')?.classList.toggle('on', !!s); if (!s) { el.hidden = true; return; } const [ic, t, line] = (CAPS[s.key] || CAPS.overview)();
  el.hidden = false; el.innerHTML = `<span class="ci">${ic}</span><span class="ct"><b>${esc(t)}</b><span>${esc(line)}</span></span><span class="cp">${Array.from({ length: n }, (_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</span>`; };
let mfabExtra = () => [];
const paintMFab = () => { const el = $('#mfab'); if (!el) return;
  el.innerHTML = [['theme', THEME === 'light' ? 'moon' : 'sun'], ['legend', 'legend'], ['tour', 'tour'], ['reset', 'locate'], ['style', 'gamepad'], ['classic', 'dashboard'], ...mfabExtra()].map(([a, ic, b]) => `<button data-a="${a}" aria-label="${a}">${svg(ic, 20)}${b ? `<b>${b}</b>` : ''}</button>`).join(''); };
$('#mfab').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
  if (a === 'theme') toggleTheme(); else if (a === 'legend') { const el = $('#mleg'); el.hidden = !el.hidden; paintMLeg(); } else if (a === 'tour') O?.tour(); else if (a === 'reset') { O?.select(null); O?.reset(); }
  else if (a === 'style') cycleStyle(); else if (a === 'classic') show('a'); else openDrawer(a); });
const paintMLeg = () => { const el = $('#mleg'); if (el.hidden) return; const ids = ['damon', 'ceo', ...TOP.filter(i => i !== 'ceo'), 'skill_finder', 'up_skiller'].filter(i => V.A[i]);
  const ring = (st, col) => `<i class="rg ${st}" style="--r:${col}"></i>`;
  el.innerHTML = `<button class="mx" data-x aria-label="close">${svg('x', 20)}</button><div class="mlg">${ids.map(i => `<button data-sel="${i}" aria-label="${i}"><span class="ib" style="--h:${hue(i)}">${svg(AICON[i], 20)}</span>${isSub(i) ? `<em style="background:${accent(i).color}"></em>` : ''}</button>`).join('')}</div>
    <div class="mrg">${ring('solid thin', C.sub)}${svg('zap', 16)}${ring('dashed', C.waiting)}${svg('hourglass', 16)}${ring('dotted', C.dim)}${svg('clock', 16)}${ring('dashed', C.sub)}${svg('plug', 16)}${PUB ? '' : ring('solid thick', C.sub) + svg('alert', 16)}</div>`; };
$('#mleg').addEventListener('click', e => { if (e.target.closest('[data-x]')) { $('#mleg').hidden = true; return; } const b = e.target.closest('[data-sel]'); if (b) { $('#mleg').hidden = true; O?.select(b.dataset.sel); } });
const paintMCard = id => { const el = $('#mcard'); if (!el) return; if (!id || !LY || cur !== 'o' || STYLE === 'retro') { el.hidden = true; return; } const n = O?.nodes.get(id); if (!n) { el.hidden = true; return; }
  const a = V.A[id], r = rowOf(id), rg = ringOf(id), h = n.hue; const ic = n.kind === 'res' ? RES_ICON[id] : n.kind === 'session' ? AICON[n.parent] || 'sparkles' : AICON[id] || 'sparkles';
  const gauge = r?.score != null ? `<svg class="gauge" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="22" fill="none" stroke="${C.border}" stroke-width="5"/><circle cx="27" cy="27" r="22" fill="none" stroke="${h}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(r.score / 100 * 138.2).toFixed(1)} 200" transform="rotate(-90 27 27)"/></svg>${svg('medal', 18)}` : '';
  el.hidden = false; el.style.setProperty('--h', h);
  el.innerHTML = `<button class="mx" data-x aria-label="close">${svg('x', 20)}</button><div class="mtop"><span class="mb${n.kind === 'res' ? ' sq' : ''}" style="--h:${h}">${svg(ic, 30)}${rg ? `<i class="rg ${rg.style}${rg.pulse ? ' pulse' : ''}" style="--r:${rg.color}"></i>` : ''}</span>
    <span class="mbd">${badgesOf(id).map(([b]) => `<span class="bdg">${svg(b, 18)}</span>`).join('')}${n.kind === 'session' ? `<span class="bdg" style="color:${accent(n.sub.id).color}">${svg('route', 18)}</span>` : ''}</span><span class="mg">${gauge}</span></div>
    ${a && a.kind !== 'human' ? stepRow(id, true) + `<div class="mspark">${svg('events', 16)}${spark(id, 250, 40, h)}</div>` : ''}
    ${PUB ? '' : (a?.tag === 'idle' ? `<button class="mact" data-assign="${id}" aria-label="assign">${svg('assign', 20)}</button>` : '') + (a?.kind === 'human' ? `<button class="mact" data-tab="waiting" aria-label="waiting">${svg('hourglass', 20)}</button>` : '')}`; };
$('#mcard').addEventListener('click', e => { if (e.target.closest('[data-x]')) O?.select(null); });
function paintOrgHud() { if (!O) return; paintInsp(O.selected || inspId); paintLbMini(); paintTrack(); paintPlay(); paintMFab(); paintMLeg(); paintMCard(O.selected);
  $('#ttour').innerHTML = svg('tour', 16); $('#treset').innerHTML = svg('locate', 16); }
const hint = $('#mhint'); hint.innerHTML = svg('move3d', 34); setTimeout(() => hint.classList.add('gone'), 4200);

const evKey = e => e.time + '|' + e.agent + '|' + e.summary.slice(0, 80);
const refresh = (force) => { const sig = BASE.generated_at + '|' + JSON.stringify(LIVE?.vps || null).length + '|' + (LIVE?.vps_status?.last_ok_at || '') + '|' + JSON.stringify(LIVE?.outbox?.items || []);
  if (!force && sig === lastSig) return; lastSig = sig;
  const oldKeys = new Set(V.events.map(evKey)), oldLA = Object.fromEntries(Object.entries(V.A).map(([k, a]) => [k, a.last_active]));
  const wasLive = V.hubLive; build(); A = createPipeline(pipeCanvas, V, A.state, LY); if (LY) sizeStage();
  if (wasLive) V.events.filter(e => !oldKeys.has(evKey(e))).forEach(e => { e.fresh = true; freshQ.push(e); });   // first live merge = catch-up, not 'new'
  Object.keys(V.A).forEach(k => { if (V.A[k].last_active !== oldLA[k]) A.state.flash[k] = 1; });
  updMetrics(); paintTicker(); paintGate(); paintDrawer(); paintFoot(); paintMode(); paintLegend(); O?.rebuild(V); paintOrgHud(); };
const poll = async () => {
  try { const r = await fetch('data.json?ts=' + Date.now(), { cache: 'no-store' }); if (r.ok) { const d = await r.json(); if (d && d.agents) BASE = d; } } catch { }
  if (PUB) { liveMode = 'public'; refresh(); paintLive(); return; }
  refresh(); paintLive(); };
poll(); setInterval(poll, POLL_MS);
setInterval(() => { paintLive(); paintFoot(); paintGate(); }, 1000);
paintGate(); paintFoot(); paintMode();

let last = performance.now() / 1000; let started = false;
const loop = () => { const now = performance.now() / 1000; const dt = Math.min(0.05, now - last); last = now; V.now += dt;
  if (!started) { started = true; show(pin === 'b' ? 'b' : pin === 'a' ? 'a' : 'o'); }
  if (playing && V.now > nextEv) { nextEv = V.now + (freshQ.length ? 0.7 : EV_EVERY / speed); fireEvent(freshQ.length ? freshQ.shift() : nextReplay()); }
  const fading = V.now - sceneT < 0.9;
  if (cur === 'a' || fading) A.frame(V.now, dt, vw, vh, pipeScroll());
  if (B && (cur === 'b' || fading)) B.frame(V.now, dt);
  if (O && (cur === 'o' || fading)) O.frame(V.now, dt);
  if (!window.__manual) requestAnimationFrame(loop); };
document.fonts.ready.then(() => { resize(); paintOrgHud(); requestAnimationFrame(loop); });
window.__manual = Q.get('manual') === '1';
window.__dash = { V, show, poll, get liveMode() { return liveMode; }, get A() { return A; }, get O() { return O; }, seek,
  step(dt = 1 / 30) { const t = performance.now() / 1000; last = t - dt; loop(); } };
