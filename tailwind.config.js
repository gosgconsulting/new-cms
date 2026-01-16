import { createRequire } from 'node:module';

import flowbitePlugin from 'flowbite/plugin';

const require = createRequire(import.meta.url);
const tailwindcssAnimate = require('tailwindcss-animate');

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './sparti-cms/**/*.{ts,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Amalfi Coast', 'Playfair Display', 'serif'],
        'heading-cursive': ['Amalfi Coast', 'Playfair Display', 'serif'],
        body: [
          'Avenir',
          'Source Sans Pro',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        button: ['Poppins', 'sans-serif'],
        handwriting: ['Dancing Script', 'cursive'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        deepBlue: '#00213D',
        coral: '#F94E40',
        brandTeal: 'hsl(var(--brand-teal))',
        brandBlue: 'hsl(var(--brand-blue))',
        brandGold: 'hsl(var(--brand-gold))',
        brandPurple: 'hsl(var(--brand-purple))',
        starYellow: '#FACC15',
        dance: {
          pink: 'hsl(var(--dance-gold))',
          rose: 'hsl(var(--dance-rose))',
          purple: 'hsl(var(--dance-purple))',
          black: 'hsl(var(--dance-black))',
          white: 'hsl(var(--dance-white))',
          gray: {
            50: 'hsl(var(--dance-gray-50))',
            100: 'hsl(var(--dance-gray-100))',
            200: 'hsl(var(--dance-gray-200))',
            800: 'hsl(var(--dance-gray-800))',
            900: 'hsl(var(--dance-gray-900))',
          },
        },
        stage: {
          spotlight: 'hsl(var(--stage-spotlight))',
          ambient: 'hsl(var(--stage-ambient))',
          drama: 'hsl(var(--stage-drama))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate, flowbitePlugin],
};

export default config;
