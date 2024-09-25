/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates';

const nextConfig = {
  basePath,
  env: {
    basePath,
    MAX_SESSION_LENGTH_IN_SECONDS:
      process.env.MAX_SESSION_LENGTH_IN_SECONDS ?? '432000', // 5 days in seconds
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
