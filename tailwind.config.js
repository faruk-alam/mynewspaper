/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./dist/**/*.html', './scripts/lib/**/*.js', './src/js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f2',
          100: '#fbe2e2',
          500: '#b91c1c',
          600: '#a31515',
          700: '#8b0f0f',
          800: '#6f0c0c',
          900: '#4a0808',
        },
        ink: {
          50: '#f8f8f7',
          100: '#efefed',
          200: '#dcdcd8',
          300: '#bfbfb9',
          400: '#8e8e86',
          500: '#6b6b63',
          600: '#52524b',
          700: '#3d3d38',
          800: '#262623',
          900: '#161614',
          950: '#0c0c0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.ink.800'),
            '--tw-prose-headings': theme('colors.ink.900'),
            '--tw-prose-links': theme('colors.brand.600'),
            '--tw-prose-quotes': theme('colors.ink.800'),
            '--tw-prose-quote-borders': theme('colors.brand.500'),
            '--tw-prose-invert-body': theme('colors.ink.200'),
            '--tw-prose-invert-headings': theme('colors.white'),
            '--tw-prose-invert-links': theme('colors.red.300'),
            '--tw-prose-invert-quotes': theme('colors.ink.100'),
            fontFamily: theme('fontFamily.serif').join(', '),
            fontSize: '1.125rem',
            lineHeight: '1.8',
            maxWidth: 'none',
            'h2, h3': { fontFamily: theme('fontFamily.sans').join(', '), letterSpacing: '-0.01em' },
            a: { textDecoration: 'underline', textUnderlineOffset: '3px' },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
