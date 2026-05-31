/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map Aferix design system variables if needed, but Tailwind classes like bg-[#0F0F0F] will be processed dynamically
      },
    },
  },
  plugins: [],
}
