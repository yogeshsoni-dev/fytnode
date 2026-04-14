/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        brand: {
          green:  '#10b981',
          amber:  '#f59e0b',
          red:    '#ef4444',
          blue:   '#3b82f6',
        },
      },
      fontFamily: {
        sans: [
          'Inter', 'ui-sans-serif', 'system-ui', '-apple-system',
          'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
