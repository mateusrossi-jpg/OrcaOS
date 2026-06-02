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
        // map Aferix design system variables if needed
      },
    },
  },
  plugins: [],
};
