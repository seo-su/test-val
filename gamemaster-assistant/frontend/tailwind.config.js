/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dm-dark': '#1a1a2e',
        'dm-purple': '#16213e',
        'dm-blue': '#0f3460',
        'dm-accent': '#e94560',
        'dm-gold': '#c9a227',
        'dm-parchment': '#f4e4bc',
        'dm-ink': '#2d2d2d',
      },
      fontFamily: {
        'medieval': ['Cinzel', 'serif'],
        'body': ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
}
