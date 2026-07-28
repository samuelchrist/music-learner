/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#0f0f1a',
        surface:  '#1a1a2e',
        surface2: '#16213e',
        accent: {
          DEFAULT: '#7c3aed',
          light:   '#a855f7',
        },
        success: '#10b981',
        danger:  '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
