/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Design System: warm neutral base + sage green + warm terracotta */
        /* Sage green ties to 'rural/growth/local roots', terracotta ties to 'handmade/earthy/craft' */
        bg: {
          primary: '#FAF8F5',
          secondary: '#FFFFFF',
          tertiary: '#F1EDE6',
        },
        accent: {
          DEFAULT: '#2F6F4E',
          light: '#E4EFE8',
          dark: '#204E37',
        },
        secondary: {
          DEFAULT: '#C97B3C',
          light: '#F8E9DE',
          dark: '#A55D25',
        },
        text: {
          primary: '#22261F',
          secondary: '#5C6156',
        },
        border: '#E5E1D8',
        status: {
          success: '#2F9E44',
          warning: '#E6A93C',
          danger: '#D14343',
          info: '#3B7DD8',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 30px rgba(47, 111, 78, 0.08)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      }
    },
  },
  plugins: [],
}
