/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/templates';
const domain = process.env.NOTIFY_DOMAIN_NAME ?? 'main.templates.nonprod.nhsnotify.national.nhs.uk';

const nextConfig = {
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
};

module.exports = nextConfig;
