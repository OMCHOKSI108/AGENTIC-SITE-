/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8C00',
          600: '#F97316'
        },
        accent: '#F59E0B',
        'dark-bg': '#0F1724',
        'page-bg-light': '#F8F7F5',
        'dark-gray': '#0F1724',
        'light-gray': '#F2F3F3',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}