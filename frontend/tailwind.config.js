/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // The app already ships its own CSS reset in index.css; disable Tailwind's
  // preflight so we can adopt utilities incrementally without breaking legacy
  // component styles.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Tokens are backed by CSS variables (channel triplets) so they are
        // theme-aware (light/dark) AND support Tailwind's /opacity modifiers.
        // Background layers
        base: 'rgb(var(--c-base) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        elevated: 'rgb(var(--c-elevated) / <alpha-value>)',
        hover: 'rgb(var(--c-hover) / <alpha-value>)',
        // Accent — electric indigo
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          hover: 'rgb(var(--c-accent-hover) / <alpha-value>)',
          active: 'rgb(var(--c-accent-active) / <alpha-value>)',
        },
        // Voting
        upvote: 'rgb(var(--c-upvote) / <alpha-value>)',
        downvote: 'rgb(var(--c-downvote) / <alpha-value>)',
        // Text
        content: {
          primary: 'rgb(var(--c-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--c-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--c-text-muted) / <alpha-value>)',
        },
        // Border
        edge: 'rgb(var(--c-edge) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        feed: '720px',
      },
      transitionDuration: {
        150: '150ms',
      },
    },
  },
  plugins: [],
};
