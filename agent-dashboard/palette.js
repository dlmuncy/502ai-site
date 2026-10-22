export const THEMES = {
  dark: {
    bg: '#081019', deep: '#050a11', navy: '#0b1424', panel: '#101c2d', panelHd: '#111f34', muted: '#142238', border: '#25364d',
    grid: 'rgba(183,243,75,0.08)', text: '#f4f7fb', sub: '#a7b7ca', dim: '#62748e',
    active: '#b7f34b', activeHi: '#e8f8c6', activeLo: '#5c7e19', activeDk: '#243514', waiting: '#ffeecc', success: '#00d294', danger: '#a7b7ca',
  },
  light: {
    bg: '#f5f7fb', deep: '#eef2f8', navy: '#ffffff', panel: '#ffffff', panelHd: '#f3f6fa', muted: '#e8edf5', border: '#dde3ec',
    grid: 'rgba(26,115,232,0.05)', text: '#1b1f24', sub: '#3d4552', dim: '#5d6878',
    active: '#1a73e8', activeHi: '#0b57d0', activeLo: '#a8c7fa', activeDk: '#e8f0fe',
    waiting: '#9a5b00', success: '#137333', danger: '#3c4043',
  },
};
export const ACCENT = { ceo: '#4285f4', reed: '#00a4ef', evelyn: '#34a853', dutchess: '#fbbc05', skill_finder: '#7fba00', up_skiller: '#fa7b17', viv: '#a142f4', agent_builder: '#737373', friend: '#24c1e0', motion: '#f538a0', damon: '#8f5300' };
export const C = { ...THEMES.dark };
export let THEME = 'dark';
export const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; };
export const MONO = '"JetBrains Mono", ui-monospace, monospace';
export const SANS = '"Inter", ui-sans-serif, system-ui, sans-serif';
export const TAG = {};
const tags = () => Object.assign(TAG, {
  active:   { label: '[active]',           color: C.active },
  waiting:  { label: '[waiting on damon]', color: C.waiting },
  idle:     { label: '[idle]',             color: C.dim },
  unresp:   { label: '[idle]', color: C.dim },
  human:    { label: '[human gate]',       color: C.waiting },
  pending:  { label: '[pending setup]',    color: C.sub },
});
tags();
export const setTheme = name => { THEME = THEMES[name] ? name : 'dark'; Object.assign(C, THEMES[THEME]); tags(); document.documentElement.dataset.theme = THEME; return THEME; };
export const keyOf = (hex, th = THEME) => Object.keys(THEMES[th]).find(k => THEMES[th][k].toLowerCase() === String(hex).toLowerCase());
