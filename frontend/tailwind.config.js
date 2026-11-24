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
        yellow: '#FFCE32',
        'yellow-hover': '#F2C32B',
        blue: '#1D63FF',
        'blue-hover': '#1453E6',
        'blue-pale': '#E8F2FF',
        ink: '#141414',
        'ink-muted': '#6B6D72',
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
