/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /surface-elev/ },
  ],
  theme: {
    extend: {
      colors: {
        aferix: {
          canvas: '#000000',      // Deep Matte Black
          card: '#1A1D21',        // Dark Solid Graphite
          inner: '#21262D',       
          interactive: '#21262D', 
          cta: '#FFFFFF',         
          gold: '#FFB340',        // Solid Matte Orange
          green: '#47C46A',       // Solid Matte Green
          red: '#E85D5D',
          blue: '#3B82F6',
          graphite: '#1A1D21',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B7BDC7',
          muted: '#8B929C',
          tertiary: '#6B7280',
          placeholder: '#9BA3AD',
        }
      },
    },
  },
  plugins: [],
};
