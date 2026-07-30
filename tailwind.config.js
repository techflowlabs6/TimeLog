/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0b0f',
          900: '#111319',
          850: '#161923',
          800: '#1b1f2b',
          700: '#242938',
          600: '#343b4f',
          400: '#8890a6',
          200: '#c8cdda',
          100: '#e9ebf2'
        },
        accent: {
          DEFAULT: '#7c9eff',
          soft: '#5b7fe0'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
}
