/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // CSS-variable-backed so the real light/dark toggle (see
        // context/ThemeContext.jsx) can swap the palette at runtime without
        // touching a single component's classes. Dark values below match
        // the original hardcoded hex exactly, so dark mode is pixel-for-
        // pixel unchanged - light mode is purely additive.
        base: 'rgb(var(--color-base) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        surface2: 'rgb(var(--color-surface2) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        accent: {
          DEFAULT: '#ff6a1a',
          50: '#fff2e8',
          500: '#ff6a1a',
          600: '#ea560a'
        },
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        success: '#22c55e',
        danger: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      // Radius scale — one value per surface type, never ad-hoc.
      borderRadius: {
        btn: '14px',
        card: '20px',
        modal: '24px',
        input: '14px',
        progress: '20px'
      },
      // Spacing scale — 4/8/12/16/24/32/48/64 only.
      // Tailwind defaults already map to this: 1=4px 2=8px 3=12px 4=16px 6=24px 8=32px 12=48px 16=64px
      spacing: {
        18: '4.5rem'
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        250: '250ms',
        800: '800ms'
      },
      scale: {
        102: '1.02'
      },
      boxShadow: {
        // Never large drop shadows. Depth = surface + hairline border only.
        // The single exception: a soft glow on the active/focused element.
        glow: '0 0 0 6px rgba(255,106,26,0.15)'
      }
    }
  },
  plugins: []
};
