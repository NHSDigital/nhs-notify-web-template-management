/** @type {import('next').NextConfig} */

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const amplifyConfig = require('./amplify_outputs.json');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates';
const domain = process.env.NOTIFY_DOMAIN_NAME ?? 'localhost:3000';

const nextConfig = (phase) => {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;
  const includeAuthPages =
    process.env.INCLUDE_AUTH_PAGES === 'true' || isDevServer;

  return {
    basePath,
    env: {
      basePath,
      API_BASE_URL: amplifyConfig?.meta?.api_base_url,
    },

    sassOptions: {
      quietDeps: true,
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
        {
          source: `${basePath}/auth/inactive`,
          destination: '/auth/inactive',
          permanent: false,
          basePath: false,
        },
        {
          source: `${basePath}/auth/signout`,
          destination: '/auth/signout',
          permanent: false,
          basePath: false,
        },
      ];
    },

    async rewrites() {
      if (includeAuthPages) {
        return [
          {
            source: '/auth/inactive',
            destination: `http://${domain}${basePath}/auth/idle`,
            basePath: false,
          },
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
      return includeAuthPages ? [`dev.${extension}`, extension] : [extension];
    }),
  };
};

module.exports = nextConfig;
