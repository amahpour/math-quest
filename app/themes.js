// Two themes for MathJeopardy.

window.THEME_CLASSIC = {
  font: '"Inter", -apple-system, sans-serif',
  fontDisplay: '"Bebas Neue", "Oswald", "Arial Black", sans-serif',
  fontClue: '"Korinna", "Bookman Old Style", Georgia, serif',

  bgPage: '#0A1080',
  bgDeep: '#060647',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.55)',

  accent: '#FFCC00',
  accentShade: '#CC9A00',
  scorePos: '#4ADE80',
  scoreNeg: '#FF6B6B',

  chromeBg: 'linear-gradient(180deg, #0D1AA3 0%, #080F6B 100%)',
  chromeBorder: 'rgba(255,204,0,0.25)',
  chromeText: '#FFFFFF',
  chromeMuted: 'rgba(255,204,0,0.7)',

  // Board
  catBg: 'linear-gradient(180deg, #1A2AC7 0%, #0B14A0 100%)',
  catBorder: '2px solid rgba(255,204,0,0.4)',
  catText: '#FFFFFF',
  catTextShadow: '2px 2px 0 #000, 0 0 12px rgba(0,0,0,0.5)',

  tileBg: 'linear-gradient(180deg, #1520B8 0%, #060CE9 100%)',
  tileSolvedBg: '#05076B',
  tileBorder: '2px solid #FFCC00',
  tileRadius: 6,
  tileText: '#FFCC00',
  tileSolvedText: '#FFCC00',
  tileTextShadow: '3px 3px 0 #000, 0 0 20px rgba(0,0,0,0.6)',
  tileShadow: '0 2px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
  tileHoverShadow: '0 6px 20px rgba(255,204,0,0.5), 0 0 0 2px #FFCC00, inset 0 1px 0 rgba(255,255,255,0.2)',

  // Clue / panels
  clueBg: 'radial-gradient(ellipse at center, #0D1AA3 0%, #06093E 100%)',
  clueCardBg: 'linear-gradient(180deg, #0B14A0 0%, #040867 100%)',
  clueText: '#FFFFFF',
  clueTextShadow: '3px 3px 0 #000, 0 0 20px rgba(0,0,0,0.6)',

  panelBg: 'linear-gradient(180deg, #0F1AB0 0%, #070E7F 100%)',
  panelBorder: '2px solid rgba(255,204,0,0.35)',
  panelRadius: 12,
  panelShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',

  ddBg: 'radial-gradient(ellipse at center, #1A2AC7 0%, #060647 100%)',

  confetti: ['#FFCC00', '#FFFFFF', '#87CEFA', '#FFE066', '#4DA6FF'],
};

window.THEME_CHALK = {
  font: '"Patrick Hand", "Comic Neue", "Comic Sans MS", sans-serif',
  fontDisplay: '"Chango", "Fredoka One", "Bebas Neue", sans-serif',
  fontClue: '"Patrick Hand", "Caveat", "Comic Sans MS", cursive',

  bgPage: '#2A3A30',
  bgDeep: '#1B2822',
  text: '#F5F1E8',
  textMuted: 'rgba(245,241,232,0.6)',

  accent: '#FFE66D',
  accentShade: '#C9B146',
  scorePos: '#7EE8A6',
  scoreNeg: '#FF8B7B',

  chromeBg: 'linear-gradient(180deg, #8B4513 0%, #5C2E0C 100%)',
  chromeBorder: 'rgba(245,222,179,0.35)',
  chromeText: '#F5DEB3',
  chromeMuted: 'rgba(245,222,179,0.7)',

  catBg: 'linear-gradient(180deg, #3D5141 0%, #2A3A30 100%)',
  catBorder: '3px double rgba(245,241,232,0.6)',
  catText: '#FFE66D',
  catTextShadow: '0 0 1px rgba(255,230,109,0.4)',

  tileBg: `
    linear-gradient(180deg, #2F423A 0%, #243129 100%)
  `,
  tileSolvedBg: '#1A241E',
  tileBorder: '2px dashed rgba(245,241,232,0.3)',
  tileRadius: 10,
  tileText: '#F5F1E8',
  tileSolvedText: '#F5F1E8',
  tileTextShadow: '0 0 1px rgba(245,241,232,0.5), 2px 2px 0 rgba(0,0,0,0.3)',
  tileShadow: '0 2px 0 rgba(0,0,0,0.4), inset 0 0 40px rgba(0,0,0,0.15)',
  tileHoverShadow: '0 6px 20px rgba(255,230,109,0.35), 0 0 0 2px #FFE66D',

  clueBg: 'radial-gradient(ellipse at top, #3D5141 0%, #1B2822 100%)',
  clueCardBg: 'linear-gradient(180deg, #2F423A 0%, #1F2B24 100%)',
  clueText: '#FFE66D',
  clueTextShadow: '0 0 2px rgba(255,230,109,0.3), 2px 2px 0 rgba(0,0,0,0.25)',

  panelBg: 'linear-gradient(180deg, #2F423A 0%, #1F2B24 100%)',
  panelBorder: '2px solid rgba(245,241,232,0.25)',
  panelRadius: 14,
  panelShadow: '0 10px 40px rgba(0,0,0,0.5)',

  ddBg: 'radial-gradient(ellipse at center, #3D5141 0%, #1B2822 100%)',

  confetti: ['#FFE66D', '#FF8B7B', '#7EE8A6', '#F5DEB3', '#88CCFF', '#FFFFFF'],
};
