// 4th grade math Jeopardy question bank — FRACTIONS CHAPTER TEST
// 5 categories x 5 values (100/200/300/400/500)
// Sourced from the chapter test on fractions.
// Math expressions wrapped in $...$ are rendered as LaTeX via KaTeX.

window.MATH_BOARD = {
  categories: [
    {
      id: 'addsub',
      name: 'Add & Subtract',
      clues: {
        100: {
          clue: '$\\displaystyle\\frac{7}{16} - \\frac{3}{16}$ (simplest form)',
          answer: '$\\frac{1}{4}$',
          hint: 'Subtract numerators, then simplify $\\frac{4}{16}$.',
        },
        200: {
          clue: '$\\displaystyle\\frac{19}{20} - \\frac{3}{20}$ (simplest form)',
          answer: '$\\frac{4}{5}$',
          hint: '$\\frac{16}{20}$ — both divide by 4.',
        },
        300: {
          clue: '$8\\tfrac{2}{3} - 5\\tfrac{1}{3}$',
          answer: '$3\\tfrac{1}{3}$',
          hint: 'Whole: 8−5. Fraction: $\\frac{2}{3}-\\frac{1}{3}$.',
        },
        400: {
          clue: '$5\\tfrac{7}{8} - 2\\tfrac{1}{8}$ (simplest form)',
          answer: '$3\\tfrac{3}{4}$',
          hint: '$3\\tfrac{6}{8}$, simplify $\\frac{6}{8}$.',
          dailyDouble: true,
        },
        500: {
          clue: '$4\\tfrac{2}{15} + 3\\tfrac{7}{15}$ (simplest form)',
          answer: '$7\\tfrac{3}{5}$',
          hint: '$7\\tfrac{9}{15}$, then $\\frac{9}{15}$ simplifies by 3.',
        },
      },
    },
    {
      id: 'partof',
      name: 'Fraction of a Number',
      clues: {
        100: {
          clue: '$\\frac{1}{4}$ of 8',
          answer: '2',
          hint: 'Divide 8 by 4.',
        },
        200: {
          clue: '$\\frac{1}{3}$ of 9',
          answer: '3',
          hint: '$9 \\div 3$.',
        },
        300: {
          clue: '$\\frac{3}{8}$ of 16',
          answer: '6',
          hint: '$\\frac{1}{8}$ of 16 is 2, then times 3.',
        },
        400: {
          clue: '$\\frac{5}{6}$ of 12',
          answer: '10',
          hint: '$\\frac{1}{6}$ of 12 is 2, then times 5.',
        },
        500: {
          clue: '$\\frac{5}{6}$ of 12 PLUS $\\frac{3}{8}$ of 16',
          answer: '16',
          hint: '$10 + 6$.',
        },
      },
    },
    {
      id: 'simplify',
      name: 'Simplest Form',
      clues: {
        100: {
          clue: 'Simplify $\\frac{4}{8}$.',
          answer: '$\\frac{1}{2}$',
          hint: 'Divide top and bottom by 4.',
        },
        200: {
          clue: 'Simplify $\\frac{9}{12}$.',
          answer: '$\\frac{3}{4}$',
          hint: 'Both divide by 3.',
        },
        300: {
          clue: 'Simplify $\\frac{9}{27}$.',
          answer: '$\\frac{1}{3}$',
          hint: 'Both divide by 9.',
        },
        400: {
          clue: 'Simplify $\\frac{18}{20}$.',
          answer: '$\\frac{9}{10}$',
          hint: 'Both divide by 2.',
          dailyDouble: true,
        },
        500: {
          clue: 'Fill in: $\\displaystyle\\frac{3}{4} = \\frac{3\\times 3}{4\\times 3} = \\;?$',
          answer: '$\\frac{9}{12}$',
          hint: 'Multiply top and bottom by 3.',
        },
      },
    },
    {
      id: 'compare',
      name: 'Compare: >, <, or =',
      clues: {
        100: {
          clue: 'Compare: $\\frac{5}{6} \\;\\Box\\; \\frac{10}{12}$',
          answer: '= (equal)',
          hint: '$\\frac{10}{12}$ simplifies to $\\frac{5}{6}$.',
        },
        200: {
          clue: 'Compare: $\\frac{1}{2} \\;\\Box\\; \\frac{5}{12}$',
          answer: '$\\frac{1}{2}$ is greater (>)',
          hint: '$\\frac{1}{2} = \\frac{6}{12}$.',
        },
        300: {
          clue: 'Compare: $\\frac{3}{9} \\;\\Box\\; \\frac{2}{3}$',
          answer: '$\\frac{3}{9}$ is less (<)',
          hint: '$\\frac{3}{9} = \\frac{1}{3}$; $\\frac{2}{3}$ is double.',
        },
        400: {
          clue: 'Compare: $\\frac{7}{10} \\;\\Box\\; \\frac{3}{5}$',
          answer: '$\\frac{7}{10}$ is greater (>)',
          hint: '$\\frac{3}{5} = \\frac{6}{10}$.',
        },
        500: {
          clue: 'Equivalent to $\\frac{6}{8}$ after dividing top and bottom by 2: $\\displaystyle\\frac{6\\div 2}{8\\div 2} = \\;?$',
          answer: '$\\frac{3}{4}$',
          hint: 'Simplify by 2.',
        },
      },
    },
    {
      id: 'mixed',
      name: 'Mixed & Improper',
      clues: {
        100: {
          clue: 'Write $\\frac{14}{2}$ as a whole number.',
          answer: '7',
          hint: '$14 \\div 2$.',
        },
        200: {
          clue: 'Write $\\frac{8}{5}$ as a mixed number.',
          answer: '$1\\tfrac{3}{5}$',
          hint: '5 goes into 8 once with 3 left.',
        },
        300: {
          clue: '$\\displaystyle\\frac{1}{6} + \\frac{5}{6}$ (simplest form)',
          answer: '1 (one whole)',
          hint: '$\\frac{6}{6} = 1$.',
        },
        400: {
          clue: '$\\displaystyle\\frac{11}{2} + \\frac{3}{2}$ (simplest form)',
          answer: '7',
          hint: '$\\frac{14}{2} = 7$.',
        },
        500: {
          clue: 'Write $\\frac{11}{3}$ as a mixed number.',
          answer: '$3\\tfrac{2}{3}$',
          hint: '$3 \\times 3 = 9$, remainder 2.',
        },
      },
    },
  ],
  final: {
    category: 'Mixed Number Addition',
    clue: 'Add: $3\\tfrac{1}{8} + 5\\tfrac{5}{8}$. Write the sum in simplest form.',
    answer: '$8\\tfrac{6}{8}$, which simplifies to $8\\tfrac{3}{4}$',
    hint: 'Add whole numbers ($3+5=8$), add fractions ($\\frac{1}{8}+\\frac{5}{8}=\\frac{6}{8}$), simplify.',
  },
};
