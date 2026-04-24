// GemQuest — world/tile helpers and sprites
const GQ_GRID_W = 16;
const GQ_GRID_H = 10;
const GQ_CELL = 52;

const GQ_T = { GRASS: 0, TREE: 1, ROCK: 2, WATER: 3, PATH: 4, SHOP: 5, PORTAL: 6 };

const GQ_MAP_MAIN = [
  [1,1,0,0,4,4,4,0,0,0,0,3,3,3,0,1],
  [1,0,0,4,4,0,4,4,0,2,0,3,3,0,0,0],
  [0,0,2,4,0,0,0,4,4,0,0,0,0,0,1,1],
  [0,0,0,4,0,0,0,0,4,4,4,4,4,0,0,1],
  [5,4,4,4,0,0,1,0,0,0,0,0,4,0,0,0],
  [0,0,0,0,0,1,1,0,2,0,0,0,4,0,2,0],
  [0,1,0,0,0,0,0,0,0,0,0,4,4,0,0,0],
  [1,1,0,2,0,0,0,4,4,4,4,4,0,0,1,0],
  [0,0,0,0,0,0,4,4,0,0,0,0,0,1,1,1],
  [0,0,1,0,4,4,4,0,0,2,0,0,0,0,1,1],
];

const GQ_MAP_PORTAL = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2],
  [2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2],
  [2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2],
  [2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2],
  [2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2],
  [2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2],
  [2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2],
  [2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

function gqIsWalkable(t) { return t !== GQ_T.TREE && t !== GQ_T.ROCK && t !== GQ_T.WATER; }

function gqBuildWorld() {
  const tiles = GQ_MAP_MAIN.map((r) => r.slice());
  tiles[4][0] = GQ_T.SHOP;
  const portalSpot = { x: 14, y: 1 };
  let seed = 42;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const slots = [];
  for (let y = 0; y < GQ_GRID_H; y++) for (let x = 0; x < GQ_GRID_W; x++) {
    if (gqIsWalkable(tiles[y][x]) && tiles[y][x] !== GQ_T.SHOP) slots.push({ x, y });
  }
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  const gems = [];
  for (let i = 0; i < 34 && i < slots.length; i++) {
    gems.push({ ...slots[i], val: 1 + Math.floor(rand() * 3) });
  }
  return { tiles, gems, portalSpot };
}

function gqSpawnGems(world, picked, count, exclude, inPortal) {
  const prefix = inPortal ? 'p' : 'm';
  const occupied = new Set();
  world.gems.forEach((g, i) => {
    if (!picked[`${prefix}-${i}`]) occupied.add(`${g.x},${g.y}`);
  });
  if (exclude) occupied.add(`${Math.floor(exclude.x)},${Math.floor(exclude.y)}`);
  const slots = [];
  for (let y = 0; y < GQ_GRID_H; y++) for (let x = 0; x < GQ_GRID_W; x++) {
    const t = world.tiles[y][x];
    if (!gqIsWalkable(t)) continue;
    if (t === GQ_T.SHOP || t === GQ_T.PORTAL) continue;
    if (occupied.has(`${x},${y}`)) continue;
    slots.push({ x, y });
  }
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  const extra = [];
  const valFloor = inPortal ? 3 : 1;
  const valRange = inPortal ? 4 : 3;
  for (let i = 0; i < count && i < slots.length; i++) {
    extra.push({ ...slots[i], val: valFloor + Math.floor(Math.random() * valRange) });
  }
  return { ...world, gems: [...world.gems, ...extra] };
}

function gqBuildPortalWorld(k) {
  const tiles = GQ_MAP_PORTAL.map((r) => r.slice());
  let seed = 77 + k * 13;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const slots = [];
  for (let y = 0; y < GQ_GRID_H; y++) for (let x = 0; x < GQ_GRID_W; x++) {
    if (tiles[y][x] === GQ_T.PATH && !(x === 1 && y === 1)) slots.push({ x, y });
  }
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  const gems = [];
  for (let i = 0; i < 22; i++) gems.push({ ...slots[i], val: 3 + Math.floor(rand() * 4) });
  return { tiles, gems };
}

function GQTile({ t, x, y }) {
  const T = GQ_T;
  const bg = { 0: '#6FBF5A', 1: '#6FBF5A', 2: '#8AA492', 3: '#4A90E2', 4: '#D9B879', 5: '#D9B879', 6: '#2C1B4A' }[t];
  const shade = (x + y) % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'transparent';
  return (
    <div style={{ position: 'absolute', left: x * GQ_CELL, top: y * GQ_CELL, width: GQ_CELL, height: GQ_CELL, background: bg, boxShadow: `inset 0 0 0 1px ${shade}` }}>
      {t === T.TREE && <div style={{ position: 'absolute', inset: '6%', background: 'radial-gradient(circle at 35% 30%, #5BAE47 0%, #2E7D32 60%, #1B5E20 100%)', borderRadius: '50% 50% 48% 48% / 55% 55% 45% 45%', boxShadow: '0 3px 0 rgba(0,0,0,0.25)' }} />}
      {t === T.ROCK && <div style={{ position: 'absolute', left: '15%', top: '20%', width: '70%', height: '60%', background: 'radial-gradient(circle at 35% 30%, #B8C3BA 0%, #7C8C80 70%, #546155 100%)', borderRadius: '40% 50% 45% 55% / 55% 40% 50% 45%', boxShadow: '0 2px 0 rgba(0,0,0,0.3)' }} />}
      {t === T.WATER && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #5FA9E8 0%, #3B78C4 100%)', backgroundImage: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.4) 1px, transparent 2px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.3) 1px, transparent 2px)' }} />}
      {t === T.PATH && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #E8C892 0%, #C9A769 100%)', boxShadow: 'inset 0 0 6px rgba(0,0,0,0.15)' }} />}
      {t === T.SHOP && (
        <div style={{ position: 'absolute', left: '8%', top: '12%', width: '84%', height: '76%', background: 'linear-gradient(180deg, #D97B3C 0%, #9F4F1C 100%)', borderRadius: 4, boxShadow: '0 3px 0 rgba(0,0,0,0.35), inset 0 0 0 2px rgba(0,0,0,0.25)' }}>
          <div style={{ position: 'absolute', top: 3, left: 0, right: 0, textAlign: 'center', color: 'white', fontWeight: 900, fontSize: 10, letterSpacing: 1, fontFamily: '"Fredoka One", sans-serif' }}>SHOP</div>
          <div style={{ position: 'absolute', top: 18, left: '25%', right: '25%', bottom: '18%', background: '#FFE89C', border: '2px solid #5a3a18', borderRadius: 2 }} />
        </div>
      )}
      {t === T.PORTAL && <div style={{ position: 'absolute', inset: '8%', background: 'radial-gradient(circle, #E066FF 0%, #9D3FD9 40%, #4A1B6E 80%, #2C1B4A 100%)', borderRadius: '50%', boxShadow: '0 0 20px #E066FF, inset 0 0 12px rgba(255,255,255,0.4)', animation: 'gq-portal-spin 3s linear infinite' }} />}
    </div>
  );
}

function GQHero({ x, y, facing, moving }) {
  return (
    <div style={{ position: 'absolute', left: x * GQ_CELL, top: y * GQ_CELL, width: GQ_CELL, height: GQ_CELL, transition: 'left .14s, top .14s', zIndex: 10, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: '12%', animation: moving ? 'gq-hop .3s ease-in-out' : 'none' }}>
        <div style={{ position: 'absolute', left: '15%', top: '40%', width: '70%', height: '45%', background: 'linear-gradient(180deg, #FF6B6B 0%, #C73E3E 100%)', borderRadius: '30% 30% 20% 20%', border: '2px solid #2a1010' }} />
        <div style={{ position: 'absolute', left: '18%', top: '5%', width: '64%', height: '45%', background: 'radial-gradient(circle at 35% 35%, #FFE0C2 0%, #F5C89A 70%, #C99967 100%)', borderRadius: '45%', border: '2px solid #2a1010' }}>
          <div style={{ position: 'absolute', left: facing === 'right' ? '46%' : '20%', top: '42%', width: 5, height: 5, background: '#1a0808', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', left: facing === 'right' ? '68%' : '44%', top: '42%', width: 5, height: 5, background: '#1a0808', borderRadius: '50%' }} />
        </div>
        <div style={{ position: 'absolute', left: '14%', top: '-4%', width: '72%', height: '22%', background: 'linear-gradient(180deg, #FFCC00 0%, #DAA500 100%)', borderRadius: '50% 50% 10% 10%', border: '2px solid #2a1010' }} />
      </div>
    </div>
  );
}

function GQGem({ x, y, val, picked }) {
  const color = val >= 5 ? '#E066FF' : val >= 3 ? '#FFCC00' : val >= 2 ? '#5FE8D4' : '#7EE8A6';
  return (
    <div style={{ position: 'absolute', left: x * GQ_CELL, top: y * GQ_CELL, width: GQ_CELL, height: GQ_CELL, pointerEvents: 'none', transition: 'transform .3s, opacity .3s', transform: picked ? 'translateY(-20px) scale(0.6)' : 'translateY(0) scale(1)', opacity: picked ? 0 : 1, zIndex: 5 }}>
      <div style={{ position: 'absolute', left: '30%', top: '28%', width: '40%', height: '40%', background: `linear-gradient(135deg, white 0%, ${color} 40%, ${color} 100%)`, clipPath: 'polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)', filter: `drop-shadow(0 0 6px ${color}88)`, animation: 'gq-float 2s ease-in-out infinite' }} />
    </div>
  );
}

Object.assign(window, { GQ_GRID_W, GQ_GRID_H, GQ_CELL, GQ_T, gqIsWalkable, gqBuildWorld, gqBuildPortalWorld, gqSpawnGems, GQTile, GQHero, GQGem });
