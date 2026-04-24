// First-person renderer for GemQuest.
// Raycaster-lite: for each column, we cast into the tile grid, find the first
// wall (tree/rock/water/shop/portal), draw a vertical strip shaded by distance.
// Then overlay billboards for gems.

const FP_FOV = Math.PI / 3;   // 60°
const FP_RES_W = 320;         // internal render width (columns)

function gqRender1P(ctx, W, H, world, camera, picked, inPortal) {
  const tiles = world.tiles;
  const Gx = window.GQ_GRID_W, Gy = window.GQ_GRID_H;
  const T = window.GQ_T;

  // Sky / ground
  const skyH = H / 2;
  const skyG = ctx.createLinearGradient(0, 0, 0, skyH);
  if (inPortal) { skyG.addColorStop(0, '#2C1B4A'); skyG.addColorStop(1, '#6B3FA0'); }
  else { skyG.addColorStop(0, '#87CEEB'); skyG.addColorStop(1, '#C8E6F5'); }
  ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, skyH);

  const grG = ctx.createLinearGradient(0, skyH, 0, H);
  if (inPortal) { grG.addColorStop(0, '#4A1B6E'); grG.addColorStop(1, '#1A0830'); }
  else { grG.addColorStop(0, '#4A8B3A'); grG.addColorStop(1, '#2F5E23'); }
  ctx.fillStyle = grG; ctx.fillRect(0, skyH, W, H - skyH);

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
    while (!hit && steps++ < 40) {
      if (sideX < sideY) { sideX += deltaX; mapX += stepX; side = 0; }
      else { sideY += deltaY; mapY += stepY; side = 1; }
      if (mapX < 0 || mapX >= Gx || mapY < 0 || mapY >= Gy) { hit = 1; dist = 25; tile = -1; break; }
      tile = tiles[mapY][mapX];
      if (tile === T.TREE || tile === T.ROCK || tile === T.SHOP) hit = 1;
    }

    if (hit && tile >= 0) {
      dist = side === 0 ? (sideX - deltaX) : (sideY - deltaY);
      if (dist < 0.1) dist = 0.1;
      const h = Math.min(H, H / dist);
      const y0 = (H - h) / 2;

      let color;
      if (tile === T.TREE) color = side === 0 ? '#2E7D32' : '#1B5E20';
      else if (tile === T.ROCK) color = side === 0 ? '#8AA492' : '#546155';
      else if (tile === T.SHOP) color = side === 0 ? '#D97B3C' : '#9F4F1C';
      else color = '#888';

      // Fog
      const fog = Math.max(0, Math.min(1, dist / 12));
      const fr = parseInt(color.slice(1,3),16), fg = parseInt(color.slice(3,5),16), fb = parseInt(color.slice(5,7),16);
      const fogR = inPortal ? 44 : 135, fogG = inPortal ? 27 : 206, fogB = inPortal ? 74 : 235;
      const r = Math.round(fr * (1 - fog) + fogR * fog);
      const g = Math.round(fg * (1 - fog) + fogG * fog);
      const b = Math.round(fb * (1 - fog) + fogB * fog);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(i * colW, y0, colW + 1, h);

      // Shop marker — draw a yellow sign band near top of the wall
      if (tile === T.SHOP) {
        ctx.fillStyle = `rgba(255, 232, 156, ${0.9 * (1 - fog)})`;
        ctx.fillRect(i * colW, y0 + h * 0.18, colW + 1, h * 0.14);
      }
      zbuf[i] = dist;
    }
  }

  // Water pools — render as floor quads between walls and sky/ground
  const projectPoint = (wx, wy) => {
    const dx = wx - camera.x, dy = wy - camera.y;
    const cosA = Math.cos(-camera.angle), sinA = Math.sin(-camera.angle);
    const ptx = dx * cosA - dy * sinA;
    const pty = dx * sinA + dy * cosA;
    return { tx: ptx, ty: pty };
  };
  const tanF = Math.tan(FP_FOV / 2);
  for (let y = 0; y < Gy; y++) for (let x = 0; x < Gx; x++) {
    if (tiles[y][x] !== T.WATER) continue;
    const c = [
      projectPoint(x, y),
      projectPoint(x + 1, y),
      projectPoint(x + 1, y + 1),
      projectPoint(x, y + 1),
    ];
    if (c.every((p) => p.tx <= 0.25)) continue;
    if (c.some((p) => p.tx <= 0.25)) continue;
    const avgDist = (c[0].tx + c[1].tx + c[2].tx + c[3].tx) / 4;
    const col = Math.floor((W / 2 * (1 + ((c[0].ty + c[2].ty)/2 / avgDist) / tanF)) / W * cols);
    if (col >= 0 && col < cols && avgDist > zbuf[col] + 0.5) continue;
    const pts = c.map((p) => ({
      sx: (W / 2) * (1 + (p.ty / p.tx) / tanF),
      sy: H / 2 + H / (2 * p.tx),
    }));
    ctx.save();
    const fog = Math.max(0, Math.min(1, avgDist / 12));
    const baseR = inPortal ? 90 : 74, baseG = inPortal ? 60 : 144, baseB = inPortal ? 130 : 226;
    const fogR = inPortal ? 44 : 80, fogG = inPortal ? 27 : 160, fogB = inPortal ? 74 : 200;
    const r = Math.round(baseR * (1 - fog) + fogR * fog);
    const g = Math.round(baseG * (1 - fog) + fogG * fog);
    const b = Math.round(baseB * (1 - fog) + fogB * fog);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    ctx.lineTo(pts[1].sx, pts[1].sy);
    ctx.lineTo(pts[2].sx, pts[2].sy);
    ctx.lineTo(pts[3].sx, pts[3].sy);
    ctx.closePath();
    ctx.fill();
    // Shimmer bands — drifting highlights across the pool
    const tNow = Date.now() / 900;
    ctx.strokeStyle = `rgba(220, 240, 255, ${0.55 * (1 - fog)})`;
    ctx.lineWidth = 1.4;
    for (let s = 0; s < 5; s++) {
      const phase = ((tNow + s * 0.23 + x * 0.11 + y * 0.17) % 1);
      const ax = pts[0].sx + (pts[3].sx - pts[0].sx) * phase;
      const ay = pts[0].sy + (pts[3].sy - pts[0].sy) * phase;
      const bx = pts[1].sx + (pts[2].sx - pts[1].sx) * phase;
      const by = pts[1].sy + (pts[2].sy - pts[1].sy) * phase;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    // Rim highlight — brighter edge around the pool
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - fog)})`;
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

  // Billboards — gems + portals
  const sprites = [];
  world.gems.forEach((g, i) => {
    const key = `${inPortal ? 'p' : 'm'}-${i}`;
    if (picked[key]) return;
    const dx = g.x + 0.5 - camera.x;
    const dy = g.y + 0.5 - camera.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 12) return;
    sprites.push({ type: 'gem', val: g.val, x: g.x, y: g.y, dx, dy, dist });
  });
  for (let y = 0; y < Gy; y++) for (let x = 0; x < Gx; x++) {
    if (tiles[y][x] !== T.PORTAL) continue;
    const dx = x + 0.5 - camera.x;
    const dy = y + 0.5 - camera.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 20) continue;
    sprites.push({ type: 'portal', x, y, dx, dy, dist });
  }
  sprites.sort((a, b) => b.dist - a.dist);

  for (const s of sprites) {
    // Transform to camera space
    const cosA = Math.cos(-camera.angle), sinA = Math.sin(-camera.angle);
    const tx = s.dx * cosA - s.dy * sinA;
    const ty = s.dx * sinA + s.dy * cosA;
    if (tx < 0.2) continue; // behind
    const screenX = (W / 2) * (1 + (ty / tx) / Math.tan(FP_FOV / 2));
    const col = Math.floor((screenX / W) * cols);
    if (col < 0 || col >= cols || tx > zbuf[col]) continue;

    if (s.type === 'portal') {
      const size = Math.min(H * 1.4, (H * 1.1) / tx);
      const cy = H / 2;
      const now = Date.now() / 1000;
      ctx.save();
      // Outer halo
      const grad = ctx.createRadialGradient(screenX, cy, size * 0.05, screenX, cy, size * 0.55);
      grad.addColorStop(0, 'rgba(255,200,255,0.95)');
      grad.addColorStop(0.35, 'rgba(224,102,255,0.75)');
      grad.addColorStop(0.75, 'rgba(157,63,217,0.35)');
      grad.addColorStop(1, 'rgba(74,27,110,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(screenX, cy, size * 0.55, 0, Math.PI * 2); ctx.fill();
      // Rotating spiral arcs
      for (let a = 0; a < 4; a++) {
        const ang = now * 1.6 + (a * Math.PI) / 2;
        ctx.strokeStyle = `rgba(255,255,255,${0.75 - a * 0.14})`;
        ctx.lineWidth = Math.max(2, size * 0.03);
        ctx.beginPath();
        ctx.arc(screenX, cy, size * (0.16 + a * 0.08), ang, ang + Math.PI * 0.9);
        ctx.stroke();
      }
      // Dark vortex core
      const core = ctx.createRadialGradient(screenX, cy, 0, screenX, cy, size * 0.14);
      core.addColorStop(0, '#1A0830');
      core.addColorStop(0.7, '#2C1B4A');
      core.addColorStop(1, 'rgba(44,27,74,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(screenX, cy, size * 0.14, 0, Math.PI * 2); ctx.fill();
      // "PORTAL" label floating above
      ctx.font = `900 ${Math.max(10, size * 0.08)}px "Bebas Neue", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,220,255,0.95)';
      ctx.shadowColor = '#E066FF';
      ctx.shadowBlur = size * 0.05;
      ctx.fillText('🌀 PORTAL', screenX, cy - size * 0.42);
      ctx.restore();
      continue;
    }

    // Gem diamond
    const size = Math.min(H, (H * 0.5) / tx);
    const y = H / 2 - size / 2 + Math.sin(Date.now() / 400 + s.x + s.y) * 3;
    const color = s.val >= 5 ? '#E066FF' : s.val >= 3 ? '#FFCC00' : s.val >= 2 ? '#5FE8D4' : '#7EE8A6';
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 0.3;
    ctx.beginPath();
    ctx.moveTo(screenX, y);
    ctx.lineTo(screenX + size/2, y + size/2);
    ctx.lineTo(screenX, y + size);
    ctx.lineTo(screenX - size/2, y + size/2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(screenX - size*0.15, y + size*0.2);
    ctx.lineTo(screenX + size*0.1, y + size*0.15);
    ctx.lineTo(screenX, y + size*0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function Gq1PView({ world, camera, picked, inPortal, moving }) {
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
      gqRender1P(ctx, canvas.width, canvas.height, world, camera, picked, inPortal);
      rafRef.current = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', onR); };
  }, [world, camera, picked, inPortal]);

  // Hand sprite (bobs while moving)
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
      {/* Hand */}
      <div style={{
        position: 'absolute', bottom: -20, right: '18%',
        width: 200, height: 240,
        transform: `translateY(${moving ? Math.sin(Date.now()/120)*8 : 0}px) rotate(-18deg)`,
        pointerEvents: 'none', zIndex: 5,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 40% 30%, #FFE0C2 0%, #F5C89A 60%, #C99967 100%)',
          borderRadius: '60% 60% 30% 30%',
          border: '3px solid #2a1010',
          boxShadow: 'inset -20px -40px 40px rgba(0,0,0,0.3)',
        }} />
        {/* sleeve */}
        <div style={{
          position: 'absolute', bottom: -10, left: 20, right: 20, height: 60,
          background: 'linear-gradient(180deg, #FF6B6B 0%, #C73E3E 100%)',
          border: '3px solid #2a1010', borderRadius: '30% 30% 10% 10%',
        }} />
      </div>
      {/* Minimap */}
      <div style={{
        position: 'absolute', bottom: 14, left: 14,
        width: 180, height: 112,
        background: 'rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.4)',
        borderRadius: 6, padding: 4,
      }}>
        <svg viewBox={`0 0 ${window.GQ_GRID_W} ${window.GQ_GRID_H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
          {world.tiles.map((row, y) => row.map((t, x) => {
            const c = t === window.GQ_T.TREE ? '#1B5E20' :
                      t === window.GQ_T.ROCK ? '#546155' :
                      t === window.GQ_T.WATER ? '#3B78C4' :
                      t === window.GQ_T.PATH ? '#C9A769' :
                      t === window.GQ_T.SHOP ? '#D97B3C' :
                      t === window.GQ_T.PORTAL ? '#E066FF' : '#4A8B3A';
            return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={c} />;
          }))}
          {world.gems.map((g, i) => {
            const key = `${inPortal ? 'p' : 'm'}-${i}`;
            if (picked[key]) return null;
            return <circle key={i} cx={g.x + 0.5} cy={g.y + 0.5} r={0.25} fill="#FFE66D" />;
          })}
          {/* player */}
          <circle cx={camera.x} cy={camera.y} r={0.4} fill="#FF6B6B" stroke="white" strokeWidth={0.1} />
          <line x1={camera.x} y1={camera.y}
            x2={camera.x + Math.cos(camera.angle) * 0.9}
            y2={camera.y + Math.sin(camera.angle) * 0.9}
            stroke="white" strokeWidth={0.15} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

Object.assign(window, { Gq1PView });
