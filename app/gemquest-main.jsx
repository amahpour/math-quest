// GemQuest main — FIRST PERSON multi-level adventure.
// Levels: 1 Forest → 2 City → 3 Volcano → WIN.
// W/S forward/back · A/D strafe · ←/→ turn · J jeopardy · SPACE climb out of water

function gqMakeLevel(n) {
  const base = window.gqBuildLevel(n);
  return window.gqScatterGems(base, n * 131 + 5);
}

function GemQuest({ onHome }) {
  const [character, setCharacter] = React.useState(null);
  const [levelNum, setLevelNum] = React.useState(1);
  const [world, setWorld] = React.useState(() => gqMakeLevel(1));
  const [camera, setCamera] = React.useState(() => ({ ...world.start }));
  const [moving, setMoving] = React.useState(false);
  const [energy, setEnergy] = React.useState(3000);
  const [gems, setGems] = React.useState(0);
  const [gemsInLevel, setGemsInLevel] = React.useState(0);
  const [bananas, setBananas] = React.useState(0);
  const [portalUnlocked, setPortalUnlocked] = React.useState(false);
  const [mode, setMode] = React.useState('play');
  const [wagerAmount, setWagerAmount] = React.useState(0);
  const [toast, setToast] = React.useState(null);
  const [picked, setPicked] = React.useState({});
  const [flash, setFlash] = React.useState(null);
  const [gemMilestone, setGemMilestone] = React.useState(25);
  const [falling, setFalling] = React.useState(false);
  const [npcs, setNpcs] = React.useState([]);
  const [cars, setCars] = React.useState([]);
  const [busContext, setBusContext] = React.useState(null);
  const keysRef = React.useRef({});
  const lastDryRef = React.useRef({ x: world.start.x, y: world.start.y });

  const showToast = (text, color = '#FFCC00') => {
    setToast({ text, color, key: Date.now() });
    setTimeout(() => setToast((t) => (t && t.text === text ? null : t)), 1800);
  };

  // Energy-out → lose
  React.useEffect(() => {
    if (energy <= 0 && mode === 'play') { setMode('lost'); window.MQ_SOUND.play('buzz'); }
  }, [energy, mode]);

  // Milestone bonus quiz (every 25 gems on total)
  React.useEffect(() => {
    if (mode === 'play' && character && gems >= gemMilestone) setMode('freequiz');
  }, [gems, mode, gemMilestone, character]);

  // Portal unlock per level
  React.useEffect(() => {
    if (!portalUnlocked && gemsInLevel >= world.portalUnlock) {
      setPortalUnlocked(true);
      window.MQ_SOUND.play('ddopen');
      showToast('🌀 PORTAL OPEN!', '#E066FF');
      setWorld((w) => {
        const tiles = w.tiles.map((r) => r.slice());
        tiles[w.portalSpot.y][w.portalSpot.x] = window.GQ_T.PORTAL;
        return { ...w, tiles };
      });
    }
  }, [gemsInLevel, portalUnlocked, world]);

  const advanceLevel = () => {
    const next = levelNum + 1;
    if (next > 3) {
      setMode('won');
      window.MQ_SOUND.play('final');
      return;
    }
    const nw = gqMakeLevel(next);
    setLevelNum(next);
    setWorld(nw);
    setCamera({ ...nw.start });
    lastDryRef.current = { x: nw.start.x, y: nw.start.y };
    setGemsInLevel(0);
    setPortalUnlocked(false);
    setFalling(false);
    setNpcs(next === 2 ? window.gqBuildCityNPCs(nw) : []);
    setCars(next === 2 ? window.gqBuildCityCars(nw) : []);
    window.MQ_SOUND.play('ddopen');
    showToast(`✨ LEVEL ${next} · ${nw.theme.toUpperCase()}`, '#E066FF');
  };

  // Main update loop: player movement + NPCs/cars + gem pickup + tile effects
  React.useEffect(() => {
    if (mode !== 'play' || !character || falling) return;
    let raf;
    let last = performance.now();
    let energyAccum = 0;
    const T = window.GQ_T;

    const isBlocked = (x, y) => {
      const mx = Math.floor(x), my = Math.floor(y);
      if (mx < 0 || my < 0 || mx >= world.w || my >= world.h) return true;
      const t = world.tiles[my][mx];
      return window.gqIsWall(t) && t !== T.SHOP;
    };

    const step = (now) => {
      const dt = Math.min(50, now - last); last = now;
      const keys = keysRef.current;
      const moveSpeed = 0.0035;
      const turnSpeed = 0.0028;
      const fwd = (keys['w'] || keys['arrowup']) ? 1 : 0;
      const back = (keys['s'] || keys['arrowdown']) ? 1 : 0;
      const left = keys['a'] ? 1 : 0;
      const right = keys['d'] ? 1 : 0;
      const turnL = keys['arrowleft'] || keys['q'] ? 1 : 0;
      const turnR = keys['arrowright'] || keys['e'] ? 1 : 0;
      const dA = (turnR - turnL) * turnSpeed * dt;

      let isMoving = false;
      let fellInWater = false;
      let enteredPortal = false;
      let enteredShop = false;
      let enteredBusTile = null;

      setCamera((c) => {
        const na = c.angle + dA;
        const fx = Math.cos(na), fy = Math.sin(na);
        const sx = -Math.sin(na), sy = Math.cos(na);
        const mv = moveSpeed * dt;
        const rawDx = (fx * (fwd - back) + sx * (right - left)) * mv;
        const rawDy = (fy * (fwd - back) + sy * (right - left)) * mv;
        let nx = c.x + rawDx;
        let ny = c.y + rawDy;
        if (fwd || back || left || right) isMoving = true;

        const pad = 0.25;
        if (isBlocked(nx + Math.sign(rawDx) * pad, c.y)) nx = c.x;
        if (isBlocked(c.x, ny + Math.sign(rawDy) * pad)) ny = c.y;

        const mx = Math.floor(nx), my = Math.floor(ny);
        const tile = (world.tiles[my] && world.tiles[my][mx]) ?? T.GRASS;

        if (tile === T.PORTAL) { enteredPortal = true; return c; }
        if (tile === T.SHOP) { enteredShop = true; return { x: nx, y: ny, angle: na }; }
        if (tile === T.BUS_STOP) {
          const stop = world.busStops.find((s) => s.x === mx && s.y === my);
          if (stop) enteredBusTile = stop;
        }
        if (window.gqIsWater(tile)) {
          fellInWater = true;
          return { x: nx, y: ny, angle: na };
        }

        // Track last safe dry position
        lastDryRef.current = { x: nx, y: ny };

        // Gem pickup
        world.gems.forEach((g, i) => {
          const key = `l${levelNum}-${i}`;
          if (picked[key]) return;
          const ddx = g.x + 0.5 - nx, ddy = g.y + 0.5 - ny;
          if (ddx * ddx + ddy * ddy < 0.35) {
            setGems((gg) => gg + g.val);
            setGemsInLevel((gg) => gg + g.val);
            setPicked((p) => ({ ...p, [key]: true }));
            window.MQ_SOUND.play('tick');
            setFlash('gem'); setTimeout(() => setFlash(null), 250);
          }
        });

        return { x: nx, y: ny, angle: na };
      });

      setMoving(isMoving);

      if (fwd || back || left || right) {
        energyAccum += dt * 0.015;
        if (energyAccum >= 1) {
          const whole = Math.floor(energyAccum);
          energyAccum -= whole;
          setEnergy((e) => Math.max(0, e - whole));
        }
      }

      // Side-effects from collision checks
      if (fellInWater) {
        setFalling(true);
        window.MQ_SOUND.play('buzz');
      } else if (enteredPortal) {
        setTimeout(advanceLevel, 0);
      } else if (enteredShop) {
        setTimeout(() => setMode('shop'), 0);
      } else if (enteredBusTile) {
        const stop = enteredBusTile;
        setTimeout(() => { setBusContext(stop); setMode('bus'); }, 0);
      }

      // Animate NPCs (level 2)
      if (levelNum === 2) {
        setNpcs((prev) => prev.map((n) => {
          const vx = n.tx - n.x, vy = n.ty - n.y;
          const d = Math.hypot(vx, vy);
          if (d < 0.12) {
            const nextTgt = window.gqPickNpcTarget(world, n);
            return { ...n, tx: nextTgt.tx, ty: nextTgt.ty };
          }
          const step = (n.speed || 1) * 0.0015 * dt;
          const k = Math.min(step / d, 1);
          return { ...n, x: n.x + vx * k, y: n.y + vy * k };
        }));
        setCars((prev) => prev.map((car) => {
          const sp = (car.speed || 2) * 0.003 * dt;
          let nx = car.x, ny = car.y;
          if (car.dir === 'E') nx += sp;
          else if (car.dir === 'W') nx -= sp;
          else if (car.dir === 'S') ny += sp;
          else if (car.dir === 'N') ny -= sp;
          if (nx < 0) nx = world.w - 0.5;
          if (nx > world.w) nx = 0.5;
          if (ny < 0) ny = world.h - 0.5;
          if (ny > world.h) ny = 0.5;
          return { ...car, x: nx, y: ny };
        }));
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mode, world, picked, character, falling, levelNum]);

  // Key handlers
  React.useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      if (k === 'j' && mode === 'play' && !falling && character) { e.preventDefault(); openWager(); }
      if ((k === ' ' || k === 'space') && falling) {
        e.preventDefault();
        setCamera((c) => ({ ...c, x: lastDryRef.current.x, y: lastDryRef.current.y }));
        setFalling(false);
        showToast('💦 Splash! Climbed out.', '#5FE8D4');
      }
    };
    const up = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [mode, falling, character, energy]);

  const openWager = () => {
    if (mode !== 'play') return;
    if (energy < 500) { showToast('Need ⚡500+ to wager', '#FF6B6B'); return; }
    setMode('wager');
  };

  const openEnergyQuiz = () => {
    if (mode !== 'play' || falling) return;
    setMode('energy');
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
    setWorld((w) => window.gqSpawnBonusGems(w, picked, 10, camera, levelNum));
    setTimeout(() => showToast('💎 +10 gems scattered!', '#7EE8A6'), 900);
    setMode('play');
  };

  const onFreeQuizResult = (correct) => {
    showToast(correct ? '✓ Nice math!' : '✗ Keep practicing!', correct ? '#4ADE80' : '#FF6B6B');
    setGemMilestone((m) => Math.max(m + 25, Math.floor(gems / 25) * 25 + 25));
    setMode('play');
  };

  const onEnergyQuizResult = (correct) => {
    if (correct) {
      setEnergy((e) => e + 1000);
      setFlash('energy-up'); setTimeout(() => setFlash(null), 600);
      showToast('⚡ +1000 ENERGY!', '#4ADE80');
    }
    setMode('play');
  };

  const buyBanana = () => {
    if (gems < 100) return;
    setGems((g) => g - 100);
    setBananas((b) => b + 1);
    window.MQ_SOUND.play('ding');
    showToast('🍌 +1 banana!', '#FFCC00');
  };

  const closeShop = () => {
    setCamera((c) => ({ ...c, x: c.x + Math.cos(c.angle + Math.PI) * 0.6, y: c.y + Math.sin(c.angle + Math.PI) * 0.6 }));
    setMode('play');
  };

  const onBusGo = (destStop) => {
    if (gems < 5) return;
    setGems((g) => g - 5);
    setCamera((c) => ({ ...c, x: destStop.x + 0.5, y: destStop.y + 1.5 }));
    lastDryRef.current = { x: destStop.x + 0.5, y: destStop.y + 1.5 };
    showToast(`🚌 → ${destStop.label}`, '#FFCC00');
    window.MQ_SOUND.play('ding');
    setMode('play');
    setBusContext(null);
  };

  const closeBus = () => {
    setCamera((c) => ({ ...c, x: c.x + Math.cos(c.angle + Math.PI) * 0.6, y: c.y + Math.sin(c.angle + Math.PI) * 0.6 }));
    setMode('play');
    setBusContext(null);
  };

  const reset = () => {
    const nw = gqMakeLevel(1);
    setLevelNum(1);
    setWorld(nw);
    setCamera({ ...nw.start });
    lastDryRef.current = { x: nw.start.x, y: nw.start.y };
    setEnergy(3000); setGems(0); setGemsInLevel(0); setBananas(0);
    setPortalUnlocked(false);
    setMode('play'); setPicked({}); setToast(null);
    setGemMilestone(25);
    setFalling(false);
    setCharacter(null);
    setNpcs([]); setCars([]);
  };

  const charOrDefault = character || window.GQ_CHARACTERS[0];
  const portalLeft = Math.max(0, world.portalUnlock - gemsInLevel);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden', fontFamily: '"Patrick Hand", "Comic Sans MS", sans-serif' }}>
      <window.Gq1PView
        world={world}
        camera={camera}
        picked={picked}
        levelNum={levelNum}
        moving={moving}
        character={charOrDefault}
        npcs={npcs}
        cars={cars}
      />

      {/* HUD — ALWAYS rendered so smoke tests see ⚡💎🍌 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)', zIndex: 30, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={onHome} style={{ background: 'rgba(0,0,0,0.5)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: '"Fredoka One", sans-serif', fontSize: 13, letterSpacing: 1 }}>◀ Menu</button>
          <Stat icon="⚡" value={energy} color="#FFE66D" flash={flash === 'energy-up' ? '#4ADE80' : flash === 'energy-down' ? '#FF6B6B' : null} label="energy" />
          <Stat icon="💎" value={gems} color="#7EE8A6" flash={flash === 'gem' ? '#7EE8A6' : null} label={`gems · next portal in ${portalLeft}`} />
          <Stat icon="🍌" value={`${bananas}/10`} color="#FFE66D" label="bananas (optional)" />
          <Stat icon="🗺️" value={`L${levelNum}/3`} color="#E066FF" label={`${world.theme} · portal in ${portalLeft} gems`} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={openEnergyQuiz} disabled={mode !== 'play' || !character || falling} style={{
            background: (mode === 'play' && character && !falling) ? 'linear-gradient(180deg, #4ADE80 0%, #2E8F4E 100%)' : 'rgba(255,255,255,0.2)',
            color: (mode === 'play' && character && !falling) ? '#06220d' : 'rgba(255,255,255,0.5)',
            border: '2px solid ' + ((mode === 'play' && character && !falling) ? '#7EE8A6' : 'rgba(255,255,255,0.3)'),
            padding: '10px 14px', borderRadius: 10, cursor: (mode === 'play' && character && !falling) ? 'pointer' : 'not-allowed',
            fontFamily: '"Bebas Neue", sans-serif', fontSize: 14, letterSpacing: 1.5, fontWeight: 900,
            boxShadow: (mode === 'play' && character && !falling) ? '0 4px 0 #265c34' : 'none',
          }}>🔋 EARN 1000</button>
          <button onClick={openWager} disabled={energy < 500 || mode !== 'play' || !character || falling} style={{
            background: (energy >= 500 && character && !falling) ? 'linear-gradient(180deg, #FFD93D 0%, #E8B800 100%)' : 'rgba(255,255,255,0.2)',
            color: (energy >= 500 && character && !falling) ? '#060647' : 'rgba(255,255,255,0.5)',
            border: '2px solid ' + ((energy >= 500 && character && !falling) ? '#FFCC00' : 'rgba(255,255,255,0.3)'),
            padding: '10px 14px', borderRadius: 10, cursor: (energy >= 500 && character && !falling) ? 'pointer' : 'not-allowed',
            fontFamily: '"Bebas Neue", sans-serif', fontSize: 14, letterSpacing: 1.5, fontWeight: 900,
            boxShadow: (energy >= 500 && character && !falling) ? '0 4px 0 #8a6600, 0 0 20px rgba(255,204,0,0.5)' : 'none',
            animation: (energy >= 500 && mode === 'play' && character && !falling) ? 'gq-pulse-soft 2s ease-in-out infinite' : 'none',
          }}>🎯 JEOPARDY! [J]</button>
        </div>
      </div>

      {/* Footer hint */}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.95)', fontSize: 13, textShadow: '1px 1px 2px rgba(0,0,0,0.9)', zIndex: 30, background: 'rgba(0,0,0,0.45)', padding: '6px 14px', borderRadius: 20 }}>
        <kbd style={kbd}>W</kbd><kbd style={kbd}>A</kbd><kbd style={kbd}>S</kbd><kbd style={kbd}>D</kbd> move &nbsp;·&nbsp; <kbd style={kbd}>←</kbd><kbd style={kbd}>→</kbd> turn &nbsp;·&nbsp; <kbd style={kbd}>J</kbd> jeopardy &nbsp;·&nbsp; <kbd style={kbd}>␣</kbd> climb out
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

      {falling && (
        <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,30,80,0.85)', color: '#BCE7FF', padding: '22px 28px', borderRadius: 18, border: '3px solid #5FE8D4', zIndex: 40, fontFamily: '"Bebas Neue", sans-serif', fontSize: 26, letterSpacing: 2, textAlign: 'center' }}>
          <div style={{ fontSize: 46, marginBottom: 6 }}>💦</div>
          <div>YOU FELL IN!</div>
          <div style={{ fontSize: 15, marginTop: 6, color: 'white' }}>Press <kbd style={kbd}>SPACE</kbd> to climb out</div>
        </div>
      )}

      {/* Character picker — shown when no character chosen. Z below HUD so Menu remains clickable. */}
      {!character && mode !== 'won' && mode !== 'lost' && (
        <window.GQCharacterPicker onPick={(c) => { setCharacter(c); window.MQ_SOUND.play('ding'); showToast(`Playing as ${c.name}!`, '#7EE8A6'); }} />
      )}

      {mode === 'wager' && <window.GQWagerPicker maxEnergy={energy} onGo={onWagerGo} onCancel={() => setMode('play')} />}
      {mode === 'quiz' && <window.GQMCQuiz wager={wagerAmount} onResult={onQuizResult} />}
      {mode === 'freequiz' && <window.GQMCQuiz freebie onResult={onFreeQuizResult} />}
      {mode === 'energy' && <window.GQEnergyQuiz onResult={onEnergyQuizResult} />}
      {mode === 'shop' && <window.GQShop gems={gems} bananas={bananas} onBuy={buyBanana} onClose={closeShop} />}
      {mode === 'bus' && busContext && (
        <window.GQBusPicker
          stops={world.busStops.filter((s) => s.id !== busContext.id)}
          currentStop={busContext}
          gems={gems}
          onGo={onBusGo}
          onCancel={closeBus}
        />
      )}
      {(mode === 'won' || mode === 'lost') && <window.GQGameOver won={mode === 'won'} gems={gems} bananas={bananas} level={levelNum} onReset={reset} onHome={onHome} />}
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
