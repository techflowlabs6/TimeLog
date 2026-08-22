/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: 'rgb(var(--base-950) / <alpha-value>)',
          900: 'rgb(var(--base-900) / <alpha-value>)',
          850: 'rgb(var(--base-850) / <alpha-value>)',
          800: 'rgb(var(--base-800) / <alpha-value>)',
          700: 'rgb(var(--base-700) / <alpha-value>)',
          600: 'rgb(var(--base-600) / <alpha-value>)',
          500: 'rgb(var(--base-500) / <alpha-value>)',
          400: 'rgb(var(--base-400) / <alpha-value>)',
          300: 'rgb(var(--base-300) / <alpha-value>)',
          200: 'rgb(var(--base-200) / <alpha-value>)',
          100: 'rgb(var(--base-100) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
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
