import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#060A14',
          900: '#0B132B',
          850: '#101A38',
          800: '#17244B',
          700: '#22356B',
          600: '#324E99',
          500: '#476CC7',
          400: '#7395E2',
        },
        parchment: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F2EADB',
          300: '#E6DBC6',
          400: '#CEBEA0',
          500: '#AA9674',
          600: '#847355',
        },
        seal: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        redact: {
          black: '#0D1117',
          charcoal: '#161B22',
          muted: '#21262D',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'parchment-pattern': "radial-gradient(#AA967420 1px, transparent 1px)",
        'ink-gradient': "linear-gradient(135deg, #0B132B 0%, #17244B 100%)",
      },
      boxShadow: {
        'parchment': '0 10px 30px -5px rgba(11, 19, 43, 0.08), 0 4px 6px -2px rgba(11, 19, 43, 0.04)',
        'seal': '0 0 25px rgba(22, 163, 74, 0.25)',
        'elevated': '0 20px 40px -10px rgba(11, 19, 43, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
