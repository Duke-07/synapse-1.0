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
        charcoal: '#2C3531',
        teal: '#116466',
        tan: '#D9B08C',
        peach: '#FFCB9A',
        mint: '#D1E8E2',
        canvas: '#EBF4F1',
        paper: '#FFFFFF',
        // Legacy aliases mapped to the new palette to preserve any nested utility classes
        ink: '#2C3531',
        'ink-muted': '#6B6D72',
        blue: '#116466',
        'blue-hover': '#2C3531',
        'blue-pale': '#D1E8E2',
        yellow: '#FFCB9A',
        'yellow-hover': '#D9B08C',
        'warning-red': '#E53E3E',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Fraunces', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        headline: ['var(--font-serif)', 'Fraunces', 'Georgia', 'serif'],
        body: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '28px',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'craft-xs': '0 1px 2px rgba(44, 53, 49, 0.04)',
        'craft-sm': '0 2px 8px rgba(44, 53, 49, 0.05)',
        'craft': '0 8px 30px rgba(44, 53, 49, 0.06)',
        'craft-lg': '0 16px 48px rgba(44, 53, 49, 0.08)',
      },
      transitionTimingFunction: {
        'craft': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'banky': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-soft': 'cubic-bezier(0.2, 1.3, 0.4, 1)',
      },
    },
  },
  plugins: [],
};
