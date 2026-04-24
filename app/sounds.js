// Synthesized sounds via Web Audio — no external files.
// Call window.MQ_SOUND.play('ding'), .play('buzz'), .play('think'), .play('final'), .play('reveal'), .play('ddopen')

(function () {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const tone = (freq, dur, type = 'sine', gain = 0.2, t0off = 0) => {
    const c = getCtx();
    const t0 = c.currentTime + t0off;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  };

  const slide = (f0, f1, dur, type = 'sawtooth', gain = 0.15) => {
    const c = getCtx();
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  };

  const players = {
    // Tile reveal chime
    reveal: () => { tone(660, 0.09, 'sine', 0.18); tone(990, 0.2, 'sine', 0.15, 0.08); },
    // Correct!
    ding: () => {
      tone(784, 0.12, 'triangle', 0.22);
      tone(1175, 0.18, 'triangle', 0.2, 0.1);
      tone(1568, 0.35, 'triangle', 0.18, 0.22);
    },
    // Wrong / buzz
    buzz: () => { slide(220, 110, 0.55, 'sawtooth', 0.22); },
    // Team buzz-in (short beep)
    buzzin: () => { tone(880, 0.1, 'square', 0.18); },
    // Think music tick
    think: () => { tone(440, 0.06, 'sine', 0.12); tone(330, 0.06, 'sine', 0.12, 0.15); },
    // Daily Double reveal
    ddopen: () => {
      tone(523, 0.1, 'triangle', 0.22);
      tone(659, 0.1, 'triangle', 0.22, 0.1);
      tone(784, 0.1, 'triangle', 0.22, 0.2);
      tone(1046, 0.5, 'triangle', 0.22, 0.3);
    },
    // Final round sting
    final: () => {
      tone(392, 0.2, 'sawtooth', 0.18);
      tone(523, 0.2, 'sawtooth', 0.18, 0.15);
      tone(784, 0.6, 'sawtooth', 0.2, 0.3);
    },
    // Score tick
    tick: () => { tone(1320, 0.05, 'sine', 0.1); },
  };

  window.MQ_SOUND = {
    play(name) {
      try { if (players[name] && !window.MQ_SOUND.muted) players[name](); } catch (e) {}
    },
    muted: false,
    toggle() { this.muted = !this.muted; return this.muted; },
  };
})();
