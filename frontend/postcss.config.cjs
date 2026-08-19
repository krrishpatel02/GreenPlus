const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    ...(process.env.NODE_ENV === 'production'
      ? [
          purgecss({
            content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
            defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/%.#[\]]+/g) || [],
            safelist: {
              standard: [
                /^dashboard-/,
                /^landing-/,
                /^impact-/,
                /^floating-/,
                /^hero-/,
                /^atmosphere-/,
                /^scroll-/,
                /^profile-/,
                /^auth-/,
                /^animate-/,
              ],
            },
          }),
        ]
      : []),
  ],
};
