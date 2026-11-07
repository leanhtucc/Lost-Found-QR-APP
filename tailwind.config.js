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
        /** Lost and Found QR / Obsidian design system */
        fb: {
          canvas: '#08111F',
          primary: '#2B7FE8',
          'primary-light': '#7CC4FF',
          'primary-dark': '#1D62C9',
          'primary-dim': 'rgba(58, 169, 255, 0.18)',
          secondary: '#2ECC8B',
          'secondary-dim': 'rgba(46, 204, 139, 0.18)',
          success: '#2ECC8B',
          tertiary: '#FFB020',
          'tertiary-dim': 'rgba(255, 176, 32, 0.18)',
          warning: '#FFB020',
          neutral: '#050B14',
          surface: '#0F1A2E',
          'surface-muted': '#162340',
          'surface-elevated': '#1C2B4A',
          'border-glass': 'rgba(255, 255, 255, 0.12)',
          'border-subtle': 'rgba(120, 150, 200, 0.16)',
          /** Text on dark surface (avoid name collision with fontSize `fb-body`) */
          content: '#F1F6FF',
          muted: '#9AA9C2',
          label: '#6A7A96',
          danger: '#E5365B',
          error: '#E5365B',
          info: '#8FD3FF',
        },
      },
      fontFamily: {
        sans: ['BeVietnamPro_400Regular', 'System', 'sans-serif'],
        display: ['BeVietnamPro_700Bold', 'System', 'sans-serif'],
      },
      /* Names avoid collision with fb.* text colors (e.g. text-fb-label) */
      fontSize: {
        'display-headline': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'display-title': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'section-title': ['18px', { lineHeight: '24px', fontWeight: '600' }],
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
        'fb-glow': '0 0 24px rgba(58, 169, 255, 0.35)',
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
