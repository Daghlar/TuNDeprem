const withNextIntl = require('next-intl/plugin')('./app/[locale]/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
  },
  env: {
    timeZone: 'Europe/Istanbul'
  },
  output: 'standalone',
  images: {
    domains: ['api.mapbox.com', 'tile.openstreetmap.org'],
  }
};

module.exports = withNextIntl(nextConfig); 