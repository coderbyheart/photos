/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
    data: { url: '/data' },
  },
  plugins: [
    '@prefresh/snowpack',
    '@snowpack/plugin-dotenv',
    ['@snowpack/plugin-typescript'],
  ],
  alias: {
    react: 'preact/compat',
  },
};
