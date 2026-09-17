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
          950: '#020617', // deepest midnight
          900: '#0B1120', // deep dark background
          850: '#0F172A', // primary clinical ink-navy
          800: '#1E293B', // card background / container
          700: '#334155', // structural borders
          600: '#475569', // muted borders
          500: '#64748B', // secondary label
          400: '#94A3B8', // readable muted text
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
        seal: {
          50: '#F0F7F2',
          100: '#DCEEE1',
          200: '#BDDCC6',
          300: '#94C3A3',
          400: '#6BA67E',
          500: '#4A7C59', // primary muted seal-green
          600: '#3D6649',
          700: '#31523B',
          800: '#284230',
          900: '#213728',
          950: '#142319',
        },
        parchment: {
          50: '#FFFDF9',
          100: '#FAF7F0',
          200: '#F5F1E8', // primary document parchment
          300: '#EDE6D6', // parchment borders
          400: '#E0D5BE',
          500: '#C7B696',
          600: '#A99775',
          700: '#8A7A5B',
          800: '#5C513C',
          900: '#3D3627',
        },
        charcoal: {
          DEFAULT: '#1E293B',
          muted: '#475569',
          light: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        condensed: ['"Roboto Condensed"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        'parchment': '0 2px 4px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'seal': '0 2px 6px 0 rgba(74, 124, 89, 0.25)',
        'elevated': '0 4px 12px -2px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};
export default config;
