// Modals for GemQuest: MCQuiz, WagerPicker, Shop, GameOver

function GQMCQuiz({ wager, onResult, freebie }) {
  const pickRandom = () => window.MC_QUESTIONS[Math.floor(Math.random() * window.MC_QUESTIONS.length)];
  const [q, setQ] = React.useState(pickRandom);
  const [picked, setPicked] = React.useState(null);
  const [locked, setLocked] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const pick = (i) => {
    if (locked) return;
    setPicked(i); setLocked(true);
    const correct = i === q.answer;
    window.MQ_SOUND.play(correct ? 'ding' : 'buzz');
    if (correct) {
      setTimeout(() => onResult(true), 1400);
    } else {
      setTimeout(() => {
        let next = pickRandom();
        if (window.MC_QUESTIONS.length > 1) while (next === q) next = pickRandom();
        setQ(next);
        setPicked(null); setLocked(false);
        setAttempts((a) => a + 1);
      }, 1600);
    }
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,16,128,0.88)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'gq-fadein .25s ease-out' }}>
      <div style={{ background: 'linear-gradient(180deg, #0D1AA3 0%, #040867 100%)', border: '3px solid #FFCC00', borderRadius: 16, padding: 26, maxWidth: 560, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,204,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 24, color: '#FFCC00', letterSpacing: 2 }}>MATH JEOPARDY!</div>
          <div style={{ fontSize: 11, color: 'rgba(255,204,0,0.8)', letterSpacing: 1.5 }}>{q.topic.toUpperCase()}</div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {freebie
              ? <span>🎁 <strong style={{ color: '#7EE8A6' }}>Bonus round</strong> — keep going until you get one right!</span>
              : <span>Wagering <strong style={{ color: '#FFCC00' }}>⚡ {wager}</strong> energy · correct answer wins</span>}
          </span>
          {attempts > 0 && <span style={{ color: '#FF6B6B', fontWeight: 700 }}>Try #{attempts + 1}</span>}
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: 10, fontFamily: '"Korinna", Georgia, serif', fontSize: 30, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 18, textShadow: '2px 2px 0 #000', border: '1px solid rgba(255,204,0,0.3)' }}>
          <window.MQMath src={q.q} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.choices.map((c, i) => {
            const isCorrect = i === q.answer;
            const isPicked = picked === i;
            const state = !locked ? 'idle' : (isPicked && isCorrect) ? 'right' : isPicked ? 'wrong' : isCorrect ? 'reveal' : 'dim';
            return (
              <button key={i} onClick={() => pick(i)} disabled={locked} style={{
                background: state === 'right' ? '#43A047' : state === 'wrong' ? '#E53935' : state === 'reveal' ? 'rgba(67,160,71,0.3)' : state === 'dim' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
                border: state === 'right' || state === 'wrong' ? '2px solid white' : state === 'reveal' ? '2px dashed #43A047' : '2px solid rgba(255,204,0,0.4)',
                color: state === 'dim' ? 'rgba(255,255,255,0.5)' : 'white',
                padding: '14px 12px', borderRadius: 8, fontSize: 17, fontWeight: 700,
                cursor: locked ? 'default' : 'pointer', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: 1,
                transition: 'all .15s', transform: state === 'right' ? 'scale(1.04)' : 'scale(1)',
              }}>
                <span style={{ opacity: 0.6, fontSize: 12, marginRight: 8 }}>{'ABCD'[i]}</span>
                <window.MQMath src={c} />
              </button>
            );
          })}
        </div>
        {locked && picked !== null && (
          <div style={{ marginTop: 14, textAlign: 'center', fontFamily: '"Bebas Neue", sans-serif', fontSize: 24, letterSpacing: 2, color: picked === q.answer ? '#4ADE80' : '#FF6B6B' }}>
            {picked === q.answer
              ? (freebie ? '✓ CORRECT!' : `✓ CORRECT · +${wager} ⚡`)
              : '✗ WRONG — new question coming…'}
          </div>
        )}
      </div>
    </div>
  );
}

function GQWagerPicker({ maxEnergy, onGo, onCancel }) {
  const max = Math.min(1000, maxEnergy);
  const min = Math.min(500, max);
  const [w, setW] = React.useState(min);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,16,128,0.85)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'linear-gradient(180deg, #0D1AA3 0%, #040867 100%)', border: '3px solid #FFCC00', borderRadius: 16, padding: 26, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 30, color: '#FFCC00', letterSpacing: 2, textAlign: 'center' }}>RISK YOUR ENERGY</div>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 14 }}>Right answer → gain it · Wrong → lose it</div>
        <div style={{ textAlign: 'center', fontFamily: '"Bebas Neue", sans-serif', fontSize: 64, color: '#FFCC00', textShadow: '3px 3px 0 #000, 0 0 20px rgba(255,204,0,0.5)' }}>⚡ {w}</div>
        <input type="range" min={min} max={max} step="50" value={w} onChange={(e) => setW(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#FFCC00', marginTop: 8 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}><span>{min}</span><span>{max}</span></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} style={{ flex: 1, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', padding: '12px', borderRadius: 8, cursor: 'pointer', fontFamily: '"Bebas Neue", sans-serif', fontSize: 15, letterSpacing: 1.5 }}>Cancel</button>
          <button onClick={() => onGo(w)} style={{ flex: 2, background: '#FFCC00', color: '#060647', border: 'none', padding: '12px', borderRadius: 8, cursor: 'pointer', fontFamily: '"Bebas Neue", sans-serif', fontSize: 17, letterSpacing: 2, fontWeight: 900 }}>LOCK IT IN</button>
        </div>
      </div>
    </div>
  );
}

function GQShop({ gems, bananas, onBuy, onClose }) {
  const canBuy = gems >= 100;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(50,30,20,0.8)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'linear-gradient(180deg, #D97B3C 0%, #7A3410 100%)', border: '4px solid #3a1a05', borderRadius: 14, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 32, color: '#FFE89C', textAlign: 'center', letterSpacing: 1, textShadow: '3px 3px 0 #3a1a05' }}>🪙 GEM SHOP 🍌</div>
        <div style={{ textAlign: 'center', color: '#FFE89C', fontSize: 13, marginBottom: 18, opacity: 0.85 }}>Fresh bananas for sale!</div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 10, border: '2px solid #FFE89C', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 54, filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.3))' }}>🍌</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 20, color: 'white', lineHeight: 1.1 }}>Banana</div>
            <div style={{ color: '#FFE89C', fontSize: 13, marginTop: 4 }}>Price: 💎 100 gems</div>
            <div style={{ color: 'rgba(255,232,156,0.7)', fontSize: 11, marginTop: 2 }}>Collect 10 to win!</div>
          </div>
          <button onClick={onBuy} disabled={!canBuy} style={{ background: canBuy ? '#FFCC00' : '#6A4A2A', color: canBuy ? '#3a1a05' : 'rgba(255,255,255,0.4)', border: 'none', padding: '12px 18px', borderRadius: 8, fontFamily: '"Fredoka One", sans-serif', fontSize: 15, cursor: canBuy ? 'pointer' : 'not-allowed', letterSpacing: 1, boxShadow: canBuy ? '0 3px 0 #8a6600' : 'none' }}>BUY</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 14, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>💎</div>
            <div style={{ color: 'white', fontFamily: '"Fredoka One", sans-serif', fontSize: 20 }}>{gems}</div>
            <div style={{ color: 'rgba(255,232,156,0.7)', fontSize: 10 }}>your gems</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>🍌</div>
            <div style={{ color: 'white', fontFamily: '"Fredoka One", sans-serif', fontSize: 20 }}>{bananas}<span style={{ opacity: 0.5, fontSize: 14 }}>/10</span></div>
            <div style={{ color: 'rgba(255,232,156,0.7)', fontSize: 10 }}>bananas</div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: '100%', background: 'transparent', border: '1.5px solid #FFE89C', color: '#FFE89C', padding: '10px', borderRadius: 8, cursor: 'pointer', fontFamily: '"Fredoka One", sans-serif', fontSize: 14, letterSpacing: 1 }}>Leave Shop</button>
      </div>
    </div>
  );
}

function GQGameOver({ won, bananas, gems, onReset, onHome }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: won ? 'radial-gradient(ellipse, #3F1F7A 0%, #1B0A3D 100%)' : 'radial-gradient(ellipse, #5A1B1B 0%, #1A0505 100%)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30, animation: 'gq-fadein .4s' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 90, marginBottom: 10 }}>{won ? '🏆' : '😵'}</div>
        <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 52, color: won ? '#FFE66D' : '#FF6B6B', letterSpacing: 1, textShadow: '4px 4px 0 rgba(0,0,0,0.5)' }}>
          {won ? 'YOU WIN!' : 'OUT OF ENERGY'}
        </div>
        <div style={{ color: 'white', fontSize: 16, margin: '14px 0 22px', opacity: 0.9 }}>
          {won ? `You collected all 10 bananas! 🍌` : `Your character ran out of steam.`}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, color: 'white' }}>
          <div><div style={{ fontSize: 28 }}>💎</div><div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 22 }}>{gems}</div></div>
          <div><div style={{ fontSize: 28 }}>🍌</div><div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 22 }}>{bananas}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onReset} style={{ background: '#FFCC00', color: '#060647', border: 'none', padding: '12px 26px', borderRadius: 10, fontFamily: '"Fredoka One", sans-serif', fontSize: 17, letterSpacing: 1, cursor: 'pointer' }}>Play Again</button>
          <button onClick={onHome} style={{ background: 'transparent', border: '2px solid white', color: 'white', padding: '12px 20px', borderRadius: 10, fontFamily: '"Fredoka One", sans-serif', fontSize: 15, cursor: 'pointer' }}>Game Menu</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GQMCQuiz, GQWagerPicker, GQShop, GQGameOver });
