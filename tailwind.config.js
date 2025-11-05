/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#791eba',      // Morado principal de la paleta
          mauve: '#bfa6a4',       // Rosado/mauve de la paleta
          orange: '#fcb500',      // Naranja/amarillo de la paleta
          yellow: '#fff700',      // Amarillo brillante de la paleta
          cream: '#fffef1',       // Blanco/crema de la paleta
          pink: '#C89AB2',        // Rosa secundario
          surface: '#FFFEF1',
          amber: '#FDBB0F',
          green: '#16A34A',
          black: '#0B0B0B',
          beige: '#F5F5DC',
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

