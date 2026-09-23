/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.jsx",
  ],
  theme: {
    extend: {
      colors: {
        // Single brand accent — USC cardinal. One scale, used sparingly.
        cardinal: {
          50: '#fbf1f1',
          100: '#f6dede',
          200: '#eab7b7',
          300: '#dc8888',
          400: '#c95252',
          500: '#b02b2b',
          600: '#990000', // base accent
          700: '#7d0000', // hover
          800: '#5f0000', // active
          900: '#4a0505',
        },
        // Legacy aliases so any un-migrated markup keeps rendering.
        'troy-red': '#990000',
        'troy-gold': '#f0b429',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Slate-tinted, two-layer — soft, not heavy.
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 2px 4px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.08)',
        pop: '0 8px 24px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        // Restrained: 6px controls, 8px surfaces. No xl/2xl.
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
}
