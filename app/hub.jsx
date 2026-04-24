// Hub — game picker / main menu for the Math Quest game suite.

function GameHub({ onPick }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #1A2AC7 0%, #060647 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Inter", sans-serif', color: 'white', padding: 30,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ fontSize: 13, letterSpacing: 5, color: '#FFCC00', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
          4th Grade Math · Game Suite
        </div>
        <div style={{
          fontFamily: '"Bebas Neue", sans-serif', fontSize: 76, fontWeight: 900,
          color: '#FFCC00', letterSpacing: 4, lineHeight: 1,
          textShadow: '4px 4px 0 #000, 0 0 40px rgba(255,204,0,0.4)',
          marginTop: 6,
        }}>MATH QUEST</div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
          Pick a game to play
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 820 }}>
        <GameCard
          title="Jeopardy!"
          tag="CLASSIC"
          desc="Team quiz show: pick categories, answer questions, wager on Daily Doubles, and bet it all in the Final round."
          emoji="📚"
          color="#FFCC00"
          bg="linear-gradient(180deg, #0D1AA3 0%, #040867 100%)"
          onClick={() => onPick('jeopardy')}
        />
        <GameCard
          title="Gem Quest"
          tag="ADVENTURE"
          desc="Pick your hero, then explore 3 worlds: Forest, City, and Volcano. Collect gems, wager energy on math, ride buses, and reach the portal to win!"
          emoji="💎"
          color="#7EE8A6"
          bg="linear-gradient(180deg, #2A5F3A 0%, #0F3820 100%)"
          onClick={() => onPick('gemquest')}
        />
      </div>

      <div style={{ marginTop: 30, fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>
        Curriculum: multiplication · division · fractions · place value · word problems
      </div>
    </div>
  );
}

function GameCard({ title, tag, desc, emoji, color, bg, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: bg, border: `2px solid ${color}`, borderRadius: 16,
        padding: 24, textAlign: 'left', cursor: 'pointer', color: 'white',
        boxShadow: hover ? `0 10px 30px rgba(0,0,0,0.4), 0 0 30px ${color}44` : '0 4px 16px rgba(0,0,0,0.3)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all .2s',
        fontFamily: 'inherit',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 48, filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.3))' }}>{emoji}</div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color, fontWeight: 700 }}>{tag}</div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, letterSpacing: 1, lineHeight: 1, color: 'white' }}>
            {title}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
        {desc}
      </div>
      <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
        background: color, color: '#060647', padding: '6px 14px', borderRadius: 6,
        fontFamily: '"Bebas Neue", sans-serif', fontSize: 14, letterSpacing: 2, fontWeight: 900 }}>
        PLAY →
      </div>
    </button>
  );
}

Object.assign(window, { GameHub });
