/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tông màu xanh cỏ cây tự nhiên (Grass & Meadow Leaf Green) - Nhạt hơn, dịu mắt, ấm áp
        emerald: {
          50: '#F2F9F3',
          100: '#DEF2E2',
          200: '#BFE6C6',
          300: '#98D5A3',
          400: '#6FBE7D',
          500: '#4B9B5C', // Xanh cỏ cây tươi mát tự nhiên
          600: '#39814A', // Xanh lá cây dịu mắt chính (Main Action Green)
          700: '#2C673B', // Xanh cỏ cây đậm vừa phải (Không bị đen/tối gắt)
          800: '#23522F',
          900: '#1C4126',
          950: '#0E2314',
        },
        primary: {
          50: '#F2F9F3',
          100: '#DEF2E2',
          200: '#BFE6C6',
          300: '#98D5A3',
          400: '#6FBE7D',
          500: '#4B9B5C',
          600: '#39814A',
          700: '#2C673B',
          800: '#23522F',
          900: '#1C4126',
          950: '#0E2314',
        },
        // Complementary Accent (Bổ túc đối lập trên vòng tròn màu: Warm Amber & Gold Honey)
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Specific semantic colors
        exchange: {
          light: '#F3E8FF',
          DEFAULT: '#8B5CF6',
          dark: '#6D28D9'
        },
        borrow: {
          light: '#DEF2E2',
          DEFAULT: '#39814A',
          dark: '#2C673B'
        },
        // Reading Modes
        sepia: {
          bg: '#F4ECD8',
          card: '#FAF3E0',
          text: '#433422',
          border: '#E8D9BD'
        },
        night: {
          bg: '#0B0F19',
          card: '#151C2C',
          text: '#E2E8F0',
          border: '#1E293B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'book': '0 10px 25px -5px rgba(4, 120, 87, 0.15), 0 8px 10px -6px rgba(4, 120, 87, 0.1)',
        'pin': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'hover-pin': '0 20px 40px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
