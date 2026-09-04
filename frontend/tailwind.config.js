/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        memora: {
          ivory: '#fdfbf7',
          cream: '#faf6f0',
          parchment: '#f4ece1',
          parchmentDark: '#ebdfce',
          desk: '#1a100a',
          deskBrown: '#2b1910',
          blush: '#e89da2',
          blushLight: '#fdf2f4',
          blushMedium: '#f7d8dc',
          blushDark: '#c86d74',
          brown: '#4a2e1b',
          espresso: '#2c1810',
          muted: '#8b7365',
          border: '#e8dfd1',
          borderDark: '#d8cbb8',
          kraft: '#e6d5be',
          seal: '#8b1e28'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
        signature: ['"Alex Brush"', '"Dancing Script"', 'cursive']
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(44, 24, 16, 0.06), 0 2px 6px -1px rgba(44, 24, 16, 0.04)',
        paper: '0 10px 30px -5px rgba(44, 24, 16, 0.12), 0 4px 10px -2px rgba(44, 24, 16, 0.06)',
        polaroid: '0 8px 24px -4px rgba(44, 24, 16, 0.15), 0 2px 6px -1px rgba(44, 24, 16, 0.08)',
        scroll: '0 12px 36px -6px rgba(44, 24, 16, 0.22), 0 4px 12px -2px rgba(44, 24, 16, 0.12)',
        seal: '0 4px 12px rgba(139, 30, 40, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
      }
    },
  },
  plugins: [],
}
