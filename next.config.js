/** @type {import('next').NextConfig} */

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates';
const domain = process.env.NOTIFY_DOMAIN_NAME ?? 'localhost:3000';

const nextConfig = (phase) => ({
  basePath,
  env: {
    basePath,
  },

  experimental: {
    serverActions: {
      allowedOrigins: [domain, domain.replace('templates', 'web-gateway')],
    },
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: basePath,
        basePath: false,
        permanent: false,
      },
    ];
  },

  pageExtensions: ['ts', 'tsx', 'js', 'jsx'].flatMap((extension) => {
    const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;
    return isDevServer ? [`dev.${extension}`, extension] : [extension];
  }),
});

module.exports = nextConfig;
