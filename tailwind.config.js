/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './navigation/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        /** FindBack / Obsidian design system */
        fb: {
          primary: '#7C6AF6',
          'primary-light': '#978CF8',
          'primary-dark': '#6B5AE8',
          'primary-dim': 'rgba(124, 106, 246, 0.18)',
          secondary: '#2ECC8B',
          'secondary-dim': 'rgba(46, 204, 139, 0.18)',
          success: '#2ECC8B',
          tertiary: '#F4845F',
          'tertiary-dim': 'rgba(244, 132, 95, 0.18)',
          warning: '#F4845F',
          neutral: '#0A0A0F',
          surface: '#131319',
          'surface-muted': '#1F1F26',
          'surface-elevated': '#25252D',
          'border-glass': 'rgba(255, 255, 255, 0.12)',
          'border-subtle': 'rgba(72, 71, 77, 0.15)',
          /** Text on dark surface (avoid name collision with fontSize `fb-body`) */
          content: '#F9F5FD',
          muted: '#ACAAB1',
          label: '#71717A',
          danger: '#D73357',
          info: '#ADA3FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'System', 'sans-serif'],
        display: ['var(--font-display)', 'System', 'sans-serif'],
      },
      /* Names avoid collision with fb.* text colors (e.g. text-fb-label) */
      fontSize: {
        'display-headline': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'display-title': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'body-default': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-small': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'label-default': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'caption-default': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        fb: '14px',
        'fb-lg': '18px',
      },
      boxShadow: {
        'fb-glow': '0 0 24px rgba(124, 106, 246, 0.35)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.card-elevated': {
          '@apply bg-card rounded-xl border border-border shadow-sm': {},
        },
        '.btn-gradient': {
          '@apply bg-gradient-to-r from-fb-primary to-fb-primary-dark': {},
        },
        '.glass-panel': {
          '@apply bg-fb-surface/80 border border-fb-border-glass rounded-fb-lg': {},
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};
