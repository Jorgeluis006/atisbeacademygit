/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#791EBA',
          pink: '#C89AB2',
          surface: '#FFFEF1',
          yellow: '#FFF810',
          amber: '#FDBB0F',
          green: '#16A34A',
          black: '#0B0B0B',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(121, 30, 186, 0.12)',
      },
    },
  },
  plugins: [],
}

