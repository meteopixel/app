/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#0d1117',
        'bg-secondary': '#1a1f2e',
        'bg-tertiary': '#262d3d',
        
        // Surface colors
        'surface-glass': '#1a1f2e99',
        
        // Text colors
        'text-primary': '#e6edf3',
        'text-secondary': '#8b95a8',
        'text-tertiary': '#4d5766',
        
        // Border colors
        'border': '#2d3444',
        'border-light': '#3d4555',
        
        // Accent colors
        'accent-primary': '#58a6ff',
        'accent-hover': '#79b8ff',
        
        // Status colors
        'success': '#3fb950',
        'warning': '#f0883e',
        'error': '#f85149',
        
        // Weather colors
        'sun': '#ffa94d',
        'sun-glow': '#ffba69',
        'cloud-light': '#7db9de',
        'cloud-dark': '#4a6b85',
        'rain': '#58a6ff',
        'storm': '#a371f7',
        'snow': '#c9d1d9',
        'fog': '#6e7681',
        'night-sky': '#161b22',
        'moon': '#d2dae2',
        'stars': '#f0c456',
      },
      fontFamily: {
        pixelify: ['PixelifySans-Regular', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

