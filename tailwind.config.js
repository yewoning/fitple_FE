/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        gray: {
          1: 'var(--color-gray-1)',
          2: 'var(--color-gray-2)',
          3: 'var(--color-gray-3)',
          4: 'var(--color-gray-4)',
          5: 'var(--color-gray-5)',
          '5-overlay': 'var(--color-gray-5-overlay)',
          6: 'var(--color-gray-6)',
        },
        blue: {
          1: 'var(--color-blue-1)',
          2: 'var(--color-blue-2)',
        },
        yellow: {
          1: 'var(--color-yellow-1)',
          2: 'var(--color-yellow-2)',
          3: 'var(--color-yellow-3)',
        },
        'dark-blue': 'var(--color-dark-blue)',
        'sky-blue': 'var(--color-sky-blue)',
        'dark-sky-blue': 'var(--color-dark-sky-blue)',
        'white-dark-sky-blue': 'var(--color-white-dark-sky-blue)',
        black: 'var(--color-black)',
      },
      fontFamily: {
        sans: ['Pretendard'],
      },
    },
  },
  plugins: [],
};
