// GemQuest main — FIRST PERSON version.
// Raycasting render. W/S forward/back · A/D strafe · ←/→ turn · J jeopardy

function GemQuest({ onHome }) {
  const [worldState, setWorldState] = React.useState(() => window.gqBuildWorld());
  const [portalState, setPortalState] = React.useState(null);
  const [inPortal, setInPortal] = React.useState(false);
  const [camera, setCamera] = React.useState({ x: 1.5, y: 1.5, angle: 0 });
  const [moving, setMoving] = React.useState(false);
  const [energy, setEnergy] = React.useState(800);
  const [gems, setGems] = React.useState(0);
  const [bananas, setBananas] = React.useState(0);
  const [portalUnlocked, setPortalUnlocked] = React.useState(false);
  const [portalsUsed, setPortalsUsed] = React.useState(0);
  const [mode, setMode] = React.useState('play');
  const [wagerAmount, setWagerAmount] = React.useState(0);
  const [toast, setToast] = React.useState(null);
  const [picked, setPicked] = React.useState({});
  const [flash, setFlash] = React.useState(null);
  const [gemMilestone, setGemMilestone] = React.useState(10);
  const keysRef = React.useRef({});

  const showToast = (text, color = '#FFCC00') => {
    setToast({ text, color, key: Date.now() });
    setTimeout(() => setToast((t) => (t && t.text === text ? null : t)), 1800);
  };

  React.useEffect(() => {
    if (energy <= 0 && mode === 'play') { setMode('lost'); window.MQ_SOUND.play('buzz'); }
  }, [energy, mode]);
  React.useEffect(() => {
    if (bananas >= 10) { setMode('won'); window.MQ_SOUND.play('final'); }
  }, [bananas]);

  React.useEffect(() => {
    if (mode === 'play' && gems >= gemMilestone) setMode('freequiz');
  }, [gems, mode, gemMilestone]);

  React.useEffect(() => {
    if (gems >= 50 && !portalUnlocked) {
      setPortalUnlocked(true);
      window.MQ_SOUND.play('ddopen');
      showToast('🌀 PORTAL OPEN!', '#E066FF');
      setWorldState((ws) => {
        const tiles = ws.tiles.map((r) => r.slice());
        tiles[ws.portalSpot.y][ws.portalSpot.x] = window.GQ_T.PORTAL;
        return { ...ws, tiles };
      });
    }
  }, [gems, portalUnlocked]);

  const world = inPortal ? portalState : worldState;

  const enterPortal = () => {
    window.MQ_SOUND.play('ddopen');
    setPortalState(window.gqBuildPortalWorld(portalsUsed));
    setInPortal(true);
    setCamera({ x: 1.5, y: 1.5, angle: 0 });
    setPortalsUsed((n) => n + 1);
    showToast('🌀 Portal realm!', '#E066FF');
    setPortalUnlocked(false);
    setWorldState((ws) => {
      const tiles = ws.tiles.map((r) => r.slice());
      tiles[ws.portalSpot.y][ws.portalSpot.x] = window.GQ_T.PATH;
      return { ...ws, tiles };
    });
  };

  const exitPortal = () => {
    setInPortal(false);
    setCamera({ x: 13.5, y: 3.5, angle: Math.PI });
    showToast('Back to main world!', '#7EE8A6');
  };

  React.useEffect(() => {
    if (!inPortal || !portalState) return;
    const total = portalState.gems.length;
    const pickedCount = Object.keys(picked).filter((k) => k.startsWith('p-') && picked[k]).length;
    if (pickedCount >= total) {
      const t = setTimeout(exitPortal, 900);
      return () => clearTimeout(t);
    }
  }, [picked, inPortal, portalState]);

  // Movement loop
  React.useEffect(() => {
    if (mode !== 'play') return;
    let raf;
    let last = performance.now();
    let energyAccum = 0;
    const T = window.GQ_T;
    const Gx = window.GQ_GRID_W, Gy = window.GQ_GRID_H;

    const isBlocked = (x, y) => {
      const mx = Math.floor(x), my = Math.floor(y);
      if (mx < 0 || my < 0 || mx >= Gx || my >= Gy) return true;
      const t = world.tiles[my][mx];
      return !window.gqIsWalkable(t) && t !== T.PORTAL && t !== T.SHOP;
    };

    const step = (now) => {
      const dt = Math.min(50, now - last); last = now;
      const keys = keysRef.current;
      const moveSpeed = 0.0035;
      const turnSpeed = 0.0028;
      let dx = 0, dy = 0, dA = 0;
      const fwd = (keys['w'] || keys['arrowup']) ? 1 : 0;
      const back = (keys['s'] || keys['arrowdown']) ? 1 : 0;
      const left = keys['a'] ? 1 : 0;
      const right = keys['d'] ? 1 : 0;
      const turnL = keys['arrowleft'] || keys['q'] ? 1 : 0;
      const turnR = keys['arrowright'] || keys['e'] ? 1 : 0;
      dA = (turnR - turnL) * turnSpeed * dt;

      let isMoving = false;
      setCamera((c) => {
        let na = c.angle + dA;
        const fx = Math.cos(na), fy = Math.sin(na);
        const sx = -Math.sin(na), sy = Math.cos(na);
        const mv = moveSpeed * dt;
        let nx = c.x + (fx * (fwd - back) + sx * (right - left)) * mv;
        let ny = c.y + (fy * (fwd - back) + sy * (right - left)) * mv;
        if (fwd || back || left || right) isMoving = true;
        // Clamp with collision (separate axes)
        const pad = 0.25;
        const candidateX = c.x + (fx * (fwd - back) + sx * (right - left)) * mv;
        const candidateY = c.y + (fy * (fwd - back) + sy * (right - left)) * mv;
        if (isBlocked(candidateX + Math.sign(candidateX - c.x) * pad, c.y)) nx = c.x;
        if (isBlocked(c.x, candidateY + Math.sign(candidateY - c.y) * pad)) ny = c.y;

        // Check portal/shop entry
        const mx = Math.floor(nx), my = Math.floor(ny);
        const tile = world.tiles[my] && world.tiles[my][mx];
        if (tile === T.PORTAL && !inPortal) { setTimeout(enterPortal, 0); return c; }
        if (tile === T.SHOP) { setTimeout(() => setMode('shop'), 0); return { ...c, x: nx, y: ny, angle: na }; }

        // Gem pickup
        world.gems.forEach((g, i) => {
          const key = `${inPortal ? 'p' : 'm'}-${i}`;
          if (picked[key]) return;
          const ddx = g.x + 0.5 - nx, ddy = g.y + 0.5 - ny;
          if (ddx*ddx + ddy*ddy < 0.35) {
            setGems((gg) => gg + g.val);
            setPicked((p) => ({ ...p, [key]: true }));
            window.MQ_SOUND.play('tick');
            setFlash('gem'); setTimeout(() => setFlash(null), 250);
          }
        });

        return { x: nx, y: ny, angle: na };
      });

      setMoving(isMoving);

      // Energy drain per movement
      if (fwd || back || left || right) {
        energyAccum += dt * 0.015;
        if (energyAccum >= 1) {
          const whole = Math.floor(energyAccum);
          energyAccum -= whole;
          setEnergy((e) => Math.max(0, e - whole));
        }
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mode, world, inPortal, picked]);

  // Key handlers
  React.useEffect(() => {
    const down = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key.toLowerCase() === 'j' && mode === 'play') { e.preventDefault(); openWager(); }
    };
    const up = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [mode]);

  const openWager = () => {
    if (mode !== 'play') return;
    if (energy < 500) { showToast('Need ⚡500+ to wager', '#FF6B6B'); return; }
    setMode('wager');
  };
  const onWagerGo = (amt) => { setWagerAmount(amt); setMode('quiz'); };
  const onQuizResult = (correct) => {
    if (correct) {
      setEnergy((e) => e + wagerAmount);
      setFlash('energy-up'); setTimeout(() => setFlash(null), 600);
      showToast(`+${wagerAmount} ⚡ NICE!`, '#4ADE80');
    } else {
      setEnergy((e) => Math.max(0, e - wagerAmount));
      setFlash('energy-down'); setTimeout(() => setFlash(null), 600);
      showToast(`−${wagerAmount} ⚡ oof`, '#FF6B6B');
    }
    if (inPortal) setPortalState((ws) => ws && window.gqSpawnGems(ws, picked, 10, camera, true));
    else setWorldState((ws) => window.gqSpawnGems(ws, picked, 10, camera, false));
    setTimeout(() => showToast('💎 +10 gems scattered!', '#7EE8A6'), 900);
    setMode('play');
  };

  const onFreeQuizResult = (correct) => {
    showToast(correct ? '✓ Nice math!' : '✗ Keep practicing!', correct ? '#4ADE80' : '#FF6B6B');
    setGemMilestone((m) => Math.max(m + 10, Math.floor(gems / 10) * 10 + 10));
    setMode('play');
  };

  const buyBanana = () => {
    if (gems < 100) return;
    setGems((g) => g - 100);
    setBananas((b) => b + 1);
    window.MQ_SOUND.play('ding');
    showToast('🍌 +1 banana!', '#FFCC00');
  };

  const reset = () => {
    setWorldState(window.gqBuildWorld());
    setPortalState(null); setInPortal(false);
    setCamera({ x: 1.5, y: 1.5, angle: 0 });
    setEnergy(800); setGems(0); setBananas(0);
    setPortalUnlocked(false); setPortalsUsed(0);
    setMode('play'); setPicked({}); setToast(null);
    setGemMilestone(10);
  };

  // Nudge player away from shop after closing so they don't re-trigger
  const closeShop = () => {
    setCamera((c) => ({ ...c, x: c.x + Math.cos(c.angle + Math.PI) * 0.6, y: c.y + Math.sin(c.angle + Math.PI) * 0.6 }));
    setMode('play');
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden', fontFamily: '"Patrick Hand", "Comic Sans MS", sans-serif' }}>
      {/* First-person view */}
      <window.Gq1PView world={world} camera={camera} picked={picked} inPortal={inPortal} moving={moving} />

      {/* HUD top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)', zIndex: 30 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onHome} style={{ background: 'rgba(0,0,0,0.5)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: '"Fredoka One", sans-serif', fontSize: 13, letterSpacing: 1 }}>◀ Menu</button>
          <Stat icon="⚡" value={energy} color="#FFE66D" flash={flash === 'energy-up' ? '#4ADE80' : flash === 'energy-down' ? '#FF6B6B' : null} label="energy" />
          <Stat icon="💎" value={gems} color="#7EE8A6" flash={flash === 'gem' ? '#7EE8A6' : null} label={`gems · next portal at ${Math.max(0, 50 - gems)}`} />
          <Stat icon="🍌" value={`${bananas}/10`} color="#FFE66D" label="bananas (10 to win)" />
        </div>
        <button onClick={openWager} disabled={energy < 500 || mode !== 'play'} style={{
          background: energy >= 500 ? 'linear-gradient(180deg, #FFD93D 0%, #E8B800 100%)' : 'rgba(255,255,255,0.2)',
          color: energy >= 500 ? '#060647' : 'rgba(255,255,255,0.5)',
          border: '2px solid ' + (energy >= 500 ? '#FFCC00' : 'rgba(255,255,255,0.3)'),
          padding: '10px 16px', borderRadius: 10, cursor: energy >= 500 ? 'pointer' : 'not-allowed',
          fontFamily: '"Bebas Neue", sans-serif', fontSize: 16, letterSpacing: 2, fontWeight: 900,
          boxShadow: energy >= 500 ? '0 4px 0 #8a6600, 0 0 20px rgba(255,204,0,0.5)' : 'none',
          animation: energy >= 500 && mode === 'play' ? 'gq-pulse-soft 2s ease-in-out infinite' : 'none',
        }}>🎯 JEOPARDY! [J]</button>
      </div>

      {inPortal && (
        <div style={{ position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)', fontFamily: '"Fredoka One", sans-serif', color: '#E066FF', fontSize: 18, letterSpacing: 2, textShadow: '2px 2px 0 rgba(0,0,0,0.8)', zIndex: 30 }}>🌀 PORTAL REALM 🌀</div>
      )}

      {/* Footer hint */}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.95)', fontSize: 13, textShadow: '1px 1px 2px rgba(0,0,0,0.9)', zIndex: 30, background: 'rgba(0,0,0,0.45)', padding: '6px 14px', borderRadius: 20 }}>
        <kbd style={kbd}>W</kbd><kbd style={kbd}>A</kbd><kbd style={kbd}>S</kbd><kbd style={kbd}>D</kbd> move &nbsp;·&nbsp; <kbd style={kbd}>←</kbd><kbd style={kbd}>→</kbd> turn &nbsp;·&nbsp; <kbd style={kbd}>J</kbd> jeopardy
      </div>

      {toast && (
        <div key={toast.key} style={{
          position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', color: toast.color, padding: '10px 22px', borderRadius: 20,
          fontFamily: '"Fredoka One", sans-serif', fontSize: 18, letterSpacing: 1, zIndex: 90,
          border: `2px solid ${toast.color}`, animation: 'gq-pop .3s cubic-bezier(.3,1.6,.5,1)',
          boxShadow: `0 0 20px ${toast.color}66`,
        }}>{toast.text}</div>
      )}

      {mode === 'wager' && <window.GQWagerPicker maxEnergy={energy} onGo={onWagerGo} onCancel={() => setMode('play')} />}
      {mode === 'quiz' && <window.GQMCQuiz wager={wagerAmount} onResult={onQuizResult} />}
      {mode === 'freequiz' && <window.GQMCQuiz freebie onResult={onFreeQuizResult} />}
      {mode === 'shop' && <window.GQShop gems={gems} bananas={bananas} onBuy={buyBanana} onClose={closeShop} />}
      {(mode === 'won' || mode === 'lost') && <window.GQGameOver won={mode === 'won'} gems={gems} bananas={bananas} onReset={reset} onHome={onHome} />}
    </div>
  );
}

function Stat({ icon, value, color, flash, label }) {
  return (
    <div title={label} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: 10,
      border: `2px solid ${flash || 'rgba(255,255,255,0.15)'}`,
      color: 'white', transition: 'border-color .2s',
      boxShadow: flash ? `0 0 16px ${flash}88` : 'none',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 18, color, letterSpacing: 0.5 }}>{value}</span>
    </div>
  );
}

const kbd = { background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, border: '1px solid rgba(255,255,255,0.3)', margin: '0 2px' };

Object.assign(window, { GemQuest });
