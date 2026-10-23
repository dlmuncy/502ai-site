import { isSub } from './identity.js';
export const ORDER = ['ceo', 'cto', 'cso', 'product_manager', 'agent_builder', 'friend', 'motion', 'reed', 'evelyn', 'dutchess', 'skill_finder', 'up_skiller'];
const rk = id => { const i = ORDER.indexOf(id); return i < 0 ? 99 : i; };
export function tiers(A) {
  const top = A.damon ? 'damon' : null, second = A.viv ? 'viv' : null;
  const rest = Object.keys(A).filter(i => i !== top && i !== second).sort((a, b) => rk(a) - rk(b));
  return { top, second, rest, peers: rest.filter(i => !isSub(i)), subs: rest.filter(i => isSub(i)), parentOf: id => id === top ? null : id === second ? top : (second || top) };
}
