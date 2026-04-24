// MathJeopardy — core game component, theme-driven.
// Theme controls visuals; logic is identical across variants.
//
// States: 'setup' → 'board' → 'clue' → 'judge' → 'board' → ... → 'final-setup' → 'final-wagers' → 'final-clue' → 'final-reveal' → 'done'

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Confetti — lightweight canvas sprinkler
// ─────────────────────────────────────────────────────────────
function Confetti({ fire, colors = ['#FFCC00', '#FFFFFF', '#87CEFA', '#FF6B6B', '#4ADE80'] }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const parts = [];
    const N = 140;
    for (let i = 0; i < N; i++) {
      parts.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 16 - 4,
        g: 0.4,
        r: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 80 + Math.random() * 40,
      });
    }
    let alive = true;
    const tick = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let any = false;
      for (const p of parts) {
        if (p.life <= 0) continue;
        any = true;
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
        ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
        ctx.restore();
      }
      if (any) requestAnimationFrame(tick);
    };
    tick();
    return () => { alive = false; ctx.clearRect(0, 0, canvas.width, canvas.height); };
  }, [fire]);
  return (
    <canvas ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }} />
  );
}

// ─────────────────────────────────────────────────────────────
// Sound toggle
// ─────────────────────────────────────────────────────────────
function SoundToggle({ theme }) {
  const [muted, setMuted] = useState(false);
  return (
    <button
      onClick={() => setMuted(window.MQ_SOUND.toggle())}
      title={muted ? 'Unmute' : 'Mute'}
      style={{
        background: 'transparent', border: `1.5px solid ${theme.chromeBorder}`,
        color: theme.chromeText, width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Animated score number
// ─────────────────────────────────────────────────────────────
function AnimatedScore({ value, style, prefix = '$', theme }) {
  const [displayed, setDisplayed] = useState(value);
  const [bump, setBump] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const from = prev.current;
    const to = value;
    prev.current = value;
    setBump(Math.sign(to - from));
    const dur = 500;
    const start = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (k < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setBump(0), 300);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const sign = displayed < 0 ? '−' : '';
  const abs = Math.abs(displayed).toLocaleString();
  return (
    <span style={{
      ...style,
      color: bump > 0 ? theme.scorePos : bump < 0 ? theme.scoreNeg : style.color,
      transform: `scale(${bump !== 0 ? 1.15 : 1})`,
      transition: 'transform .25s cubic-bezier(.3,1.8,.5,1), color .3s',
      display: 'inline-block',
    }}>{sign}{prefix}{abs}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN GAME
// ─────────────────────────────────────────────────────────────
function MathJeopardy({ theme, storageKey = 'mq-default' }) {
  const board = window.MATH_BOARD;
  const [phase, setPhase] = useState('setup'); // setup | board | clue | judge | final-setup | final-wagers | final-clue | final-reveal | done
  const [teams, setTeams] = useState([
    { name: 'Team Red', color: '#E53935', score: 0 },
    { name: 'Team Blue', color: '#1E88E5', score: 0 },
  ]);
  const [solved, setSolved] = useState({}); // "catId-value" -> teamIdx|null
  const [active, setActive] = useState(null); // { catIdx, value }
  const [buzzedTeam, setBuzzedTeam] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [ddOpen, setDdOpen] = useState(false); // Daily Double reveal splash
  const [ddWager, setDdWager] = useState(0);
  const [ddWagering, setDdWagering] = useState(false);
  const [ddTeam, setDdTeam] = useState(null); // team that chose the DD tile
  const [finalWagers, setFinalWagers] = useState({}); // teamIdx -> int
  const [finalAnswers, setFinalAnswers] = useState({}); // teamIdx -> string (optional)
  const [finalJudged, setFinalJudged] = useState({}); // teamIdx -> bool
  const [confettiKey, setConfettiKey] = useState(0);
  const [timer, setTimer] = useState(null);
  const [scoreFlashTeam, setScoreFlashTeam] = useState(null);

  // ── Timer for clue (30s) ──
  useEffect(() => {
    if (phase !== 'clue' || buzzedTeam !== null) { setTimer(null); return; }
    setTimer(30);
    const iv = setInterval(() => {
      setTimer((t) => {
        if (t === null) return t;
        if (t <= 1) { clearInterval(iv); return 0; }
        if (t <= 6) window.MQ_SOUND.play('think');
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, active, buzzedTeam]);

  const allSolved = useMemo(() => {
    const total = board.categories.length * 5;
    return Object.values(solved).filter((x) => x !== undefined).length >= total;
  }, [solved, board.categories.length]);

  // ── Keyboard: 1/2/3/4 to buzz in ──
  useEffect(() => {
    const h = (e) => {
      if (phase !== 'clue' || buzzedTeam !== null || ddWagering) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= teams.length) {
        e.preventDefault();
        window.MQ_SOUND.play('buzzin');
        setBuzzedTeam(n - 1);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [phase, buzzedTeam, teams.length, ddWagering]);

  // ── Actions ──
  const startGame = () => setPhase('board');

  const pickTile = (catIdx, value) => {
    const key = `${catIdx}-${value}`;
    if (solved[key] !== undefined) return;
    const cat = board.categories[catIdx];
    const clue = cat.clues[value];
    setActive({ catIdx, value });
    setBuzzedTeam(null);
    setShowAnswer(false);
    if (clue.dailyDouble) {
      window.MQ_SOUND.play('ddopen');
      setDdOpen(true);
      // Daily Double is chosen by the team that had control.
      // For simplicity, ask user to pick the team that chose this tile.
      setDdTeam(null);
      setDdWager(0);
    } else {
      window.MQ_SOUND.play('reveal');
    }
    setPhase('clue');
  };

  const chooseDdTeam = (idx) => {
    setDdTeam(idx);
    setDdWager(Math.max(5, teams[idx].score >= 500 ? 500 : Math.max(5, teams[idx].score)));
    setDdWagering(true);
    setDdOpen(false);
  };

  const confirmDdWager = () => {
    setDdWagering(false);
    setBuzzedTeam(ddTeam);
  };

  const judge = (correct) => {
    const key = `${active.catIdx}-${active.value}`;
    const clue = board.categories[active.catIdx].clues[active.value];
    const isDD = !!clue.dailyDouble;
    const amount = isDD ? ddWager : active.value;
    const teamIdx = buzzedTeam;
    setTeams((ts) => ts.map((t, i) => i === teamIdx ? { ...t, score: t.score + (correct ? amount : -amount) } : t));
    setScoreFlashTeam(teamIdx);
    setTimeout(() => setScoreFlashTeam(null), 800);
    if (correct) {
      window.MQ_SOUND.play('ding');
      setConfettiKey((k) => k + 1);
      setShowAnswer(true);
      setSolved((s) => ({ ...s, [key]: teamIdx }));
      setTimeout(() => {
        setPhase('board');
        setActive(null);
        setBuzzedTeam(null);
        setShowAnswer(false);
      }, 2200);
    } else {
      window.MQ_SOUND.play('buzz');
      if (isDD) {
        // DD wrong — clue closes, mark as used.
        setSolved((s) => ({ ...s, [key]: null }));
        setShowAnswer(true);
        setTimeout(() => {
          setPhase('board');
          setActive(null);
          setBuzzedTeam(null);
          setShowAnswer(false);
        }, 2500);
      } else {
        // Re-open for others to buzz.
        setBuzzedTeam(null);
      }
    }
  };

  const skipClue = () => {
    if (!active) return;
    const key = `${active.catIdx}-${active.value}`;
    setSolved((s) => ({ ...s, [key]: null }));
    setShowAnswer(true);
    setTimeout(() => {
      setPhase('board');
      setActive(null);
      setBuzzedTeam(null);
      setShowAnswer(false);
    }, 2500);
  };

  const startFinal = () => {
    window.MQ_SOUND.play('final');
    const initial = {};
    teams.forEach((_, i) => initial[i] = 0);
    setFinalWagers(initial);
    setPhase('final-wagers');
  };

  const revealFinal = () => {
    setPhase('final-reveal');
    window.MQ_SOUND.play('reveal');
  };

  const judgeFinal = (teamIdx, correct) => {
    if (finalJudged[teamIdx]) return;
    const w = finalWagers[teamIdx] || 0;
    setTeams((ts) => ts.map((t, i) => i === teamIdx ? { ...t, score: t.score + (correct ? w : -w) } : t));
    setFinalJudged((j) => ({ ...j, [teamIdx]: true }));
    if (correct) { window.MQ_SOUND.play('ding'); setConfettiKey((k) => k + 1); }
    else window.MQ_SOUND.play('buzz');
    setScoreFlashTeam(teamIdx);
    setTimeout(() => setScoreFlashTeam(null), 800);
  };

  const finishGame = () => setPhase('done');

  const resetGame = () => {
    setTeams((ts) => ts.map((t) => ({ ...t, score: 0 })));
    setSolved({});
    setActive(null);
    setBuzzedTeam(null);
    setShowAnswer(false);
    setFinalWagers({});
    setFinalAnswers({});
    setFinalJudged({});
    setPhase('setup');
  };

  // ────────── render ──────────
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', fontFamily: theme.font, background: theme.bgPage, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header theme={theme} phase={phase} onReset={resetGame} allSolved={allSolved} onFinal={startFinal} />

      {/* Body */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {phase === 'setup' && <Setup theme={theme} teams={teams} setTeams={setTeams} onStart={startGame} />}
        {['board'].includes(phase) && (
          <Board theme={theme} board={board} solved={solved} onPick={pickTile} />
        )}
        {phase === 'clue' && (
          <ClueView
            theme={theme}
            board={board}
            active={active}
            teams={teams}
            buzzedTeam={buzzedTeam}
            setBuzzedTeam={(i) => { window.MQ_SOUND.play('buzzin'); setBuzzedTeam(i); }}
            onJudge={judge}
            onSkip={skipClue}
            timer={timer}
            showAnswer={showAnswer}
            ddOpen={ddOpen}
            ddWagering={ddWagering}
            ddTeam={ddTeam}
            ddWager={ddWager}
            setDdWager={setDdWager}
            chooseDdTeam={chooseDdTeam}
            confirmDdWager={confirmDdWager}
          />
        )}
        {phase === 'final-wagers' && (
          <FinalWagers theme={theme} teams={teams} wagers={finalWagers} setWagers={setFinalWagers}
            onGo={() => setPhase('final-clue')} final={board.final} />
        )}
        {phase === 'final-clue' && (
          <FinalClue theme={theme} final={board.final} teams={teams}
            finalAnswers={finalAnswers} setFinalAnswers={setFinalAnswers}
            onReveal={revealFinal} />
        )}
        {phase === 'final-reveal' && (
          <FinalReveal theme={theme} final={board.final} teams={teams} wagers={finalWagers}
            answers={finalAnswers} judged={finalJudged} onJudge={judgeFinal}
            onFinish={finishGame} />
        )}
        {phase === 'done' && <GameOver theme={theme} teams={teams} onReset={resetGame} />}

        <Confetti key={confettiKey} fire={confettiKey} colors={theme.confetti} />
      </div>

      {/* Scoreboard */}
      <Scoreboard theme={theme} teams={teams} setTeams={setTeams} scoreFlashTeam={scoreFlashTeam}
        editable={phase === 'setup'} />
    </div>
  );
}

Object.assign(window, { MathJeopardy });
