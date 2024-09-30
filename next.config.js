/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates';
const domain = process.env.NOTIFY_DOMAIN_NAME ?? 'localhost:3000';
const authBasePath = '/auth~featuredomain-testing';

const nextConfig = {
  basePath,
  env: {
    basePath,
    authBasePath,
    MAX_SESSION_LENGTH_IN_SECONDS:
      process.env.MAX_SESSION_LENGTH_IN_SECONDS ?? '432000', // 5 days in seconds
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
};

module.exports = nextConfig;
