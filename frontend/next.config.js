/** @type {import('next').NextConfig} */

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates';
const domain = process.env.NOTIFY_DOMAIN_NAME ?? 'localhost:3000';

const nextConfig = (phase) => {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
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

    async rewrites() {
      if (isDevServer) {
        return [
          {
            source: '/auth/signout',
            destination: `http://${domain}${basePath}/auth/signout`,
            basePath: false,
          },
          {
            source: '/auth',
            destination: `http://${domain}${basePath}/auth`,
            basePath: false,
          },
        ];
      }

      return [];
    },

    // pages with e.g. .dev.tsx extension are only included when running locally
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'].flatMap((extension) => {
      return isDevServer ? [`dev.${extension}`, extension] : [extension];
    }),
  };
};

module.exports = nextConfig;
