// Multiple-choice questions for Gem Quest's Jeopardy-on-demand wager.
// Sourced exclusively from the fractions chapter test (items 4–31).
// Math expressions wrapped in $...$ are rendered as LaTeX via KaTeX.

window.MC_QUESTIONS = [
  // Find the fractional part of each number.
  { q: '$\\frac{1}{4}$ of 8 = ?', choices: ['4', '2', '8', '1'], answer: 1, topic: 'Fraction of a Number' },
  { q: '$\\frac{1}{3}$ of 9 = ?', choices: ['6', '9', '3', '1'], answer: 2, topic: 'Fraction of a Number' },
  { q: '$\\frac{5}{6}$ of 12 = ?', choices: ['10', '12', '2', '6'], answer: 0, topic: 'Fraction of a Number' },
  { q: '$\\frac{3}{8}$ of 16 = ?', choices: ['2', '8', '6', '12'], answer: 2, topic: 'Fraction of a Number' },

  // Simplest form.
  { q: 'Simplify $\\frac{9}{27}$.', choices: ['$\\frac{3}{9}$', '$\\frac{1}{3}$', '$\\frac{1}{9}$', '$\\frac{9}{27}$'], answer: 1, topic: 'Simplest Form' },
  { q: 'Simplify $\\frac{4}{8}$.', choices: ['$\\frac{1}{2}$', '$\\frac{2}{4}$', '$\\frac{1}{4}$', '$\\frac{4}{4}$'], answer: 0, topic: 'Simplest Form' },
  { q: 'Simplify $\\frac{18}{20}$.', choices: ['$\\frac{1}{2}$', '$\\frac{18}{20}$', '$\\frac{9}{10}$', '$\\frac{2}{5}$'], answer: 2, topic: 'Simplest Form' },
  { q: 'Simplify $\\frac{9}{12}$.', choices: ['$\\frac{1}{3}$', '$\\frac{3}{4}$', '$\\frac{3}{6}$', '$\\frac{9}{12}$'], answer: 1, topic: 'Simplest Form' },

  // Compare.
  { q: 'Compare: $\\frac{3}{9} \\;\\Box\\; \\frac{2}{3}$', choices: ['>', '<', '='], answer: 1, topic: 'Compare' },
  { q: 'Compare: $\\frac{5}{6} \\;\\Box\\; \\frac{10}{12}$', choices: ['<', '>', '='], answer: 2, topic: 'Compare' },
  { q: 'Compare: $\\frac{7}{10} \\;\\Box\\; \\frac{3}{5}$', choices: ['>', '<', '='], answer: 0, topic: 'Compare' },
  { q: 'Compare: $\\frac{1}{2} \\;\\Box\\; \\frac{5}{12}$', choices: ['=', '<', '>'], answer: 2, topic: 'Compare' },

  // Equivalent fractions.
  { q: '$\\displaystyle\\frac{3}{4} = \\frac{3\\times 3}{4\\times 3} = \\;?$',
    choices: ['$\\frac{3}{12}$', '$\\frac{9}{12}$', '$\\frac{12}{9}$', '$\\frac{6}{8}$'], answer: 1, topic: 'Equivalent' },
  { q: '$\\displaystyle\\frac{6}{8} = \\frac{6\\div 2}{8\\div 2} = \\;?$',
    choices: ['$\\frac{6}{4}$', '$\\frac{3}{4}$', '$\\frac{4}{6}$', '$\\frac{2}{4}$'], answer: 1, topic: 'Equivalent' },
  { q: '$\\displaystyle\\frac{3}{6} = \\frac{3\\times 4}{6\\times 4} = \\;?$',
    choices: ['$\\frac{12}{24}$', '$\\frac{7}{10}$', '$\\frac{9}{18}$', '$\\frac{3}{24}$'], answer: 0, topic: 'Equivalent' },

  // Improper → mixed / whole.
  { q: 'Write $\\frac{14}{2}$ as a whole number.', choices: ['14', '2', '7', '12'], answer: 2, topic: 'Mixed & Improper' },
  { q: 'Write $\\frac{8}{5}$ as a mixed number.',
    choices: ['$\\frac{3}{5}$', '$1\\tfrac{3}{5}$', '$\\frac{8}{5}$', '$1\\tfrac{5}{3}$'], answer: 1, topic: 'Mixed & Improper' },
  { q: 'Write $\\frac{3}{1}$ as a whole number.', choices: ['1', '$\\tfrac{1}{3}$', '3', '$3\\tfrac{1}{1}$'], answer: 2, topic: 'Mixed & Improper' },
  { q: 'Write $\\frac{11}{3}$ as a mixed number.',
    choices: ['$3\\tfrac{2}{3}$', '$2\\tfrac{3}{3}$', '$4\\tfrac{1}{3}$', '$3\\tfrac{1}{3}$'], answer: 0, topic: 'Mixed & Improper' },
  { q: 'Write $\\frac{16}{4}$ as a whole number.', choices: ['3', '4', '5', '16'], answer: 1, topic: 'Mixed & Improper' },

  // Add / subtract in simplest form.
  { q: '$\\displaystyle\\frac{11}{2} + \\frac{3}{2} = \\;?$ (simplest form)',
    choices: ['$\\frac{14}{4}$', '$\\frac{8}{2}$', '7', '4'], answer: 2, topic: 'Add & Subtract' },
  { q: '$\\displaystyle\\frac{1}{6} + \\frac{5}{6} = \\;?$ (simplest form)',
    choices: ['$\\frac{6}{12}$', '1', '$\\frac{5}{12}$', '$\\frac{1}{6}$'], answer: 1, topic: 'Add & Subtract' },
  { q: '$3\\tfrac{1}{8} + 5\\tfrac{5}{8} = \\;?$ (simplest form)',
    choices: ['$8\\tfrac{3}{4}$', '$8\\tfrac{6}{16}$', '$\\tfrac{15}{8}$', '$8\\tfrac{1}{4}$'], answer: 0, topic: 'Add & Subtract' },
  { q: '$4\\tfrac{2}{15} + 3\\tfrac{7}{15} = \\;?$ (simplest form)',
    choices: ['$7\\tfrac{3}{15}$', '$1\\tfrac{3}{5}$', '$7\\tfrac{3}{5}$', '$12\\tfrac{15}{15}$'], answer: 2, topic: 'Add & Subtract' },
  { q: '$\\displaystyle\\frac{7}{16} - \\frac{3}{16} = \\;?$ (simplest form)',
    choices: ['$\\frac{4}{32}$', '$\\frac{1}{4}$', '$\\frac{10}{16}$', '$\\frac{3}{16}$'], answer: 1, topic: 'Add & Subtract' },
  { q: '$\\displaystyle\\frac{19}{20} - \\frac{3}{20} = \\;?$ (simplest form)',
    choices: ['$\\frac{16}{40}$', '$\\frac{22}{20}$', '$\\frac{4}{5}$', '$\\frac{16}{0}$'], answer: 2, topic: 'Add & Subtract' },
  { q: '$5\\tfrac{7}{8} - 2\\tfrac{1}{8} = \\;?$ (simplest form)',
    choices: ['$3\\tfrac{6}{16}$', '$3\\tfrac{3}{4}$', '$7\\tfrac{8}{16}$', '$3\\tfrac{8}{16}$'], answer: 1, topic: 'Add & Subtract' },
  { q: '$8\\tfrac{2}{3} - 5\\tfrac{1}{3} = \\;?$ (simplest form)',
    choices: ['$3\\tfrac{3}{6}$', '$13\\tfrac{3}{3}$', '$3\\tfrac{1}{6}$', '$3\\tfrac{1}{3}$'], answer: 3, topic: 'Add & Subtract' },
];
