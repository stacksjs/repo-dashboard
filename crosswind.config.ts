export default {
  content: [
    './pages/**/*.stx',
    './layouts/**/*.stx',
    './components/**/*.stx',
    './partials/**/*.stx',
  ],
  safelist: [
    'flex-col', 'flex-row', 'text-center', 'text-left',
    'items-center', 'justify-center', 'justify-between',
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3',
    'hidden', 'block',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
}
