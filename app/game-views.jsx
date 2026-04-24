// Sub-views for MathJeopardy. Pure presentational + light state.

function Header({ theme, phase, onReset, allSolved, onFinal }) {
  return (
    <div style={{
      padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: theme.chromeBg, borderBottom: `1px solid ${theme.chromeBorder}`,
      zIndex: 20, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: theme.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: theme.fontDisplay, fontWeight: 900, color: theme.bgPage,
          fontSize: 22,
        }}>
          ×
        </div>
        <div>
          <div style={{ fontFamily: theme.fontDisplay, fontWeight: 900, fontSize: 22, color: theme.chromeText, letterSpacing: 0.5 }}>
            MATH QUEST
          </div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: theme.chromeMuted, textTransform: 'uppercase' }}>
            4th Grade · Answer in the form of a question
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {allSolved && phase === 'board' && (
          <button onClick={onFinal} style={{
            background: theme.accent, border: 'none', color: theme.bgDeep,
            padding: '10px 18px', borderRadius: 8, fontWeight: 800, fontSize: 14,
            letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: theme.fontDisplay,
            boxShadow: `0 0 0 2px ${theme.accent}44, 0 0 22px ${theme.accent}66`,
            animation: 'mq-pulse 1.2s ease-in-out infinite',
          }}>
            Final Round →
          </button>
        )}
        <SoundToggle theme={theme} />
        <button onClick={onReset} title="Reset game" style={{
          background: 'transparent', border: `1.5px solid ${theme.chromeBorder}`,
          color: theme.chromeText, width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─────────── Setup (team config) ───────────
function Setup({ theme, teams, setTeams, onStart }) {
  const palette = ['#E53935', '#1E88E5', '#43A047', '#FB8C00'];
  const defaults = ['Team Red', 'Team Blue', 'Team Green', 'Team Orange'];

  const setCount = (n) => {
    const next = [];
    for (let i = 0; i < n; i++) {
      next.push(teams[i] || { name: defaults[i], color: palette[i], score: 0 });
    }
    setTeams(next);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{
        background: theme.panelBg, padding: '40px 48px', borderRadius: theme.panelRadius,
        border: theme.panelBorder, maxWidth: 640, width: '100%',
        boxShadow: theme.panelShadow,
      }}>
        <div style={{ fontFamily: theme.fontDisplay, fontSize: 36, fontWeight: 900, letterSpacing: 0.5, color: theme.text, marginBottom: 6, textAlign: 'center' }}>
          Ready to play?
        </div>
        <div style={{ fontSize: 14, color: theme.textMuted, textAlign: 'center', marginBottom: 28 }}>
          Set up your teams. Use keys <kbd style={kbdStyle(theme)}>1</kbd>–<kbd style={kbdStyle(theme)}>4</kbd> to buzz in.
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[2, 3, 4].map((n) => (
            <button key={n} onClick={() => setCount(n)}
              style={{
                background: teams.length === n ? theme.accent : 'transparent',
                color: teams.length === n ? theme.bgDeep : theme.text,
                border: `1.5px solid ${teams.length === n ? theme.accent : theme.chromeBorder}`,
                padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
                fontFamily: theme.font,
              }}>
              {n} teams
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${teams.length}, 1fr)`, gap: 12, marginBottom: 28 }}>
          {teams.map((t, i) => (
            <div key={i} style={{
              background: theme.tileBg, padding: 14, borderRadius: 10,
              border: `1.5px solid ${theme.chromeBorder}`,
            }}>
              <div style={{ width: '100%', height: 40, borderRadius: 6, background: t.color, marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, letterSpacing: 1, fontSize: 18,
                fontFamily: theme.fontDisplay,
              }}>
                {i + 1}
              </div>
              <input value={t.name}
                onChange={(e) => setTeams(teams.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                style={{
                  width: '100%', background: theme.bgPage, border: `1px solid ${theme.chromeBorder}`,
                  color: theme.text, padding: '8px 10px', borderRadius: 6, fontSize: 14,
                  fontFamily: theme.font, boxSizing: 'border-box',
                }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {palette.map((c) => (
                  <button key={c} onClick={() => setTeams(teams.map((x, j) => j === i ? { ...x, color: c } : x))}
                    style={{
                      width: 18, height: 18, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: t.color === c ? `2px solid ${theme.text}` : '2px solid transparent',
                      padding: 0,
                    }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={onStart} style={{
          width: '100%', padding: '16px', background: theme.accent, color: theme.bgDeep,
          border: 'none', borderRadius: 10, fontFamily: theme.fontDisplay, fontWeight: 900,
          fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
          boxShadow: `0 4px 0 ${theme.accentShade}`,
        }}>
          Let's Play!
        </button>
      </div>
    </div>
  );
}

function kbdStyle(theme) {
  return {
    background: theme.tileBg, padding: '2px 8px', borderRadius: 4,
    border: `1px solid ${theme.chromeBorder}`, fontFamily: 'monospace',
    fontSize: 13, color: theme.text, margin: '0 2px',
  };
}

// ─────────── Board (5x5 grid) ───────────
function Board({ theme, board, solved, onPick }) {
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Category headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flexShrink: 0 }}>
        {board.categories.map((cat) => (
          <div key={cat.id} style={{
            background: theme.catBg,
            color: theme.catText,
            padding: '14px 10px',
            borderRadius: theme.tileRadius,
            border: theme.catBorder,
            textAlign: 'center',
            fontFamily: theme.fontDisplay,
            fontWeight: 900,
            fontSize: 'clamp(14px, 1.2vw, 20px)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            lineHeight: 1.15,
            textShadow: theme.catTextShadow,
            minHeight: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {cat.name}
          </div>
        ))}
      </div>
      {/* Tiles */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: 10 }}>
        {[100, 200, 300, 400, 500].map((value) => (
          board.categories.map((cat, catIdx) => {
            const key = `${catIdx}-${value}`;
            const isSolved = solved[key] !== undefined;
            return (
              <Tile key={key} theme={theme} value={value} isSolved={isSolved}
                onClick={() => onPick(catIdx, value)} />
            );
          })
        ))}
      </div>
    </div>
  );
}

function Tile({ theme, value, isSolved, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={isSolved ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={isSolved}
      style={{
        background: isSolved ? theme.tileSolvedBg : theme.tileBg,
        border: theme.tileBorder,
        borderRadius: theme.tileRadius,
        color: theme.tileText,
        fontFamily: theme.fontDisplay,
        fontWeight: 900,
        fontSize: 'clamp(28px, 3.5vw, 56px)',
        cursor: isSolved ? 'default' : 'pointer',
        textShadow: isSolved ? 'none' : theme.tileTextShadow,
        transition: 'transform .15s cubic-bezier(.2,1.6,.4,1), box-shadow .15s, background .2s',
        transform: hover && !isSolved ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hover && !isSolved ? theme.tileHoverShadow : theme.tileShadow,
        position: 'relative',
        overflow: 'hidden',
      }}>
      {!isSolved ? `$${value}` : (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme.tileSolvedText} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><polyline points="20 6 9 17 4 12"/></svg>
      )}
    </button>
  );
}

// ─────────── Clue View (full-screen question) ───────────
function ClueView({ theme, board, active, teams, buzzedTeam, setBuzzedTeam,
                    onJudge, onSkip, timer, showAnswer,
                    ddOpen, ddWagering, ddTeam, ddWager, setDdWager, chooseDdTeam, confirmDdWager }) {
  const cat = board.categories[active.catIdx];
  const clue = cat.clues[active.value];
  const [showHint, setShowHint] = useState(false);

  useEffect(() => { setShowHint(false); }, [active]);

  // DAILY DOUBLE SPLASH
  if (ddOpen) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: theme.ddBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 30, padding: 40,
        animation: 'mq-zoom-in .4s cubic-bezier(.2,1.4,.4,1)',
      }}>
        <div style={{
          fontFamily: theme.fontDisplay, fontWeight: 900,
          fontSize: 'clamp(60px, 10vw, 140px)',
          color: theme.accent,
          letterSpacing: 3,
          textShadow: `0 0 40px ${theme.accent}99, 6px 6px 0 ${theme.bgDeep}`,
          animation: 'mq-wiggle .5s ease-in-out 2',
          textAlign: 'center',
        }}>
          DAILY<br/>DOUBLE
        </div>
        <div style={{ fontSize: 20, color: theme.chromeText, opacity: 0.85, textAlign: 'center', maxWidth: 520 }}>
          Which team found it? That team wagers from their score.
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {teams.map((t, i) => (
            <button key={i} onClick={() => chooseDdTeam(i)} style={{
              background: t.color, color: 'white', border: 'none',
              padding: '14px 22px', borderRadius: 10, fontWeight: 800,
              fontSize: 17, cursor: 'pointer', fontFamily: theme.fontDisplay,
              letterSpacing: 1, minWidth: 140,
              boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
            }}>{t.name}</button>
          ))}
        </div>
      </div>
    );
  }

  // DAILY DOUBLE WAGER
  if (ddWagering && ddTeam !== null) {
    const team = teams[ddTeam];
    const maxWager = Math.max(500, team.score);
    return (
      <div style={{ position: 'absolute', inset: 0, background: theme.ddBg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{
          background: theme.panelBg, padding: '40px 48px', borderRadius: theme.panelRadius,
          border: theme.panelBorder, boxShadow: theme.panelShadow, maxWidth: 520, width: '100%',
        }}>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 900, color: theme.accent, textAlign: 'center', letterSpacing: 2 }}>
            DAILY DOUBLE
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', color: theme.text, fontSize: 18 }}>
            <strong style={{ color: team.color }}>{team.name}</strong>, make your wager.
          </div>
          <div style={{ marginTop: 6, textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>
            Min $5 · Max ${maxWager.toLocaleString()}
          </div>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 70, fontWeight: 900, color: theme.accent, textShadow: theme.tileTextShadow, letterSpacing: 1 }}>
              ${ddWager.toLocaleString()}
            </div>
          </div>
          <input type="range" min="5" max={maxWager} step="5" value={ddWager}
            onChange={(e) => setDdWager(parseInt(e.target.value, 10))}
            style={{ width: '100%', marginTop: 20, accentColor: theme.accent }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[100, 250, 500, 1000, maxWager].filter((v, i, a) => v <= maxWager && a.indexOf(v) === i).map((v) => (
              <button key={v} onClick={() => setDdWager(v)} style={{
                background: 'transparent', border: `1.5px solid ${theme.chromeBorder}`,
                color: theme.text, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                fontFamily: theme.font,
              }}>${v === maxWager ? 'All in' : v}</button>
            ))}
          </div>
          <button onClick={confirmDdWager} style={{
            marginTop: 24, width: '100%', padding: 14, background: theme.accent, color: theme.bgDeep,
            border: 'none', borderRadius: 10, fontFamily: theme.fontDisplay, fontWeight: 900,
            fontSize: 18, letterSpacing: 2, cursor: 'pointer',
          }}>
            LOCK IT IN
          </button>
        </div>
      </div>
    );
  }

  const isDD = !!clue.dailyDouble;

  return (
    <div style={{
      position: 'absolute', inset: 0, padding: 'clamp(20px, 3vw, 40px)',
      background: theme.clueBg, display: 'flex', flexDirection: 'column', gap: 16,
      animation: 'mq-zoom-in .35s cubic-bezier(.2,1.4,.4,1)',
    }}>
      {/* Top strip: category + value + timer + skip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: 2, color: theme.chromeMuted, textTransform: 'uppercase', fontWeight: 700 }}>
            {cat.name}
          </div>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: 34, fontWeight: 900, color: theme.accent, letterSpacing: 1, textShadow: theme.tileTextShadow }}>
            {isDD ? 'DAILY DOUBLE' : `$${active.value}`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {timer !== null && buzzedTeam === null && (
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: timer <= 6 ? '#E53935' : theme.tileBg,
              color: timer <= 6 ? 'white' : theme.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 900,
              border: `2px solid ${theme.chromeBorder}`,
              animation: timer <= 6 ? 'mq-pulse 1s ease-in-out infinite' : 'none',
            }}>{timer}</div>
          )}
          <button onClick={onSkip} style={{
            background: 'transparent', border: `1.5px solid ${theme.chromeBorder}`,
            color: theme.textMuted, padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
            fontFamily: theme.font, fontSize: 13, fontWeight: 600,
          }}>Reveal & Skip</button>
        </div>
      </div>

      {/* Clue card */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: theme.clueCardBg, borderRadius: theme.panelRadius, padding: 'clamp(20px, 3vw, 40px)',
        border: theme.panelBorder, boxShadow: theme.panelShadow,
        textAlign: 'center', position: 'relative', minHeight: 0,
      }}>
        <div style={{
          fontFamily: theme.fontClue, fontWeight: 700, color: theme.clueText,
          fontSize: 'clamp(32px, 5.5vw, 72px)',
          lineHeight: 1.15, letterSpacing: 0.5,
          textShadow: theme.clueTextShadow,
          textWrap: 'balance',
          maxWidth: '90%',
        }}>
          {showAnswer ? (
            <span style={{ color: theme.accent }}><window.MQMath src={clue.answer} /></span>
          ) : <window.MQMath src={clue.clue} />}
        </div>

        {!showAnswer && (
          <div style={{ marginTop: 20, minHeight: 30 }}>
            {showHint ? (
              <div style={{ fontSize: 17, color: theme.textMuted, fontStyle: 'italic' }}>
                💡 <window.MQMath src={clue.hint} />
              </div>
            ) : (
              <button onClick={() => setShowHint(true)} style={{
                background: 'transparent', border: `1px dashed ${theme.chromeBorder}`,
                color: theme.textMuted, padding: '6px 14px', borderRadius: 6, fontSize: 13,
                cursor: 'pointer', fontFamily: theme.font,
              }}>Show hint</button>
            )}
          </div>
        )}

        {showAnswer && (
          <div style={{ marginTop: 18, fontSize: 14, letterSpacing: 3, color: theme.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
            ← answer
          </div>
        )}
      </div>

      {/* Buzz-in / Judge row */}
      {!showAnswer && (
        <div style={{ flexShrink: 0 }}>
          {buzzedTeam === null ? (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {teams.map((t, i) => (
                <button key={i} onClick={() => setBuzzedTeam(i)} style={{
                  background: t.color, color: 'white', border: 'none',
                  padding: '16px 22px', borderRadius: 10, fontWeight: 800,
                  fontSize: 17, cursor: 'pointer', fontFamily: theme.fontDisplay,
                  letterSpacing: 1, minWidth: 170,
                  boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.25)', width: 26, height: 26, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>{i + 1}</span>
                  {t.name} buzz
                </button>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 10 }}>
                <strong style={{ color: teams[buzzedTeam].color }}>{teams[buzzedTeam].name}</strong> buzzed in. Teacher judges:
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => onJudge(true)} style={{
                  background: '#43A047', color: 'white', border: 'none',
                  padding: '14px 32px', borderRadius: 10, fontWeight: 800, fontSize: 17,
                  cursor: 'pointer', fontFamily: theme.fontDisplay, letterSpacing: 1,
                  boxShadow: '0 4px 0 #2E7D32',
                }}>✓ Correct (+${isDD ? ddWager : active.value})</button>
                <button onClick={() => onJudge(false)} style={{
                  background: '#E53935', color: 'white', border: 'none',
                  padding: '14px 32px', borderRadius: 10, fontWeight: 800, fontSize: 17,
                  cursor: 'pointer', fontFamily: theme.fontDisplay, letterSpacing: 1,
                  boxShadow: '0 4px 0 #C62828',
                }}>✗ Wrong (−${isDD ? ddWager : active.value})</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────── Final Round ───────────
function FinalWagers({ theme, teams, wagers, setWagers, onGo, final }) {
  const allSet = teams.every((t, i) => wagers[i] !== undefined && wagers[i] !== '');
  return (
    <div style={{ position: 'absolute', inset: 0, padding: 28, overflow: 'auto', background: theme.ddBg }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: theme.chromeMuted, textTransform: 'uppercase' }}>Final Round</div>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: 48, fontWeight: 900, color: theme.accent, letterSpacing: 2, textShadow: theme.tileTextShadow }}>
            {final.category.toUpperCase()}
          </div>
          <div style={{ fontSize: 15, color: theme.chromeText, marginTop: 6 }}>
            Each team wagers any amount up to their current score (or up to $500 if negative). No peeking until all wagers are in.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(teams.length, 4)}, 1fr)`, gap: 14, marginBottom: 24 }}>
          {teams.map((t, i) => {
            const max = Math.max(500, t.score);
            const w = wagers[i] ?? 0;
            return (
              <div key={i} style={{
                background: theme.panelBg, borderRadius: theme.panelRadius,
                border: theme.panelBorder, padding: 18, boxShadow: theme.panelShadow,
              }}>
                <div style={{ fontWeight: 800, color: t.color, fontSize: 17, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>Score: ${t.score.toLocaleString()}</div>
                <input type="number" min="0" max={max} value={w}
                  onChange={(e) => setWagers({ ...wagers, [i]: Math.max(0, Math.min(max, parseInt(e.target.value || '0', 10))) })}
                  style={{
                    width: '100%', background: theme.bgPage, border: `1.5px solid ${theme.chromeBorder}`,
                    color: theme.text, padding: '10px 12px', borderRadius: 8, fontSize: 22,
                    fontFamily: theme.fontDisplay, fontWeight: 800, textAlign: 'center',
                    boxSizing: 'border-box',
                  }} />
                <input type="range" min="0" max={max} step="10" value={w}
                  onChange={(e) => setWagers({ ...wagers, [i]: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', marginTop: 10, accentColor: t.color }} />
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  <button onClick={() => setWagers({ ...wagers, [i]: 0 })} style={miniBtn(theme)}>$0</button>
                  <button onClick={() => setWagers({ ...wagers, [i]: Math.floor(max / 2) })} style={miniBtn(theme)}>½</button>
                  <button onClick={() => setWagers({ ...wagers, [i]: max })} style={miniBtn(theme)}>All in</button>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onGo} disabled={!allSet} style={{
          width: '100%', padding: 16, background: allSet ? theme.accent : '#666',
          color: theme.bgDeep, border: 'none', borderRadius: 10, fontFamily: theme.fontDisplay,
          fontWeight: 900, fontSize: 18, letterSpacing: 2, cursor: allSet ? 'pointer' : 'not-allowed',
          opacity: allSet ? 1 : 0.5,
        }}>
          Reveal the Clue →
        </button>
      </div>
    </div>
  );
}

function miniBtn(theme) {
  return {
    flex: 1, background: 'transparent', border: `1px solid ${theme.chromeBorder}`,
    color: theme.text, padding: '4px 8px', borderRadius: 5, cursor: 'pointer', fontSize: 11,
    fontFamily: theme.font,
  };
}

function FinalClue({ theme, final, teams, finalAnswers, setFinalAnswers, onReveal }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, padding: 28, background: theme.clueBg,
      display: 'flex', flexDirection: 'column', gap: 16,
      animation: 'mq-zoom-in .4s cubic-bezier(.2,1.4,.4,1)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, letterSpacing: 3, color: theme.chromeMuted, textTransform: 'uppercase' }}>Final Clue</div>
        <div style={{ fontFamily: theme.fontDisplay, fontSize: 26, fontWeight: 900, color: theme.accent, letterSpacing: 2 }}>
          {final.category.toUpperCase()}
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: theme.clueCardBg, borderRadius: theme.panelRadius, padding: 40,
        border: theme.panelBorder, boxShadow: theme.panelShadow, textAlign: 'center',
        minHeight: 0,
      }}>
        <div style={{
          fontFamily: theme.fontClue, fontWeight: 700, color: theme.clueText,
          fontSize: 'clamp(22px, 3.2vw, 40px)', lineHeight: 1.3,
          textShadow: theme.clueTextShadow, maxWidth: '95%', textWrap: 'balance',
        }}>
          <window.MQMath src={final.clue} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(teams.length, 4)}, 1fr)`, gap: 10 }}>
        {teams.map((t, i) => (
          <div key={i} style={{ background: theme.panelBg, borderRadius: 10, padding: 10, border: theme.panelBorder }}>
            <div style={{ fontWeight: 700, color: t.color, fontSize: 13, marginBottom: 6 }}>{t.name} answer (optional)</div>
            <input value={finalAnswers[i] || ''} placeholder="Teams write on paper too…"
              onChange={(e) => setFinalAnswers({ ...finalAnswers, [i]: e.target.value })}
              style={{
                width: '100%', background: theme.bgPage, border: `1px solid ${theme.chromeBorder}`,
                color: theme.text, padding: '8px 10px', borderRadius: 6, fontSize: 14,
                fontFamily: theme.font, boxSizing: 'border-box',
              }} />
          </div>
        ))}
      </div>

      <button onClick={onReveal} style={{
        padding: 14, background: theme.accent, color: theme.bgDeep, border: 'none',
        borderRadius: 10, fontFamily: theme.fontDisplay, fontWeight: 900, fontSize: 17,
        letterSpacing: 2, cursor: 'pointer',
      }}>Reveal Answer</button>
    </div>
  );
}

function FinalReveal({ theme, final, teams, wagers, answers, judged, onJudge, onFinish }) {
  const allJudged = teams.every((_, i) => judged[i]);
  return (
    <div style={{ position: 'absolute', inset: 0, padding: 28, background: theme.clueBg, overflow: 'auto' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: theme.chromeMuted, textTransform: 'uppercase' }}>The Answer Is</div>
          <div style={{ fontFamily: theme.fontClue, fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, color: theme.accent, letterSpacing: 1, textShadow: theme.clueTextShadow }}>
            <window.MQMath src={final.answer} />
          </div>
          <div style={{ fontSize: 14, color: theme.textMuted, marginTop: 4 }}><window.MQMath src={final.hint} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(teams.length, 4)}, 1fr)`, gap: 12, marginBottom: 20 }}>
          {teams.map((t, i) => (
            <div key={i} style={{ background: theme.panelBg, borderRadius: 12, padding: 14, border: theme.panelBorder, boxShadow: theme.panelShadow }}>
              <div style={{ fontWeight: 800, color: t.color, fontSize: 16, marginBottom: 6 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>Wagered</div>
              <div style={{ fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 900, color: theme.text }}>
                ${(wagers[i] || 0).toLocaleString()}
              </div>
              {answers[i] && (
                <div style={{ marginTop: 8, padding: 8, background: theme.bgPage, borderRadius: 6, fontSize: 13, color: theme.text, border: `1px solid ${theme.chromeBorder}` }}>
                  “{answers[i]}”
                </div>
              )}
              {judged[i] ? (
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: theme.textMuted }}>Judged ✓</div>
              ) : (
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button onClick={() => onJudge(i, true)} style={{ flex: 1, background: '#43A047', color: 'white', border: 'none', padding: '10px', borderRadius: 6, fontWeight: 800, cursor: 'pointer', fontFamily: theme.fontDisplay }}>✓</button>
                  <button onClick={() => onJudge(i, false)} style={{ flex: 1, background: '#E53935', color: 'white', border: 'none', padding: '10px', borderRadius: 6, fontWeight: 800, cursor: 'pointer', fontFamily: theme.fontDisplay }}>✗</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {allJudged && (
          <button onClick={onFinish} style={{
            width: '100%', padding: 16, background: theme.accent, color: theme.bgDeep,
            border: 'none', borderRadius: 10, fontFamily: theme.fontDisplay, fontWeight: 900,
            fontSize: 18, letterSpacing: 2, cursor: 'pointer',
          }}>See Final Results →</button>
        )}
      </div>
    </div>
  );
}

function GameOver({ theme, teams, onReset }) {
  const sorted = [...teams].map((t, i) => ({ ...t, idx: i })).sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  return (
    <div style={{ position: 'absolute', inset: 0, background: theme.ddBg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 640 }}>
        <div style={{ fontSize: 14, letterSpacing: 4, color: theme.chromeMuted, textTransform: 'uppercase' }}>Winner!</div>
        <div style={{
          fontFamily: theme.fontDisplay, fontSize: 'clamp(50px, 9vw, 96px)', fontWeight: 900,
          color: winner.color, letterSpacing: 2, textShadow: `0 0 40px ${winner.color}66, 6px 6px 0 ${theme.bgDeep}`,
          margin: '10px 0 20px',
        }}>
          {winner.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 30 }}>
          {sorted.map((t, rank) => (
            <div key={t.idx} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: theme.panelBg, border: theme.panelBorder,
              padding: 14, borderRadius: 10, boxShadow: theme.panelShadow,
            }}>
              <div style={{ fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 900, color: theme.textMuted, width: 34 }}>#{rank + 1}</div>
              <div style={{ width: 12, height: 36, borderRadius: 4, background: t.color }} />
              <div style={{ flex: 1, textAlign: 'left', fontWeight: 700, color: theme.text, fontSize: 17 }}>{t.name}</div>
              <div style={{ fontFamily: theme.fontDisplay, fontSize: 26, fontWeight: 900, color: theme.accent }}>
                ${t.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onReset} style={{
          padding: '14px 40px', background: theme.accent, color: theme.bgDeep,
          border: 'none', borderRadius: 10, fontFamily: theme.fontDisplay, fontWeight: 900,
          fontSize: 18, letterSpacing: 2, cursor: 'pointer',
        }}>Play Again</button>
      </div>
    </div>
  );
}

// ─────────── Scoreboard footer ───────────
function Scoreboard({ theme, teams, setTeams, scoreFlashTeam, editable }) {
  return (
    <div style={{
      background: theme.chromeBg, borderTop: `1px solid ${theme.chromeBorder}`,
      padding: '12px 20px', display: 'grid',
      gridTemplateColumns: `repeat(${teams.length}, 1fr)`, gap: 10, flexShrink: 0,
      zIndex: 20,
    }}>
      {teams.map((t, i) => (
        <div key={i} style={{
          background: theme.tileBg,
          borderRadius: 10, padding: '10px 14px',
          borderLeft: `5px solid ${t.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'box-shadow .2s',
          boxShadow: scoreFlashTeam === i ? `0 0 0 2px ${t.color}, 0 0 16px ${t.color}88` : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: t.color, color: 'white', width: 24, height: 24, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: theme.fontDisplay, fontWeight: 800, fontSize: 13,
            }}>{i + 1}</div>
            <div style={{ fontWeight: 700, color: theme.chromeText, fontSize: 14, letterSpacing: 0.5 }}>{t.name}</div>
          </div>
          <AnimatedScore value={t.score} theme={theme}
            style={{
              fontFamily: theme.fontDisplay, fontWeight: 900, fontSize: 22,
              color: theme.accent, letterSpacing: 1,
            }} />
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Header, Setup, Board, Tile, ClueView, FinalWagers, FinalClue, FinalReveal, GameOver, Scoreboard });
