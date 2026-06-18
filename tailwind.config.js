// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/docs/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./node_modules/fumadocs-ui/dist/**/*.js",
    "./content/**/*.mdx",
    "./app/**/*.tsx"
  ],
  presets: [require('fumadocs-ui/tailwind-plugin').createPreset()],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
