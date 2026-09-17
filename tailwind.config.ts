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
          950: '#000000',
          900: '#09090b',
          850: '#121214',
          800: '#18181b',
          700: '#27272a',
          600: '#3f3f46',
          500: '#71717a',
          400: '#a1a1aa',
        },
        parchment: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f4f4f5',
          300: '#e4e4e7',
          400: '#d4d4d8',
          500: '#a1a1aa',
          600: '#71717a',
        },
        seal: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f4f4f5',
          300: '#e4e4e7',
          400: '#ffffff',
          500: '#ffffff',
          600: '#27272a',
          700: '#18181b',
          800: '#27272a',
          900: '#121214',
          950: '#09090b',
        },
        redact: {
          black: '#000000',
          charcoal: '#09090b',
          muted: '#18181b',
        }
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        condensed: ['"Roboto Condensed"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      backgroundImage: {
        'ink-gradient': "none",
        'parchment-pattern': "none",
      },
      boxShadow: {
        'parchment': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'seal': 'none',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
