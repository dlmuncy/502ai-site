import { C, TAG, THEMES, THEME, setTheme } from './palette.js';
import { HUES, TOP, hue, accent, isSub, subAgents, ACCENTS, GLYPHS } from './identity.js';
const TQ = new URLSearchParams(location.search).get('theme');
setTheme(THEMES[TQ] ? TQ : (() => { try { return localStorage.getItem('dash-theme'); } catch { return null; } })() || 'dark');
import { derive, fmtET, mergeLive, gates, age } from './derive.js';
import { createPipeline } from './pipeline.js';
import { createNebula } from './nebula.js';
import { insights, FORMULAS, STEPS } from './insights.js';
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
const EV_EVERY = 1.6;
const $ = s => document.querySelector(s);
document.querySelectorAll('[data-ic]').forEach(b => b.insertAdjacentHTML('afterbegin', svg(b.dataset.ic, b.classList.contains('hd') ? 15 : 14)));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const NAME = { skill_finder: 'Skill-Finder', up_skiller: 'Up-Skiller', ceo: 'CEO', reed: 'Reed', evelyn: 'Evelyn', dutchess: 'Dutchess', viv: 'Viv', agent_builder: 'Agent Builder', friend: 'Friend', motion: 'Motion', product_manager: 'Product Manager', damon: 'Damon' };

const odo = (el, str) => { el.innerHTML = ''; [...String(str)].forEach((ch, i) => { if (!/\d/.test(ch)) { el.append(ch); return; }
  const o = document.createElement('span'); o.className = 'odo'; const col = document.createElement('span'); col.innerHTML = Array.from({ length: 10 }, (_, d) => `<i>${d}</i>`).join('');
  o.append(col); el.append(o); col.style.transform = 'translateY(0)'; setTimeout(() => col.style.transform = `translateY(-${+ch * 1.15}em)`, 80 + i * 90); }); };
const metricVals = () => [['users', 'agents online (active in 24 h)', `${V.online}/${V.aiCount}`, ''], ['a2a', 'known agent-to-agent messages', V.a2aKnown, 'lime'], ['check', 'owner approvals logged', V.approvals ?? 'unknown', 'cream'], ['events', 'timeline events loaded', V.events.length, ''], ['link', 'links between agents/sources', V.D.links.length, ''],
];
let shownM = metricVals();
$('#metrics').innerHTML = shownM.map(([ic, k, v, c], i) => `<div class="m" title="${k}"><span class="k">${svg(ic, 14)}</span><span class="v ${c}" id="mv${i}"></span></div>`).join('');
const runMetrics = () => shownM.forEach(([, , v], i) => odo($('#mv' + i), v));
const updMetrics = () => { const nm = metricVals(); nm.forEach(([, , v], i) => { if (String(v) !== String(shownM[i][2])) { const el = $('#mv' + i); odo(el, v); el.classList.remove('chg'); void el.offsetWidth; el.classList.add('chg'); } }); shownM = nm; };
const ROLL = ['ceo', 'reed', 'evelyn', 'dutchess', 'skill_finder', 'up_skiller', 'viv', 'agent_builder', 'friend', 'motion', 'product_manager'].filter(id => V.A[id]);
const rollName = id => id === 'product_manager' ? 'PM' : id === 'dutchess' ? 'Duch.' : id === 'skill_finder' ? 'Finder' : id === 'up_skiller' ? 'Up-Skiller' : id === 'agent_builder' ? 'Builder' : id === 'viv' ? 'Viv' : id === 'dutchess' ? 'Dutchess' : V.A[id].name;
document.documentElement.style.setProperty('--rolln', ROLL.length);
$('#roll').innerHTML = ROLL.map(id => `<div class="rc" id="rc-${id}" title="${esc(V.A[id].name)} · ${esc(V.A[id].role)}"><div class="ic">${svg(AICON[id], 16)}<span class="dot"></span></div>
  <div class="tx"><div class="n">${rollName(id)}<span class="la"></span></div><div class="l"></div></div><div class="meter">${'<b></b>'.repeat(8)}</div></div>`).join('');
const paintRoll = () => ROLL.forEach(id => { const a = V.A[id], T = TAG[a.tag], el = $('#rc-' + id), nb = V.blk.agents.get(id) || 0;
  const ic = el.querySelector('.ic'); ic.style.color = hue(id); ic.style.borderColor = hue(id);
  let bd = ic.querySelector('.acc'); if (isSub(id)) { const a = accent(id); if (!bd) { bd = document.createElement('i'); bd.className = 'acc'; ic.append(bd); } bd.textContent = a.glyph; bd.style.color = a.color; bd.style.borderColor = a.color; } const d = el.querySelector('.dot'); d.style.background = nb ? C.danger : T.color; d.style.boxShadow = `0 0 8px ${nb ? C.danger : T.color}`;
  el.querySelector('.la').textContent = a.last_active ? fmtET(a.last_active).slice(6) : '?';
  const l = el.querySelector('.l'); l.style.color = T.color; const SI = V.I.steps[id]; const cs = SI && SI.current ? STEPS.find(x => x.id === SI.current) : null; el.title = `${a.name} · ${T.label}${nb ? ' · ' + nb + ' blocker(s)' : ''}${cs ? ' · current step: ' + cs.label : ''}`; l.innerHTML = (nb ? `<b class="bk">${svg('block', 10)}${nb}</b> ` : '') + (cs ? `<span class="cs">${svg(cs.icon, 11)} ${cs.label}</span>` : '<span class="cs na">no events</span>'); });
let meters = {}, mMax = 1;
const calcMeters = () => { const t0 = new Date(V.events[0].time).getTime(), t1 = new Date(V.events[V.events.length - 1].time).getTime();
  meters = Object.fromEntries(ROLL.map(id => { const b = new Array(8).fill(0); V.perAgent(id).forEach(e => b[Math.min(7, Math.floor((new Date(e.time) - t0) / ((t1 - t0) / 8 + 1)))]++); return [id, b]; }));
  mMax = Math.max(1, ...Object.values(meters).flat()); };
const paintMeters = t => ROLL.forEach(id => { const bars = document.querySelectorAll(`#rc-${id} .meter b`); const p = document.getElementById('rc-' + id).classList.contains('pulse') ? 1.0 : 0;
  bars.forEach((b, i) => { const v = meters[id][i] / mMax; b.style.height = Math.max(2, (v * 16) * (0.85 + 0.15 * Math.sin(t * 3 + i)) + p * 2) + 'px'; b.style.opacity = v ? 0.9 : 0.25; }); });
const revealRoll = () => ROLL.forEach((id, i) => { const el = $('#rc-' + id); el.classList.remove('in'); setTimeout(() => el.classList.add('in'), 120 + i * 110); });
paintRoll(); calcMeters();
const STAGES = ['INTAKE', 'ROUTE', 'EXECUTE', 'QA', 'HUMAN GATE', 'OUTCOME'];
const STGI = ['intake', 'route', 'build', 'qa', 'gate', 'deliver'];
const chipH = (id, share) => id ? `<span class="lchip" style="--h:${hue(id)}" title="lead: ${esc(NAME[id] || id)}${share != null ? ' · ' + Math.round(share * 100) + '% of events' : ''}">${svg(AICON[id] || 'sparkles', 11, hue(id))}${share != null ? Math.round(share * 100) + '%' : ''}</span>` : '<span class="lchip na">n/a</span>';
const paintTicker = () => { $('#ticker').innerHTML = STAGES.map((s, i) => { const L = V.I.streams.stages[i]; return `<span class="stg ${i === 4 ? 'gate' : ''}" id="stg${i}" title="${s.toLowerCase()} stage · lead: ${L.id ? esc(NAME[L.id] || L.id) + ' ' + Math.round(L.share * 100) + '% of ' + L.total + ' events' : 'n/a'}">${svg(STGI[i], 12)} ${s.toLowerCase()} ${chipH(L.id, L.share)}</span>`; }).join('<span class="arrow">›</span>') + '<span id="tev"></span>'; };
paintTicker();
const fresh = () => { const F = { ...(V.D.freshness || {}) }, st = LIVE?.vps_status;
  if (st) { const okAt = st.last_ok_at; const stale = !st.ok || !okAt || (Date.now() - new Date(okAt)) > 3 * (st.interval_s || 60) * 1000;
    F.hub = { label: 'vps hub', mode: stale ? 'stale' : 'live', fetched_at: okAt, note: st.ok ? `every ${st.interval_s}s` : 'poll failing: ' + (st.error || '') };
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
let A = createPipeline(pipeCanvas, V);
let B = null; try { B = createNebula($('#neb'), $('#labels'), V); } catch (err) { console.warn('webgl unavailable, nebula disabled', err); }
function rethemeScenes() { A = createPipeline(pipeCanvas, V, A.state); B?.setTheme?.(); paintRoll(); paintGate(); paintDrawer(); paintLegend(); }
let cur = null, sceneT = -10, revealed = false;
const btns = document.querySelectorAll('#toggle button[data-s]');
const show = s => { if (s === 'b' && !B) s = 'a'; if (s === cur) return; cur = s; sceneT = V.now;
  pipeCanvas.style.opacity = s === 'a' ? 1 : 0; nebWrap.style.opacity = s === 'b' ? 1 : 0; nebWrap.style.pointerEvents = s === 'b' ? 'auto' : 'none'; pipeCanvas.style.pointerEvents = s === 'a' ? 'auto' : 'none';
  $('#pause').style.display = s === 'b' ? '' : 'none'; btns.forEach(x => x.classList.toggle('on', x.dataset.s === s));
  (s === 'a' ? A : B)?.enter(V.now);
  if (!revealed) { revealed = true; revealRoll(); runMetrics(); }
  const u = new URL(location); if (s === 'b') u.searchParams.set('scene', 'b'); else u.searchParams.delete('scene'); history.replaceState(null, '', u); };
btns.forEach(b => b.onclick = () => show(b.dataset.s));
const typing = e => /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
addEventListener('keydown', e => { if (typing(e)) { if (e.key === 'Escape') { closeAssign(); e.target.blur(); } return; } const k = e.key.toLowerCase();
  if (k === 'escape' && (!$('#assign').hidden || !$('#drawer').hidden)) { closeAssign(); closeDrawer(); return; }
  if (k === 'l') { toggleTheme(); return; }
  if (k === 'g') { toggleLegend(); return; }
  if (k === 'n') show(cur === 'b' ? 'a' : 'b'); if (k === 'd' || k === 'escape') show('a'); if ((k === ' ' || k === 'p') && cur === 'b') { e.preventDefault(); togglePause(); } });
const togglePause = () => { if (!B) return; B.paused = !B.paused; $('#pause').innerHTML = B.paused ? svg('play', 13) : svg('pause', 13); };
$('#pause').onclick = togglePause;
let vw = 0, vh = 0; const resize = () => { const r = $('#stage').getBoundingClientRect(); vw = r.width; vh = r.height; const d = devicePixelRatio || 1;
  pipeCanvas.width = vw * d; pipeCanvas.height = vh * d; B?.resize(vw, vh); };
addEventListener('resize', resize); resize();
let ei = 0, nextEv = 0.8; const freshQ = [];
const fireEvent = e => { A.event(e); B?.event(e);
  STAGES.forEach((_, i) => $('#stg' + i).classList.toggle('live', i === e.stage));
  const fl = A.flowLead(e); $('#tev').innerHTML = `${e.fresh ? '<b class="nw">NEW</b> ' : ''}${fmtET(e.time)} ${V.A[e.agent] ? svg(AICON[e.agent], 12, hue(e.agent)) : esc(e.agent)} ${fl ? `<span class="fl" title="flow lead (most events on this route)">${svg('route', 11)} ${chipH(fl.lead?.id, fl.lead?.share)}</span>` : ''} ${esc(e.summary.replace(/^#[\w-]+: /, '').toLowerCase())}`;
  new Set([e.agent, ...e.route.flat()]).forEach(id => { const el = document.getElementById('rc-' + id); if (el) { el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 900); } });
  const ne = $('#nebev'); if (ne) ne.textContent = '> ' + e.agent + ' · ' + e.summary.toLowerCase().slice(0, 110); };
const nextReplay = () => { const e = V.events[ei % V.events.length]; ei++; return e; };
if (skip > 0) { const n = Math.floor(skip / EV_EVERY); for (let i = 0; i < n; i++) nextReplay(); }

let tab = 'waiting';
const sinceTx = x => x.since ? `waiting ${age(x.since)} · since ${fmtET(x.since)} et` : `since: ${x.since_note || 'unknown'}`;
const failedAns = w => w.answer && w.answer.status === 'failed';
const paintGate = () => { const W = V.waiting, Bk = V.blockers, open = W.filter(w => !w.answer || failedAns(w)).length;
  $('#wcount').textContent = PUB ? (V.waitingCount ?? 0) : open; $('#bcount').textContent = Bk.length;
  $('#wchips').innerHTML = [...W.filter(failedAns), ...W.filter(w => !w.answer), ...W.filter(w => w.answer && !failedAns(w))].map(w => `<button class="chip ${failedAns(w) ? 'fail' : w.answer ? 'done' : ''}" data-tab="waiting" data-id="${esc(w.id)}" title="${esc(w.title)}">${esc(w.title)}<i>${failedAns(w) ? 'send failed' : w.answer ? 'answered' : w.since ? age(w.since) : ''}</i></button>`).join('') +
    (V.answered.length ? `<button class="chip hist" data-tab="answered" title="Answered items (history)">answered (${V.answered.length})</button>` : '');
  const tb = document.querySelector('#drawer .tabs button[data-tab="answered"]'); if (tb) tb.textContent = `answered (${V.answered.length})`;
  $('#bchips').innerHTML = Bk.map(b => `<button class="chip" data-tab="blockers" data-id="${esc(b.id)}" title="${esc(b.what)}">${esc(b.what)}<i>${b.since ? age(b.since) : ''}</i></button>`).join(''); };
const drawerBody = () => {
  if (tab === 'blockers') return `<p class="meta" style="margin-bottom:8px">Blocker categories derived from the team's real logs. Details are censored in this public copy.</p>` + (V.blockers.length ? V.blockers.map(b => `<div class="card b"><h4>${esc(b.what)}</h4><div class="meta">${b.since ? `blocked ${age(b.since)} · since ${fmtET(b.since)} et` : 'since: unknown'} · rule: ${esc(b.rule)}${b.agents.length ? ' · affects ' + b.agents.map(a => NAME[a] || a).join(', ') : ''}</div></div>`).join('') : '<p>No blockers right now.</p>');
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
   <div class="lt">Status = a separate ring</div><div class="lg"><span><i class="rg" style="border:3px solid ${C.danger}"></i>blocked / no reply (pulses)</span><span><i class="rg" style="border:2px dashed ${C.waiting}"></i>waiting on you</span><span><i class="rg" style="border:1.5px dashed ${C.sub}"></i>pending setup</span><span><i class="rg" style="border:1.5px dotted ${C.dim}"></i>idle</span><span><i class="rg" style="border:1px solid ${C.sub};opacity:.6"></i>active</span></div>
   <div class="lt">Sub-agents: parent's hue, smaller orb, own accent (2nd-colour arc + orbiting dot + glyph), tether to parent (dashed = parent unknown)</div>
   <div class="ls">${subs.map(x => `<div>${sw(x.hue)}<b style="color:${x.accent.color}">${x.accent.glyph}</b> ${esc(x.name)} <span class="meta">→ ${x.known ? esc(HUES[x.parent]?.name || x.parent) : 'parent unknown'} · ${esc(x.accent.name)}</span></div>`).join('')}</div>`;
  $('#lgx').onclick = toggleLegend; };
const toggleLegend = () => { const el = $('#legend'); el.hidden = !el.hidden; $('#lgbtn').classList.toggle('on', !el.hidden); paintLegend(); };
$('#lgbtn').onclick = toggleLegend;
const closeAssign = () => {}; const idleAt = () => null;
const tipEl = $('#tip');
pipeCanvas.addEventListener('mousemove', ev => { pipeCanvas.classList.toggle('hand', !PUB && !!idleAt(ev)); const r = pipeCanvas.getBoundingClientRect(); const h = A.tipAt(ev.clientX - r.left, ev.clientY - r.top);
  if (!h) { tipEl.hidden = true; return; } tipEl.innerHTML = h; tipEl.hidden = false; const tw = tipEl.offsetWidth, th = tipEl.offsetHeight; tipEl.style.left = Math.min(innerWidth - tw - 8, ev.clientX + 14) + 'px'; tipEl.style.top = (ev.clientY + 16 + th > innerHeight ? ev.clientY - th - 10 : ev.clientY + 16) + 'px'; });
pipeCanvas.addEventListener('mouseleave', () => tipEl.hidden = true);

const evKey = e => e.time + '|' + e.agent + '|' + e.summary.slice(0, 80);
const refresh = (force) => { const sig = BASE.generated_at + '|' + JSON.stringify(LIVE?.vps || null).length + '|' + (LIVE?.vps_status?.last_ok_at || '') + '|' + JSON.stringify(LIVE?.outbox?.items || []);
  if (!force && sig === lastSig) return; lastSig = sig;
  const oldKeys = new Set(V.events.map(evKey)), oldLA = Object.fromEntries(Object.entries(V.A).map(([k, a]) => [k, a.last_active]));
  const wasLive = V.hubLive; build(); A = createPipeline(pipeCanvas, V, A.state);
  if (wasLive) V.events.filter(e => !oldKeys.has(evKey(e))).forEach(e => { e.fresh = true; freshQ.push(e); });   // first live merge = catch-up, not 'new'
  Object.keys(V.A).forEach(k => { if (V.A[k].last_active !== oldLA[k]) A.state.flash[k] = 1; });
  updMetrics(); paintRoll(); calcMeters(); paintTicker(); paintGate(); paintDrawer(); paintFoot(); paintMode(); paintLegend(); };
const poll = async () => {
  try { const r = await fetch('data.json?ts=' + Date.now(), { cache: 'no-store' }); if (r.ok) { const d = await r.json(); if (d && d.agents) BASE = d; } } catch { }
  if (PUB) { liveMode = 'public'; refresh(); paintLive(); return; }
  refresh(); paintLive(); };
poll(); setInterval(poll, POLL_MS);
setInterval(() => { paintLive(); paintFoot(); paintGate(); }, 1000);
paintGate(); paintFoot(); paintMode();

let last = performance.now() / 1000; let started = false;
const loop = () => { const now = performance.now() / 1000; const dt = Math.min(0.05, now - last); last = now; V.now += dt;
  if (!started) { started = true; show(pin === 'b' ? 'b' : 'a'); }
  if (V.now > nextEv) { nextEv = V.now + (freshQ.length ? 0.7 : EV_EVERY); fireEvent(freshQ.length ? freshQ.shift() : nextReplay()); }
  const fading = V.now - sceneT < 0.9;
  if (cur === 'a' || fading) A.frame(V.now, dt, vw, vh);
  if (B && (cur === 'b' || fading)) B.frame(V.now, dt);
  paintMeters(V.now); requestAnimationFrame(loop); };
document.fonts.ready.then(() => requestAnimationFrame(loop));
window.__dash = { V, show, poll, get liveMode() { return liveMode; } };
