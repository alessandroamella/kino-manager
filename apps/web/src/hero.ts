import { heroui } from '@heroui/react';

export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: '#f7d400',
          foreground: '#000',
        },
        background: {
          // Define background palette for light theme (white -> black)
          50: '#f9f9f9', // Example light shades - adjust as needed
          100: '#f2f2f2',
          200: '#f0f0f0',
          300: '#e9e9e9',
          400: '#e2e2e2',
          500: '#dbdbdb',
          600: '#d4d4d4',
          700: '#cdcdcd',
          800: '#c6c6c6',
          900: '#bfbfbf',
          DEFAULT: '#fff', // Default light background
          foreground: '#000', // Default light foreground if needed for background
        },
      },
    },
    dark: {
      colors: {
        primary: {
          DEFAULT: '#d0af1a',
          foreground: '#fff',
        },
        background: {
          // Define background palette for dark theme
          50: '#0a0a0a', // Example dark shades - adjust as needed
          100: '#141414',
          200: '#212121',
          300: '#2e2e2e',
          400: '#3b3b3b',
          500: '#484848',
          600: '#555555',
          700: '#626262',
          800: '#6f6f6f',
          900: '#7d7d7d',
          DEFAULT: '#000', // Default dark background
          foreground: '#fff', // Default dark foreground if needed for background
        },
      },
    },
  },
});
