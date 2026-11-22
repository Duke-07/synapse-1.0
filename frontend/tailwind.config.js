/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'first-color': '#090089',
        'second-color': '#0060ca',
        'third-color': '#91ceff',
        'fourth-color': '#fcdc74',
        yellow: '#fcdc74',
        'yellow-hover': '#f0ce62',
        blue: '#0060ca',
        'blue-hover': '#090089',
        'blue-pale': '#91ceff',
        navy: '#090089',
        sky: '#91ceff',
        ink: '#141414',
        'ink-muted': '#5a6275',
        white: '#FFFFFF',
        'warning-red': '#E53E3E',
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '32px',
      },
      transitionTimingFunction: {
        'banky': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-soft': 'cubic-bezier(0.2, 1.3, 0.4, 1)',
      },
    },
  },
  plugins: [],
};
