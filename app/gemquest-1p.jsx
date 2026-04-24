// First-person renderer for GemQuest.
// Raycaster-lite: for each column, we cast into the tile grid, find the first
// wall, draw a vertical strip shaded by distance.
// Water/lava render as flush floor quads. Floor decor tiles overlay the ground.
// Gems, portal, NPCs and cars render as billboards.

const FP_FOV = Math.PI / 3;   // 60°
const FP_RES_W = 320;         // internal render width (columns)

const GQ_THEME_PAL = {
  forest:  { skyTop: '#87CEEB', skyBot: '#C8E6F5', grTop: '#4A8B3A', grBot: '#2F5E23', fogR: 135, fogG: 206, fogB: 235 },
  city:    { skyTop: '#8A9BAE', skyBot: '#C7D4DE', grTop: '#3A3A3A', grBot: '#1A1A1A', fogR: 160, fogG: 170, fogB: 180 },
  volcano: { skyTop: '#3A0806', skyBot: '#9A2A10', grTop: '#3B2F2A', grBot: '#1A0806', fogR: 220, fogG: 70,  fogB: 20  },
};

function gqWallColor(tile, side) {
  const T = window.GQ_T;
  switch (tile) {
    case T.TREE:      return side ? '#1B5E20' : '#2E7D32';
    case T.BUSH:      return side ? '#274F17' : '#3A7A22';
    case T.ROCK:      return side ? '#546155' : '#8AA492';
    case T.SHOP:      return side ? '#9F4F1C' : '#D97B3C';
    case T.BUILDING:  return side ? '#5A4428' : '#7B5E3A';
    case T.HOUSE:     return side ? '#7A3A26' : '#A65B44';
    case T.HYDRANT:   return side ? '#8A1B1B' : '#C62828';
    case T.LAMPPOST:  return side ? '#3A3A3A' : '#5D5D5D';
    case T.DEAD_TREE: return side ? '#2A1A10' : '#3B2A1A';
    case T.VOLCANO:   return side ? '#4A1710' : '#6B2310';
    case T.SKULL:     return side ? '#B0A888' : '#D9D1B0';
    default:          return '#888';
  }
}

function gqRender1P(ctx, W, H, world, camera, picked, levelNum, character, npcs, cars) {
  const tiles = world.tiles;
  const Gx = world.w, Gy = world.h;
  const T = window.GQ_T;
  const pal = GQ_THEME_PAL[world.theme] || GQ_THEME_PAL.forest;

  // Sky / ground
  const skyH = H / 2;
  const skyG = ctx.createLinearGradient(0, 0, 0, skyH);
  skyG.addColorStop(0, pal.skyTop); skyG.addColorStop(1, pal.skyBot);
  ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, skyH);

  const grG = ctx.createLinearGradient(0, skyH, 0, H);
  grG.addColorStop(0, pal.grTop); grG.addColorStop(1, pal.grBot);
  ctx.fillStyle = grG; ctx.fillRect(0, skyH, W, H - skyH);

  // Volcano ember sky
  if (world.theme === 'volcano') {
    const tNow = Date.now() / 1000;
    for (let i = 0; i < 20; i++) {
      const ex = ((i * 97 + tNow * 40) % W);
      const ey = (i * 53 % (skyH * 0.9));
      ctx.fillStyle = `rgba(255, ${120 + (i % 50)}, 40, ${0.4 + 0.3 * Math.sin(tNow + i)})`;
      ctx.fillRect(ex, ey, 2, 2);
    }
  }

  const cols = FP_RES_W;
  const colW = W / cols;
  const zbuf = new Array(cols).fill(Infinity);

  for (let i = 0; i < cols; i++) {
    const camX = 2 * (i / cols) - 1;
    const rdx = Math.cos(camera.angle) + (-Math.sin(camera.angle)) * camX * Math.tan(FP_FOV / 2);
    const rdy = Math.sin(camera.angle) + (Math.cos(camera.angle)) * camX * Math.tan(FP_FOV / 2);

    let mapX = Math.floor(camera.x);
    let mapY = Math.floor(camera.y);
    const deltaX = Math.abs(1 / rdx);
    const deltaY = Math.abs(1 / rdy);
    let stepX, stepY, sideX, sideY;
    if (rdx < 0) { stepX = -1; sideX = (camera.x - mapX) * deltaX; }
    else { stepX = 1; sideX = (mapX + 1 - camera.x) * deltaX; }
    if (rdy < 0) { stepY = -1; sideY = (camera.y - mapY) * deltaY; }
    else { stepY = 1; sideY = (mapY + 1 - camera.y) * deltaY; }

    let hit = 0, side = 0, dist = 0, tile = 0;
    let steps = 0;
    while (!hit && steps++ < 64) {
      if (sideX < sideY) { sideX += deltaX; mapX += stepX; side = 0; }
      else { sideY += deltaY; mapY += stepY; side = 1; }
      if (mapX < 0 || mapX >= Gx || mapY < 0 || mapY >= Gy) { hit = 1; dist = 50; tile = -1; break; }
      tile = tiles[mapY][mapX];
      if (window.gqIsWall(tile)) hit = 1;
    }

    if (hit && tile >= 0) {
      dist = side === 0 ? (sideX - deltaX) : (sideY - deltaY);
      if (dist < 0.1) dist = 0.1;
      const h = Math.min(H * 4, H / dist);
      const y0 = (H - h) / 2;

      const base = gqWallColor(tile, side);
      const fog = Math.max(0, Math.min(1, dist / 14));
      const fr = parseInt(base.slice(1, 3), 16);
      const fg = parseInt(base.slice(3, 5), 16);
      const fb = parseInt(base.slice(5, 7), 16);
      const r = Math.round(fr * (1 - fog) + pal.fogR * fog);
      const g = Math.round(fg * (1 - fog) + pal.fogG * fog);
      const b = Math.round(fb * (1 - fog) + pal.fogB * fog);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(i * colW, y0, colW + 1, h);

      if (tile === T.SHOP) {
        ctx.fillStyle = `rgba(255, 232, 156, ${0.9 * (1 - fog)})`;
        ctx.fillRect(i * colW, y0 + h * 0.18, colW + 1, h * 0.14);
      } else if (tile === T.BUILDING) {
        ctx.fillStyle = `rgba(255, 232, 110, ${0.45 * (1 - fog)})`;
        for (let w = 0; w < 3; w++) {
          ctx.fillRect(i * colW, y0 + h * (0.18 + w * 0.22), colW + 1, h * 0.07);
        }
      } else if (tile === T.HOUSE) {
        ctx.fillStyle = `rgba(60, 30, 10, ${0.7 * (1 - fog)})`;
        ctx.fillRect(i * colW, y0 + h * 0.58, colW + 1, h * 0.42);
      } else if (tile === T.VOLCANO) {
        ctx.fillStyle = `rgba(255, 120, 30, ${0.7 * (1 - fog)})`;
        ctx.fillRect(i * colW, y0 + h * 0.08, colW + 1, h * 0.1);
      } else if (tile === T.LAMPPOST) {
        ctx.fillStyle = `rgba(255, 232, 110, ${0.8 * (1 - fog)})`;
        ctx.fillRect(i * colW, y0 + h * 0.06, colW + 1, h * 0.06);
      }
      zbuf[i] = dist;
    }
  }

  // Floor quad projection
  const projectPoint = (wx, wy) => {
    const dx = wx - camera.x, dy = wy - camera.y;
    const cosA = Math.cos(-camera.angle), sinA = Math.sin(-camera.angle);
    const tx = dx * cosA - dy * sinA;
    const ty = dx * sinA + dy * cosA;
    return { tx, ty };
  };
  const tanF = Math.tan(FP_FOV / 2);

  const drawQuad = (x, y, fillStyle, maxDist = 14) => {
    const c = [
      projectPoint(x, y),
      projectPoint(x + 1, y),
      projectPoint(x + 1, y + 1),
      projectPoint(x, y + 1),
    ];
    if (c.every((p) => p.tx <= 0.25)) return null;
    if (c.some((p) => p.tx <= 0.25)) return null;
    const avgDist = (c[0].tx + c[1].tx + c[2].tx + c[3].tx) / 4;
    if (avgDist > maxDist) return null;
    const screenCol = Math.floor((W / 2 * (1 + ((c[0].ty + c[2].ty) / 2 / avgDist) / tanF)) / W * cols);
    if (screenCol >= 0 && screenCol < cols && avgDist > zbuf[screenCol] + 0.3) return null;
    const pts = c.map((p) => ({
      sx: (W / 2) * (1 + (p.ty / p.tx) / tanF),
      sy: H / 2 + H / (2 * p.tx),
    }));
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    ctx.lineTo(pts[1].sx, pts[1].sy);
    ctx.lineTo(pts[2].sx, pts[2].sy);
    ctx.lineTo(pts[3].sx, pts[3].sy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return { pts, avgDist };
  };

  // Floor decor (paths, sidewalks, streets, crosswalks, flowerbeds, plants, soil, bus stops)
  for (let y = 0; y < Gy; y++) for (let x = 0; x < Gx; x++) {
    const t = tiles[y][x];
    switch (t) {
      case T.PATH:      drawQuad(x, y, 'rgba(201, 167, 105, 0.6)'); break;
      case T.SIDEWALK:  drawQuad(x, y, 'rgba(200, 200, 200, 0.55)'); break;
      case T.STREET:    drawQuad(x, y, 'rgba(30, 30, 30, 0.65)'); break;
      case T.CROSSWALK: drawQuad(x, y, 'rgba(230, 230, 230, 0.8)'); break;
      case T.FLOWERBED: drawQuad(x, y, 'rgba(230, 130, 200, 0.55)'); break;
      case T.PLANT:     drawQuad(x, y, 'rgba(80, 170, 70, 0.55)'); break;
      case T.SOIL:      drawQuad(x, y, 'rgba(138, 106, 58, 0.55)'); break;
      case T.ASH:       drawQuad(x, y, 'rgba(80, 60, 50, 0.3)'); break;
      case T.BUS_STOP:  drawQuad(x, y, 'rgba(255, 204, 0, 0.75)'); break;
      default: break;
    }
  }

  // Water + Lava — render as flush ground quads with shimmer
  for (let y = 0; y < Gy; y++) for (let x = 0; x < Gx; x++) {
    const tile = tiles[y][x];
    const isWater = tile === T.WATER;
    const isLava = tile === T.LAVA;
    if (!isWater && !isLava) continue;

    const c = [
      projectPoint(x, y),
      projectPoint(x + 1, y),
      projectPoint(x + 1, y + 1),
      projectPoint(x, y + 1),
    ];
    if (c.every((p) => p.tx <= 0.25)) continue;
    if (c.some((p) => p.tx <= 0.25)) continue;
    const avgDist = (c[0].tx + c[1].tx + c[2].tx + c[3].tx) / 4;
    const screenCol = Math.floor((W / 2 * (1 + ((c[0].ty + c[2].ty) / 2 / avgDist) / tanF)) / W * cols);
    if (screenCol >= 0 && screenCol < cols && avgDist > zbuf[screenCol] + 0.5) continue;
    const pts = c.map((p) => ({
      sx: (W / 2) * (1 + (p.ty / p.tx) / tanF),
      sy: H / 2 + H / (2 * p.tx),
    }));
    ctx.save();
    const fog = Math.max(0, Math.min(1, avgDist / 14));
    const baseR = isLava ? 226 : 74;
    const baseG = isLava ? 87  : 144;
    const baseB = isLava ? 28  : 226;
    const r = Math.round(baseR * (1 - fog) + pal.fogR * fog);
    const g = Math.round(baseG * (1 - fog) + pal.fogG * fog);
    const b = Math.round(baseB * (1 - fog) + pal.fogB * fog);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    ctx.lineTo(pts[1].sx, pts[1].sy);
    ctx.lineTo(pts[2].sx, pts[2].sy);
    ctx.lineTo(pts[3].sx, pts[3].sy);
    ctx.closePath();
    ctx.fill();
    const tNow = Date.now() / (isLava ? 500 : 900);
    ctx.strokeStyle = isLava ? `rgba(255, 240, 120, ${0.6 * (1 - fog)})` : `rgba(220, 240, 255, ${0.55 * (1 - fog)})`;
    ctx.lineWidth = 1.4;
    for (let s = 0; s < 5; s++) {
      const phase = ((tNow + s * 0.23 + x * 0.11 + y * 0.17) % 1);
      const ax = pts[0].sx + (pts[3].sx - pts[0].sx) * phase;
      const ay = pts[0].sy + (pts[3].sy - pts[0].sy) * phase;
      const bx = pts[1].sx + (pts[2].sx - pts[1].sx) * phase;
      const by = pts[1].sy + (pts[2].sy - pts[1].sy) * phase;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    }
    ctx.strokeStyle = isLava ? `rgba(255, 180, 80, ${0.5 * (1 - fog)})` : `rgba(255, 255, 255, ${0.4 * (1 - fog)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    ctx.lineTo(pts[1].sx, pts[1].sy);
    ctx.lineTo(pts[2].sx, pts[2].sy);
    ctx.lineTo(pts[3].sx, pts[3].sy);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // Billboards: gems + portal + NPCs + cars
  const sprites = [];
  world.gems.forEach((g, i) => {
    const key = `l${levelNum}-${i}`;
    if (picked[key]) return;
    const dx = g.x + 0.5 - camera.x;
    const dy = g.y + 0.5 - camera.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 14) return;
    sprites.push({ type: 'gem', val: g.val, x: g.x, y: g.y, dx, dy, dist });
  });
  for (let y = 0; y < Gy; y++) for (let x = 0; x < Gx; x++) {
    if (tiles[y][x] !== T.PORTAL) continue;
    const dx = x + 0.5 - camera.x;
    const dy = y + 0.5 - camera.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 24) continue;
    sprites.push({ type: 'portal', x, y, dx, dy, dist });
  }
  (npcs || []).forEach((n) => {
    const dx = n.x - camera.x, dy = n.y - camera.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 14) return;
    sprites.push({ type: 'npc', color: n.color, hatColor: n.hatColor, dx, dy, dist });
  });
  (cars || []).forEach((car) => {
    const dx = car.x - camera.x, dy = car.y - camera.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 16) return;
    sprites.push({ type: 'car', color: car.color, dx, dy, dist });
  });
  sprites.sort((a, b) => b.dist - a.dist);

  for (const s of sprites) {
    const cosA = Math.cos(-camera.angle), sinA = Math.sin(-camera.angle);
    const tx = s.dx * cosA - s.dy * sinA;
    const ty = s.dx * sinA + s.dy * cosA;
    if (tx < 0.2) continue;
    const screenX = (W / 2) * (1 + (ty / tx) / Math.tan(FP_FOV / 2));
    const col = Math.floor((screenX / W) * cols);
    if (col < 0 || col >= cols || tx > zbuf[col]) continue;

    if (s.type === 'portal') {
      const size = Math.min(H * 1.4, (H * 1.1) / tx);
      const cy = H / 2;
      const now = Date.now() / 1000;
      ctx.save();
      const grad = ctx.createRadialGradient(screenX, cy, size * 0.05, screenX, cy, size * 0.55);
      grad.addColorStop(0, 'rgba(255,200,255,0.95)');
      grad.addColorStop(0.35, 'rgba(224,102,255,0.75)');
      grad.addColorStop(0.75, 'rgba(157,63,217,0.35)');
      grad.addColorStop(1, 'rgba(74,27,110,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(screenX, cy, size * 0.55, 0, Math.PI * 2); ctx.fill();
      for (let a = 0; a < 4; a++) {
        const ang = now * 1.6 + (a * Math.PI) / 2;
        ctx.strokeStyle = `rgba(255,255,255,${0.75 - a * 0.14})`;
        ctx.lineWidth = Math.max(2, size * 0.03);
        ctx.beginPath();
        ctx.arc(screenX, cy, size * (0.16 + a * 0.08), ang, ang + Math.PI * 0.9);
        ctx.stroke();
      }
      const core = ctx.createRadialGradient(screenX, cy, 0, screenX, cy, size * 0.14);
      core.addColorStop(0, '#1A0830');
      core.addColorStop(0.7, '#2C1B4A');
      core.addColorStop(1, 'rgba(44,27,74,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(screenX, cy, size * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.font = `900 ${Math.max(10, size * 0.08)}px "Bebas Neue", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,220,255,0.95)';
      ctx.shadowColor = '#E066FF';
      ctx.shadowBlur = size * 0.05;
      ctx.fillText('🌀 PORTAL', screenX, cy - size * 0.42);
      ctx.restore();
      continue;
    }

    if (s.type === 'gem') {
      const size = Math.min(H, (H * 0.5) / tx);
      const y = H / 2 - size / 2 + Math.sin(Date.now() / 400 + s.x + s.y) * 3;
      const color = s.val >= 5 ? '#E066FF' : s.val >= 3 ? '#FFCC00' : s.val >= 2 ? '#5FE8D4' : '#7EE8A6';
      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 0.3;
      ctx.beginPath();
      ctx.moveTo(screenX, y);
      ctx.lineTo(screenX + size / 2, y + size / 2);
      ctx.lineTo(screenX, y + size);
      ctx.lineTo(screenX - size / 2, y + size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.moveTo(screenX - size * 0.15, y + size * 0.2);
      ctx.lineTo(screenX + size * 0.1, y + size * 0.15);
      ctx.lineTo(screenX, y + size * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (s.type === 'npc') {
      const size = Math.min(H * 1.0, (H * 0.65) / tx);
      const top = H / 2 - size * 0.15;
      ctx.save();
      // body
      ctx.fillStyle = s.color;
      ctx.fillRect(screenX - size * 0.18, top + size * 0.25, size * 0.36, size * 0.5);
      // head
      ctx.fillStyle = '#F5C89A';
      ctx.beginPath(); ctx.arc(screenX, top + size * 0.15, size * 0.16, 0, Math.PI * 2); ctx.fill();
      // hat
      ctx.fillStyle = s.hatColor || '#FFCC00';
      ctx.beginPath();
      ctx.arc(screenX, top + size * 0.1, size * 0.18, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      // legs
      ctx.fillStyle = '#2a1a10';
      ctx.fillRect(screenX - size * 0.15, top + size * 0.72, size * 0.12, size * 0.22);
      ctx.fillRect(screenX + size * 0.03, top + size * 0.72, size * 0.12, size * 0.22);
      ctx.restore();
      continue;
    }

    if (s.type === 'car') {
      const size = Math.min(H * 1.3, (H * 0.85) / tx);
      const top = H / 2 + size * 0.05;
      ctx.save();
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(screenX, top + size * 0.5, size * 0.5, size * 0.1, 0, 0, Math.PI * 2); ctx.fill();
      // body
      ctx.fillStyle = s.color;
      ctx.fillRect(screenX - size * 0.42, top, size * 0.84, size * 0.4);
      // roof
      ctx.fillStyle = s.color;
      ctx.fillRect(screenX - size * 0.28, top - size * 0.22, size * 0.56, size * 0.24);
      // windows
      ctx.fillStyle = 'rgba(180, 220, 255, 0.85)';
      ctx.fillRect(screenX - size * 0.25, top - size * 0.18, size * 0.5, size * 0.18);
      // wheels
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(screenX - size * 0.3, top + size * 0.4, size * 0.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(screenX + size * 0.3, top + size * 0.4, size * 0.08, 0, Math.PI * 2); ctx.fill();
      // headlights (if front-facing)
      ctx.fillStyle = 'rgba(255, 240, 180, 0.9)';
      ctx.fillRect(screenX - size * 0.4, top + size * 0.08, size * 0.06, size * 0.05);
      ctx.fillRect(screenX + size * 0.34, top + size * 0.08, size * 0.06, size * 0.05);
      ctx.restore();
      continue;
    }
  }
}

function Gq1PView({ world, camera, picked, levelNum, moving, character, npcs, cars }) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    resize();
    const onR = () => resize();
    window.addEventListener('resize', onR);
    const render = () => {
      gqRender1P(ctx, canvas.width, canvas.height, world, camera, picked, levelNum, character, npcs, cars);
      rafRef.current = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', onR); };
  }, [world, camera, picked, levelNum, character, npcs, cars]);

  const shirt = (character && character.shirt) || '#FF6B6B';
  const skin = (character && character.skin) || '#F5C89A';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated' }} />
      {/* Reticle */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 18, height: 18, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 8, top: 0, width: 2, height: 6, background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 2px rgba(0,0,0,0.8)' }} />
        <div style={{ position: 'absolute', left: 8, bottom: 0, width: 2, height: 6, background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 2px rgba(0,0,0,0.8)' }} />
        <div style={{ position: 'absolute', top: 8, left: 0, height: 2, width: 6, background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 2px rgba(0,0,0,0.8)' }} />
        <div style={{ position: 'absolute', top: 8, right: 0, height: 2, width: 6, background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 2px rgba(0,0,0,0.8)' }} />
      </div>
      {/* Hand — skin & sleeve colors follow selected character */}
      <div style={{
        position: 'absolute', bottom: -20, right: '18%',
        width: 200, height: 240,
        transform: `translateY(${moving ? Math.sin(Date.now() / 120) * 8 : 0}px) rotate(-18deg)`,
        pointerEvents: 'none', zIndex: 5,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 40% 30%, ${skin} 0%, ${skin} 60%, #C99967 100%)`,
          borderRadius: '60% 60% 30% 30%',
          border: '3px solid #2a1010',
          boxShadow: 'inset -20px -40px 40px rgba(0,0,0,0.3)',
        }} />
        <div style={{
          position: 'absolute', bottom: -10, left: 20, right: 20, height: 60,
          background: `linear-gradient(180deg, ${shirt} 0%, #2a1010 130%)`,
          border: '3px solid #2a1010', borderRadius: '30% 30% 10% 10%',
        }} />
      </div>
      {/* Minimap */}
      <div style={{
        position: 'absolute', bottom: 14, left: 14,
        width: 200, height: 140,
        background: 'rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.4)',
        borderRadius: 6, padding: 4,
      }}>
        <svg viewBox={`0 0 ${world.w} ${world.h}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
          {world.tiles.map((row, y) => row.map((t, x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={window.gqMiniColor(t)} />
          )))}
          {world.gems.map((g, i) => {
            const key = `l${levelNum}-${i}`;
            if (picked[key]) return null;
            return <circle key={i} cx={g.x + 0.5} cy={g.y + 0.5} r={0.3} fill="#FFE66D" />;
          })}
          {(cars || []).map((c, i) => (
            <rect key={`c${i}`} x={c.x - 0.25} y={c.y - 0.15} width={0.5} height={0.3} fill={c.color} />
          ))}
          {(npcs || []).map((n, i) => (
            <circle key={`n${i}`} cx={n.x} cy={n.y} r={0.3} fill={n.color} stroke="#222" strokeWidth={0.08} />
          ))}
          <circle cx={camera.x} cy={camera.y} r={0.5} fill={shirt} stroke="white" strokeWidth={0.12} />
          <line x1={camera.x} y1={camera.y}
            x2={camera.x + Math.cos(camera.angle) * 1.1}
            y2={camera.y + Math.sin(camera.angle) * 1.1}
            stroke="white" strokeWidth={0.18} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', top: 2, right: 6, fontSize: 10, color: 'white', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: 1, textShadow: '1px 1px 1px rgba(0,0,0,0.8)' }}>
          L{world.level} · {world.theme.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Gq1PView, gqRender1P, GQ_THEME_PAL });
