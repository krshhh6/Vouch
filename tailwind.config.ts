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
        // Primary: Deep navy (like Dock Labs)
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',      // Dark background
          950: '#020617',      // Darker accents
        },
        // Accent: Bright blue (like Dock Labs)
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',      // CTA buttons
          700: '#1D4ED8',
        },
        // Semantic feedback colors
        success: '#10B981',
        danger: '#EF4444',
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          800: '#1F2937',
          900: '#111827',
        },
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
        sans: ['var(--font-oswald)', 'Oswald', 'sans-serif'],
        primary: ['var(--font-oswald)', 'Oswald', 'sans-serif'],
        heading: ['var(--font-bowlby)', '"Bowlby One SC"', 'var(--font-oswald)', 'Oswald', 'sans-serif'],
        display: ['var(--font-bowlby)', '"Bowlby One SC"', 'var(--font-oswald)', 'Oswald', 'sans-serif'],
        bowlby: ['var(--font-bowlby)', '"Bowlby One SC"', 'sans-serif'],
        oswald: ['var(--font-oswald)', 'Oswald', 'sans-serif'],
        condensed: ['var(--font-oswald)', 'Oswald', '"Roboto Condensed"', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      borderRadius: {
        'card': '8px',
        'button': '6px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
        'parchment': '0 2px 4px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'seal': '0 2px 6px 0 rgba(74, 124, 89, 0.25)',
        'elevated': '0 4px 12px -2px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};
export default config;
