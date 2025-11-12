/** @type {import('next').NextConfig} */

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const amplifyConfig = require('./amplify_outputs.json');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates';

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
        allowedOrigins: ['**.nhsnotify.national.nhs.uk', 'notify.nhs.uk'],
        bodySizeLimit: '6mb',
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
      return [];
    },

    // pages with e.g. .dev.tsx extension are only included when running locally
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'].flatMap((extension) => {
      return includeAuthPages ? [`dev.${extension}`, extension] : [extension];
    }),
  };
};

module.exports = nextConfig;
