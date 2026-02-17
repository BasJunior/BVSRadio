module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          600: '#7c3aed',
          700: '#6d28d9',
        },
        indigo: {
          600: '#4f46e5',
        },
      },
    },
  },
  plugins: [],
}
