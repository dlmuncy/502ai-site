export function derive(D) {
  const gen = new Date(D.generated_at);
  const A = Object.fromEntries(D.agents.map(a => [a.id, a]));
  const tagOf = a => {
    if (a.kind === 'human') return 'human';
    const s = (a.status || '').toLowerCase();
    if (/unresponsive|stopped|exited/.test(s)) return 'unresp';
    if (/pending setup/.test(s)) return 'pending';
    if (a.id === 'dutchess' || a.id === 'viv') return 'waiting'; // dutchess: model change pending owner OK; viv: buyer-portal decisions pending
    if (/idle/.test(s)) return 'idle';
    return 'active';
  };
  D.agents.forEach(a => a.tag = tagOf(a));
  const hrs = a => a.last_active ? (gen - new Date(a.last_active)) / 36e5 : null;
  const ai = D.agents.filter(a => a.kind !== 'human');
  const online = ai.filter(a => { const h = hrs(a); return h !== null && h <= 24; }).length;
  const nonAgent = new Set(['drive', 'board', 'n8n']);
  const a2aLinks = D.links.filter(l => !nonAgent.has(l.to) && l.from !== 'damon');
  const a2aKnown = a2aLinks.reduce((s, l) => s + (l.count || 0), 0);
  const approvals = (D.links.find(l => l.from === 'damon' && l.to === 'ceo') || {}).count ?? null;
  const rev = null;
  const events = [...D.events].sort((a, b) => a.time.localeCompare(b.time));
  const ids = ['reed', 'evelyn', 'dutchess', 'viv', 'friend', 'motion', 'agent_builder', 'skill_finder', 'up_skiller', 'product_manager'];
  const routeOf = e => {
    const s = e.summary.toLowerCase(), who = e.agent;
    if (e.type === 'a2a_message') {
      if (who === 'skill_finder') return [['skill_finder', 'up_skiller'], ['skill_finder', 'ceo']];
      if (who === 'up_skiller') return [['up_skiller', 'reed'], ['up_skiller', 'evelyn'], ['up_skiller', 'dutchess']];
      const wl = /^#loop: in the weeds: started (\w+)/.exec(s); if (who === 'ceo' && wl && ids.includes(wl[1])) return [['ceo', wl[1]]];
      if (who === 'ceo' && s.startsWith('#dutchess')) return [['ceo', 'dutchess']];
      if (who === 'ceo' && /viv/.test(s)) return [['ceo', 'viv']];
      if (who === 'ceo') return [['ceo', 'reed'], ['ceo', 'evelyn'], ['ceo', 'dutchess']];
      if (who === 'dutchess' && s.includes('reed,')) return [['dutchess', 'reed']];
      if (who === 'viv') return [['viv', 'ceo']];
      return [[who, 'ceo']];
    }
    if (who === 'ceo' && e.type === 'task_assigned') { const t = ids.find(i => s.includes(i)); return t ? [['ceo', t]] : [['ceo', 'reed']]; }
    if (who === 'ceo' && e.type === 'checkin') return [['hub', 'ceo'], ['reed', 'ceo'], ['evelyn', 'ceo'], ['dutchess', 'ceo']];
    
    if (who === 'ceo' && (e.type === 'report' || /saved deliverables|drive/.test(s))) return [['ceo', 'drive']];
    if (who === 'ceo') return [['drive', 'ceo']];
    if (who === 'damon') return [['damon', 'ceo']];
    if (ids.includes(who)) return [[who, 'ceo']];
    return [];
  };
  const stageOf = e => {
    const s = e.summary.toLowerCase();
    if (/owner|damon|approv/.test(s) && /pending|wait|needs/.test(s + ' ' + (e.outcome || '').toLowerCase())) return 4;
    
    if (e.agent === 'dutchess' || /\bqa\b|verified|verify/.test(s)) return 3;
    if (e.type === 'task_assigned') return 1;
    if (e.type === 'checkin' || e.agent === 'viv') return 0;
    return 2;
  };
  events.forEach(e => { if (!e.route) e.route = routeOf(e); if (e.stage == null) e.stage = stageOf(e); });
  const perAgent = id => events.filter(e => e.agent === id || e.route.some(r => r.includes(id)));
  const hubPosts = (D.hub_raw || D.hub_snapshot?.messages || []).map(m => ({ ch: m.ch, agent: m.agent_id || hubAgent(m.agent, m.body), ts: m.ts }));
  return { D, A, gen, online, aiCount: ai.length, a2aKnown, a2aLinks, approvals, rev, events, perAgent, hrs, hubPosts };
}
export const fmtET = iso => { if (!iso) return 'unknown'; if (iso.length <= 10) return iso.slice(5); const d = new Date(iso);
  return d.toLocaleString('en-US', { timeZone: 'America/New_York', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ''); };

export const age = iso => { if (!iso) return null; const s = Math.max(0, (Date.now() - new Date(iso)) / 1000); if (s < 90) return Math.round(s) + 's';
  const m = s / 60; if (m < 90) return Math.round(m) + 'm'; const h = m / 60; if (h < 48) return Math.floor(h) + 'h ' + Math.round(m % 60) + 'm'; return Math.floor(h / 24) + 'd ' + Math.floor(h % 24) + 'h'; };

export const hubAgent = a => String(a || '').toLowerCase();
export const mergeLive = D0 => structuredClone(D0);
export function gates() { return { blockers: [], blk: { agents: new Map(), projects: new Map(), links: new Set() }, waiting: [], answered: [], queued: {} }; }
