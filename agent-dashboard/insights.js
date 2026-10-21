export const STEPS = [
  { id: 'intake', icon: 'intake', label: 'intake', tip: 'Intake: check-ins, tasks assigned, messages received' },
  { id: 'research', icon: 'research', label: 'research', tip: 'Research: leads, scouting, vetting, planning, reading' },
  { id: 'build', icon: 'build', label: 'build', tip: 'Build: build / fix / add / draft / deploy / install / render' },
  { id: 'qa', icon: 'qa', label: 'QA', tip: 'QA: QA, verify, test, check, audit, PASS' },
  { id: 'deliver', icon: 'deliver', label: 'deliver', tip: 'Deliver: deliverables, reports, done, posted, live' },
];
export const AGENTS = ['ceo', 'reed', 'evelyn', 'dutchess', 'skill_finder', 'up_skiller', 'viv', 'agent_builder', 'friend', 'motion', 'product_manager'];
const low = e => ((e.summary || '') + ' ' + (e.outcome || '')).toLowerCase();
export const stepOf = e => {
  if (e.step) return e.step;
  const s = low(e);
  if (e.type === 'task_assigned' || e.type === 'checkin') return 'intake';
  if (e.type === 'deliverable' || e.type === 'report' || /\b(done|delivered|shipped|published|live now|is live|saved deliverables)\b/.test(s)) return 'deliver';
  if (e.type === 'verified' || /\bqa\b|verif|\btest|\bpass\b|\bfail|\bcheck(ed|s)?\b|curl|audit/.test(s)) return 'qa';
  if (/\bbuil|\bfix|deploy|implement|install|creat|draft|\badd(ed|s)?\b|wrote|updat|redesign|render|set ?up|migrat/.test(s)) return 'build';
  if (/research|\blead|scout|search|\bvet|\bfind|\bfound|\bplan|analy|review|\bread/.test(s)) return 'research';
  return e.type === 'a2a_message' ? 'intake' : 'build';
};
const H = 36e5, ts = t => new Date(t).getTime();
const receivers = e => [...new Set((e.route || []).filter(([f]) => f === e.agent).map(([, t]) => t))].filter(t => t !== e.agent);
export function insights(V, opts = {}) {
  const now = opts.now ?? Date.now(), ev = V.events, A = V.A;
  const ids = AGENTS.filter(id => A[id]);
  const steps = {};
  ids.forEach(id => { const st = Object.fromEntries(STEPS.map(s => [s.id, { n: 0, last: null }])); let cur = null;
    ev.forEach(e => { let k = null; if (e.agent === id) k = stepOf(e); else if (receivers(e).includes(id) && /task_assigned|a2a_message/.test(e.type)) k = 'intake'; if (!k) return;
      const x = st[k]; x.n++; if (!x.last || e.time >= x.last.time) x.last = e; if (!cur || e.time >= cur.time) cur = { time: e.time, step: k }; });
    steps[id] = { st, current: cur ? cur.step : null, total: Object.values(st).reduce((s, x) => s + x.n, 0) }; });
  const lead = (list, key = e => e.agent) => { const c = {}; list.forEach(e => { const k = key(e); if (k && A[k] && A[k].kind !== 'human') c[k] = (c[k] || 0) + 1; }); const tot = list.length;
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return top && tot ? { id: top[0], n: top[1], total: tot, share: top[1] / tot } : { id: null, n: 0, total: tot, share: null }; };
  const streams = { links: {}, channels: {}, stages: {}, types: {}, rows: {} };
  (V.D.links || []).forEach(l => { const k = l.from + '>' + l.to; streams.links[k] = lead(ev.filter(e => (e.route || []).some(([f, t]) => (f === l.from && t === l.to) || (f === l.to && t === l.from)))); });
  const posts = (V.hubPosts || []);
  const chs = Object.keys(V.D.meta?.hub_channels || {}); chs.forEach(ch => streams.channels[ch] = lead(posts.filter(p => p.ch === ch)));
  for (let i = 0; i < 6; i++) streams.stages[i] = lead(ev.filter(e => e.stage === i));
  [...new Set(ev.map(e => e.type))].forEach(t => streams.types[t] = lead(ev.filter(e => e.type === t)));
  const involved = id => ev.filter(e => e.agent === id || (e.route || []).some(r => r.includes(id))).length, allInv = ids.reduce((s, id) => s + involved(id), 0);
  ids.forEach(id => streams.rows[id] = { n: involved(id), share: allInv ? involved(id) / allInv : null });
  const win = h => ev.filter(e => ts(e.time) > now - h * H && ts(e.time) <= now + 5 * 6e4);
  const e24 = win(24), e7 = win(24 * 7), span0 = ev.length ? ev.reduce((m, e) => e.time < m ? e.time : m, ev[0].time) : null;
  const queued = V.queued || {}, blk = V.blk?.agents || new Map();
  const rows = ids.map(id => { const a = A[id];
    const w24 = e24.filter(e => e.agent === id).length, w7 = e7.filter(e => e.agent === id).length;
    const mine = e7.filter(e => e.agent === id);
    const assigned = e7.filter(e => receivers(e).includes(id) && (e.type === 'task_assigned' || /in the weeds: started/i.test(e.summary || ''))).length + (queued[id] || []).length;
    const completed = mine.filter(e => stepOf(e) === 'deliver' || e.type === 'verified' || /\b(done|verified|pass)\b/i.test(e.outcome || '')).filter(e => !/\bfail/i.test(e.outcome || '')).length;
    const failed = mine.filter(e => /block|fail/i.test(e.outcome || '')).length + (blk.get(id) || 0);
    const den = Math.max(assigned, completed + failed);
    const eff = den >= 2 ? Math.max(0, Math.min(1, (completed - 0.5 * failed) / den)) : null;
    const lastT = [a.last_active, ...ev.filter(e => e.agent === id).map(e => e.time)].filter(t => t && t.length > 10).sort().pop() || null;
    const idleH = lastT ? Math.max(0, (now - ts(lastT)) / H) : null;
    const hrs = new Set(e24.filter(e => e.agent === id).map(e => Math.floor((now - ts(e.time)) / H))); const activeShare = hrs.size / 24;
    return { id, w24, w7, assigned, completed, failed, den, eff, lastT, idleH, activeShare }; });
  const maxW = Math.max(0, ...rows.map(r => r.w7));
  rows.forEach(r => { const W = maxW && r.w7 ? r.w7 / maxW : null, R = r.idleH == null ? null : Math.max(0, 1 - r.idleH / 48);
    const terms = [[0.4, W], [0.4, r.eff], [0.2, R]].filter(([, v]) => v != null);
    r.W = W; r.R = R; r.partial = terms.length < 3; r.score = W == null ? null : Math.round(100 * terms.reduce((s, [w, v]) => s + w * v, 0) / terms.reduce((s, [w]) => s + w, 0)); });
  const by = (k, dir = -1) => rows.filter(r => r[k] != null).sort((a, b) => dir * (a[k] - b[k]) || (b.w7 - a.w7));
  const rank = by('score'); rank.forEach((r, i) => r.rank = i + 1);
  const pick = arr => arr[0] || null;
  const board = { rows, rank, now, span0, events: ev.length,
    works: pick(rows.filter(r => r.w24 + r.w7 > 0).sort((a, b) => b.w24 - a.w24 || b.w7 - a.w7)),
    effective: pick(by('eff')), idle: pick(by('idleH')), top: pick(rank) };
  return { steps, streams, board };
}
export const FORMULAS = {
  works: 'Works the most = events where the agent is the actor (Audit Log rows, hub posts, deliverables) in the last 24 h, tie-break 7 d. Window limited to the loaded timeline (newest 100 events).',
  effective: 'Most effective = completed / max(tasks assigned, completed), 7 d, clipped 0-100%. Completed = deliver-step events, verified rows, outcome Done/Verified/PASS. n/a when the denominator < 2.',
  idle: 'Idles the most = hours since the agent\'s last activity (newest of last_active and its own events). n/a when unknown. Active share = hours in the last 24 with >= 1 event / 24.',
  top: 'Overall score (0-100) = 0.4 x work (7 d events / busiest agent) + 0.4 x effectiveness + 0.2 x recency (1 - idle h / 48, floor 0). Missing terms are dropped and weights renormalised (marked *). n/a when the agent has no events in 7 d.',
  lead: 'Lead agent = the agent that is the actor in the most events of that stream; share = its events / all events in the stream.',
  steps: 'Step of an event (for its actor): task/check-in -> intake; deliverable/report/done -> deliver; verified/QA/test/audit/PASS -> QA; build/fix/add/draft/deploy/install -> build; research/leads/scout/vet/plan/review -> research. Tasks and messages an agent receives count as its intake. Current step = step of its newest event.',
};
