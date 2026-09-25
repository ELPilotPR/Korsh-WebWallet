/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050706',
          900: '#080C09',
          850: '#0B100C',
          800: '#0F1611',
          700: '#17221A',
          600: '#223227',
          500: '#344B3B',
        },
        ksh: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#00e65c',
          500: '#00CC52', // Korsh Emerald Neon
          600: '#00a342',
          700: '#007a31',
          800: '#045c27',
          900: '#054720',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#050706',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Orbitron', 'Inter', 'sans-serif'],
        display: ['Exo 2', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 24px rgba(0, 204, 82, 0.25)',
        'neon-lg': '0 0 35px rgba(0, 204, 82, 0.4)',
        'card': '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 204, 82, 0.04)',
      },
    },
  },
  plugins: [],
};
