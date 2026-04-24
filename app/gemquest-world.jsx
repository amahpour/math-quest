// GemQuest — multi-level world helpers and tile definitions.
// Levels: 1 = Forest, 2 = City (biggest), 3 = Volcano.

const GQ_T = {
  // Walkable ground
  GRASS: 0, PATH: 4, SHOP: 5, PORTAL: 6,
  SIDEWALK: 7, STREET: 8, SOIL: 9, ASH: 10,
  FLOWERBED: 12, PLANT: 13, CROSSWALK: 14,
  BUS_STOP: 23,
  // "Water-like" — walkable but falls player in
  WATER: 3, LAVA: 11,
  // Obstacles (block movement, raycast as walls)
  TREE: 1, ROCK: 2, BUSH: 15,
  BUILDING: 16, HOUSE: 17, HYDRANT: 18, LAMPPOST: 19,
  DEAD_TREE: 20, VOLCANO: 21, SKULL: 22,
};

const GQ_WATER_TILES = new Set([GQ_T.WATER, GQ_T.LAVA]);
const GQ_WALL_TILES = new Set([
  GQ_T.TREE, GQ_T.ROCK, GQ_T.BUSH,
  GQ_T.BUILDING, GQ_T.HOUSE, GQ_T.HYDRANT, GQ_T.LAMPPOST,
  GQ_T.DEAD_TREE, GQ_T.VOLCANO, GQ_T.SKULL,
  GQ_T.SHOP,
]);

function gqIsWalkable(t) {
  // Water/lava are "walkable" — you can enter them (then you fall in)
  return !GQ_WALL_TILES.has(t);
}
function gqIsWater(t) { return GQ_WATER_TILES.has(t); }
function gqIsWall(t) { return GQ_WALL_TILES.has(t); }

// ---------- Seeded RNG ----------
function gqMakeRand(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// ---------- LEVEL 1: FOREST ----------
function gqBuildLevel1() {
  const W = 20, H = 20;
  const rand = gqMakeRand(101);
  const tiles = Array.from({ length: H }, () => Array(W).fill(GQ_T.GRASS));

  // Ground decorations (walkable): flowerbeds, plant patches, soil patches
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const r = rand();
    if (r < 0.09) tiles[y][x] = GQ_T.FLOWERBED;
    else if (r < 0.13) tiles[y][x] = GQ_T.PLANT;
    else if (r < 0.16) tiles[y][x] = GQ_T.SOIL;
  }

  // Winding dirt path from NW → SE
  for (let x = 0; x < W; x++) {
    const yp = Math.max(1, Math.min(H - 2, Math.floor(H / 2 + Math.sin(x * 0.35) * 4)));
    tiles[yp][x] = GQ_T.PATH;
    if (yp + 1 < H) tiles[yp + 1][x] = GQ_T.PATH;
  }

  // Small pond
  for (let y = 14; y < 18; y++) for (let x = 3; x < 7; x++) tiles[y][x] = GQ_T.WATER;

  // Second tiny pond
  for (let y = 3; y < 5; y++) for (let x = 13; x < 16; x++) tiles[y][x] = GQ_T.WATER;

  // Obstacles (trees/bushes/rocks) scattered on grass
  const wantObs = 70;
  let placed = 0, tries = 0;
  while (placed < wantObs && tries++ < 500) {
    const x = Math.floor(rand() * W);
    const y = Math.floor(rand() * H);
    const t = tiles[y][x];
    if (t !== GQ_T.GRASS && t !== GQ_T.FLOWERBED && t !== GQ_T.SOIL && t !== GQ_T.PLANT) continue;
    if (x < 2 && y < 2) continue; // keep spawn clear
    const r = rand();
    tiles[y][x] = r < 0.45 ? GQ_T.TREE : r < 0.75 ? GQ_T.BUSH : GQ_T.ROCK;
    placed++;
  }

  // Shop on the path, W-3 row 2
  tiles[2][W - 3] = GQ_T.SHOP;

  // Portal spawn location (placed dynamically once unlocked)
  const portalSpot = { x: W - 2, y: H - 3 };
  // Clear portal spot and approach
  tiles[portalSpot.y][portalSpot.x] = GQ_T.PATH;
  tiles[portalSpot.y][portalSpot.x - 1] = GQ_T.PATH;

  return {
    level: 1, theme: 'forest', w: W, h: H, tiles,
    start: { x: 1.5, y: 1.5, angle: 0 },
    portalSpot,
    portalUnlock: 20,
    gemBudget: 500,
    hasShop: true,
    busStops: [],
  };
}

// ---------- LEVEL 2: CITY (biggest) ----------
function gqBuildLevel2() {
  const W = 32, H = 32;
  const rand = gqMakeRand(202);
  const tiles = Array.from({ length: H }, () => Array(W).fill(GQ_T.SIDEWALK));

  // Street grid: streets occupy every 8-tile period at indices 6,7
  const isStreetCol = (x) => (x % 8) === 6 || (x % 8) === 7;
  const isStreetRow = (y) => (y % 8) === 6 || (y % 8) === 7;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (isStreetCol(x) || isStreetRow(y)) tiles[y][x] = GQ_T.STREET;
  }

  // Crosswalks at edges of intersections
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (tiles[y][x] !== GQ_T.STREET) continue;
    const inter = (isStreetCol(x) && isStreetRow(y));
    if (inter) continue;
    // Crosswalk when street is bordered by sidewalk across from it
    const neighborSide = (isStreetCol(x)) ? [tiles[y - 1] && tiles[y - 1][x], tiles[y + 1] && tiles[y + 1][x]]
                                          : [tiles[y][x - 1], tiles[y][x + 1]];
    // Stripe zebra on the edge rows of a street
    const edge = isStreetCol(x) ? ((y % 8) === 5 || (y % 8) === 0) : ((x % 8) === 5 || (x % 8) === 0);
    if (edge && (neighborSide[0] === GQ_T.SIDEWALK || neighborSide[1] === GQ_T.SIDEWALK)) {
      // zebra only when perpendicular street also meets here
      // we keep STREET, crosswalk is drawn as decoration. nothing to do.
    }
  }

  // Buildings and houses fill block interiors (1..4 inside each 8-tile block of 0..5 sidewalk)
  for (let by = 0; by < H; by += 8) {
    for (let bx = 0; bx < W; bx += 8) {
      const pickHouse = ((bx / 8 + by / 8) % 2) === 0;
      for (let dy = 1; dy <= 4; dy++) for (let dx = 1; dx <= 4; dx++) {
        const x = bx + dx, y = by + dy;
        if (x >= W || y >= H) continue;
        // leave a few 'yards' (grass) and door gaps to make it friendlier
        if ((dx === 2 || dx === 3) && (dy === 2 || dy === 3)) {
          tiles[y][x] = pickHouse ? GQ_T.HOUSE : GQ_T.BUILDING;
        } else {
          const r = rand();
          if (r < 0.15) tiles[y][x] = GQ_T.GRASS;
          else if (r < 0.22) tiles[y][x] = GQ_T.FLOWERBED;
          else if (r < 0.34) tiles[y][x] = pickHouse ? GQ_T.HOUSE : GQ_T.BUILDING;
          else tiles[y][x] = GQ_T.SIDEWALK;
        }
      }
    }
  }

  // Sprinkle sidewalk decor: lampposts, hydrants
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (tiles[y][x] !== GQ_T.SIDEWALK) continue;
    if (x < 2 && y < 2) continue; // keep spawn area clear
    const r = rand();
    if (r < 0.025) tiles[y][x] = GQ_T.LAMPPOST;
    else if (r < 0.04) tiles[y][x] = GQ_T.HYDRANT;
  }

  // Crosswalk decorations (non-blocking walkable tiles)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (tiles[y][x] !== GQ_T.STREET) continue;
    const edgeY = ((y % 8) === 5 || (y % 8) === 0) && ((x % 8) >= 6);
    const edgeX = ((x % 8) === 5 || (x % 8) === 0) && ((y % 8) >= 6);
    if (edgeX || edgeY) tiles[y][x] = GQ_T.CROSSWALK;
  }

  // Small park
  for (let y = 10; y < 14; y++) for (let x = 10; x < 14; x++) {
    const r = rand();
    tiles[y][x] = r < 0.25 ? GQ_T.TREE : r < 0.55 ? GQ_T.FLOWERBED : GQ_T.GRASS;
  }

  // Bus stops on sidewalks near intersections
  const busStops = [
    { id: 0, label: 'Downtown',  x: 2,  y: 5 },
    { id: 1, label: 'Park',      x: 10, y: 13 },
    { id: 2, label: 'Uptown',    x: 21, y: 5 },
    { id: 3, label: 'Riverside', x: 5,  y: 21 },
    { id: 4, label: 'Central',   x: 21, y: 21 },
    { id: 5, label: 'Market',    x: 29, y: 13 },
  ];
  busStops.forEach((s) => { if (tiles[s.y] && tiles[s.y][s.x] !== undefined) tiles[s.y][s.x] = GQ_T.BUS_STOP; });

  // Shop (city market) in a nice spot on sidewalk
  tiles[1][14] = GQ_T.SHOP;

  // Clear spawn
  tiles[1][1] = GQ_T.SIDEWALK;
  tiles[1][2] = GQ_T.SIDEWALK;
  tiles[2][1] = GQ_T.SIDEWALK;

  const portalSpot = { x: W - 3, y: H - 3 };
  tiles[portalSpot.y][portalSpot.x] = GQ_T.SIDEWALK;
  tiles[portalSpot.y][portalSpot.x - 1] = GQ_T.SIDEWALK;

  return {
    level: 2, theme: 'city', w: W, h: H, tiles,
    start: { x: 1.5, y: 1.5, angle: 0 },
    portalSpot,
    portalUnlock: 30,
    gemBudget: 1000,
    hasShop: true,
    busStops,
  };
}

// ---------- LEVEL 3: VOLCANO ----------
function gqBuildLevel3() {
  const W = 22, H = 22;
  const rand = gqMakeRand(303);
  const tiles = Array.from({ length: H }, () => Array(W).fill(GQ_T.ASH));

  // Soil patches
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const r = rand();
    if (r < 0.12) tiles[y][x] = GQ_T.SOIL;
  }

  // Lava lakes
  const lakes = [
    { cx: 6, cy: 14, r: 2.5 },
    { cx: 15, cy: 6, r: 2.2 },
    { cx: 17, cy: 16, r: 2.1 },
  ];
  for (const L of lakes) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = x - L.cx, dy = y - L.cy;
      if (dx * dx + dy * dy <= L.r * L.r + rand() * 1.5) tiles[y][x] = GQ_T.LAVA;
    }
  }

  // Central volcano mass (3x3 block of VOLCANO tiles)
  const vx = 10, vy = 10;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    tiles[vy + dy][vx + dx] = GQ_T.VOLCANO;
  }

  // Rocks, dead trees, skulls
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(rand() * W);
    const y = Math.floor(rand() * H);
    const t = tiles[y][x];
    if (t !== GQ_T.ASH && t !== GQ_T.SOIL) continue;
    if (x < 2 && y < 2) continue;
    const r = rand();
    tiles[y][x] = r < 0.4 ? GQ_T.ROCK : r < 0.75 ? GQ_T.DEAD_TREE : GQ_T.SKULL;
  }

  const portalSpot = { x: W - 2, y: H - 2 };
  tiles[portalSpot.y][portalSpot.x] = GQ_T.ASH;
  tiles[portalSpot.y][portalSpot.x - 1] = GQ_T.ASH;
  // Clear spawn
  tiles[1][1] = GQ_T.ASH;
  tiles[1][2] = GQ_T.ASH;
  tiles[2][1] = GQ_T.ASH;

  return {
    level: 3, theme: 'volcano', w: W, h: H, tiles,
    start: { x: 1.5, y: 1.5, angle: 0 },
    portalSpot,
    portalUnlock: 70,
    gemBudget: 500,
    hasShop: false,
    busStops: [],
  };
}

function gqBuildLevel(n) {
  if (n === 2) return gqBuildLevel2();
  if (n === 3) return gqBuildLevel3();
  return gqBuildLevel1();
}

// ---------- Gem placement ----------
function gqScatterGems(world, seed) {
  const rand = gqMakeRand(seed || (world.level * 101 + 7));
  const slots = [];
  for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
    const t = world.tiles[y][x];
    if (!gqIsWalkable(t)) continue;
    if (gqIsWater(t)) continue;
    if (t === GQ_T.SHOP || t === GQ_T.PORTAL || t === GQ_T.BUS_STOP) continue;
    if (x < 2 && y < 2) continue; // spawn tile
    slots.push({ x, y });
  }
  // Shuffle
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  // Build gems until budget reached
  const gems = [];
  let total = 0;
  for (const s of slots) {
    if (total >= world.gemBudget) break;
    const remaining = world.gemBudget - total;
    const maxV = Math.min(5, remaining);
    const val = Math.max(1, Math.min(maxV, 1 + Math.floor(rand() * 5)));
    gems.push({ x: s.x, y: s.y, val });
    total += val;
  }
  return { ...world, gems, gemTotal: total };
}

function gqSpawnBonusGems(world, picked, count, exclude, levelKey) {
  const prefix = `l${levelKey}-`;
  const occupied = new Set();
  world.gems.forEach((g, i) => {
    if (!picked[`${prefix}${i}`]) occupied.add(`${g.x},${g.y}`);
  });
  if (exclude) occupied.add(`${Math.floor(exclude.x)},${Math.floor(exclude.y)}`);
  const slots = [];
  for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
    const t = world.tiles[y][x];
    if (!gqIsWalkable(t) || gqIsWater(t)) continue;
    if (t === GQ_T.SHOP || t === GQ_T.PORTAL || t === GQ_T.BUS_STOP) continue;
    if (occupied.has(`${x},${y}`)) continue;
    slots.push({ x, y });
  }
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  const extra = [];
  for (let i = 0; i < count && i < slots.length; i++) {
    extra.push({ ...slots[i], val: 1 + Math.floor(Math.random() * 4) });
  }
  return { ...world, gems: [...world.gems, ...extra] };
}

// ---------- NPCs (level 2 only) ----------
function gqBuildCityNPCs(world) {
  // People walk on sidewalks only
  const npcs = [];
  const palette = ['#FF6B6B', '#4ADE80', '#5FE8D4', '#FFCC00', '#E066FF', '#FF9F40', '#8AB4F8', '#F472B6'];
  const spots = [];
  for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
    if (world.tiles[y][x] === GQ_T.SIDEWALK) spots.push({ x, y });
  }
  for (let i = 0; i < 10 && spots.length; i++) {
    const idx = Math.floor(Math.random() * spots.length);
    const s = spots.splice(idx, 1)[0];
    npcs.push({
      id: `npc${i}`,
      x: s.x + 0.5, y: s.y + 0.5,
      tx: s.x + 0.5, ty: s.y + 0.5,
      color: palette[i % palette.length],
      hatColor: palette[(i + 3) % palette.length],
      speed: 0.8 + Math.random() * 0.6,
    });
  }
  return npcs;
}

function gqPickNpcTarget(world, npc) {
  // Walk to a random nearby sidewalk tile
  for (let tries = 0; tries < 20; tries++) {
    const dx = Math.floor((Math.random() - 0.5) * 10);
    const dy = Math.floor((Math.random() - 0.5) * 10);
    const x = Math.floor(npc.x) + dx;
    const y = Math.floor(npc.y) + dy;
    if (x < 0 || y < 0 || x >= world.w || y >= world.h) continue;
    if (world.tiles[y][x] === GQ_T.SIDEWALK) {
      return { tx: x + 0.5, ty: y + 0.5 };
    }
  }
  return { tx: npc.tx, ty: npc.ty };
}

// ---------- Cars (level 2 only) ----------
function gqBuildCityCars(world) {
  const cars = [];
  const colors = ['#E53935', '#1E88E5', '#FDD835', '#43A047', '#8E24AA', '#FB8C00'];
  // Horizontal lanes (y on street rows): drive along y-rows where street cells run
  // For each horizontal street band, add a car going left and one going right
  const bandsY = [];
  for (let y = 0; y < world.h; y++) if ((y % 8) === 6 || (y % 8) === 7) bandsY.push(y);
  const bandsX = [];
  for (let x = 0; x < world.w; x++) if ((x % 8) === 6 || (x % 8) === 7) bandsX.push(x);
  let id = 0;
  // Horizontal: use two rows (even = go right, odd = go left)
  for (let i = 0; i < bandsY.length; i += 2) {
    const yR = bandsY[i], yL = bandsY[i + 1];
    if (yR !== undefined) cars.push({ id: `car${id++}`, x: 1 + Math.random() * (world.w - 2), y: yR + 0.5, dir: 'E', color: colors[id % colors.length], speed: 1.6 + Math.random() });
    if (yL !== undefined) cars.push({ id: `car${id++}`, x: 1 + Math.random() * (world.w - 2), y: yL + 0.5, dir: 'W', color: colors[id % colors.length], speed: 1.6 + Math.random() });
  }
  // Vertical
  for (let i = 0; i < bandsX.length; i += 2) {
    const xS = bandsX[i], xN = bandsX[i + 1];
    if (xS !== undefined) cars.push({ id: `car${id++}`, y: 1 + Math.random() * (world.h - 2), x: xS + 0.5, dir: 'S', color: colors[id % colors.length], speed: 1.6 + Math.random() });
    if (xN !== undefined) cars.push({ id: `car${id++}`, y: 1 + Math.random() * (world.h - 2), x: xN + 0.5, dir: 'N', color: colors[id % colors.length], speed: 1.6 + Math.random() });
  }
  return cars;
}

// ---------- Characters ----------
const GQ_CHARACTERS = [
  { id: 'alex', name: 'Alex', skin: '#FFE0C2', shirt: '#FF6B6B', hat: '#FFCC00' },
  { id: 'riya', name: 'Riya', skin: '#D8A374', shirt: '#5FE8D4', hat: '#7EE8A6' },
  { id: 'kaz', name: 'Kaz',   skin: '#F5C89A', shirt: '#E066FF', hat: '#4ADE80' },
  { id: 'june', name: 'June', skin: '#B5815A', shirt: '#8AB4F8', hat: '#FF9F40' },
];

// ---------- Minimap color for a tile ----------
function gqMiniColor(t) {
  const T = GQ_T;
  switch (t) {
    case T.GRASS: return '#4A8B3A';
    case T.FLOWERBED: return '#6EAA42';
    case T.PLANT: return '#5A9E3A';
    case T.SOIL: return '#8A6A3A';
    case T.PATH: return '#C9A769';
    case T.SIDEWALK: return '#B8B8B8';
    case T.STREET: return '#2A2A2A';
    case T.CROSSWALK: return '#E0E0E0';
    case T.ASH: return '#3B2F2A';
    case T.TREE: return '#1B5E20';
    case T.BUSH: return '#33691E';
    case T.ROCK: return '#546155';
    case T.BUILDING: return '#7B5E3A';
    case T.HOUSE: return '#A65B44';
    case T.HYDRANT: return '#C62828';
    case T.LAMPPOST: return '#888';
    case T.DEAD_TREE: return '#3B2A1A';
    case T.VOLCANO: return '#6B2310';
    case T.SKULL: return '#D9D1B0';
    case T.WATER: return '#3B78C4';
    case T.LAVA: return '#E2571C';
    case T.SHOP: return '#D97B3C';
    case T.PORTAL: return '#E066FF';
    case T.BUS_STOP: return '#FFCC00';
    default: return '#4A8B3A';
  }
}

Object.assign(window, {
  GQ_T, GQ_WATER_TILES, GQ_WALL_TILES,
  gqIsWalkable, gqIsWater, gqIsWall,
  gqBuildLevel, gqBuildLevel1, gqBuildLevel2, gqBuildLevel3,
  gqScatterGems, gqSpawnBonusGems,
  gqBuildCityNPCs, gqPickNpcTarget, gqBuildCityCars,
  GQ_CHARACTERS, gqMiniColor,
});
