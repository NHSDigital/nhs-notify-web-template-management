import type { Metadata } from 'next';
import { CookiesProvider } from 'next-client-cookies/server';
import '@styles/app.scss';
import { ClientLayout } from '@layouts/client/client-layout';
import content from '@content/content';
import { getBasePath } from '@utils/get-base-path';

// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-object
export const metadata: Metadata = {
  title: content.global.mainLayout.title,
  description: content.global.mainLayout.description,
  icons: {
    icon: [
      {
        url: `${getBasePath()}/assets/images/favicon.ico`,
        sizes: '48x48',
      },
      {
        url: `${getBasePath()}/assets/images/favicon.svg`,
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
    apple: {
      url: `${getBasePath()}/assets/images/nhsuk-icon-180.png`,
    },
    other: [
      {
        rel: 'mask-icon',
        url: `${getBasePath()}/assets/images/nhsuk-icon-mask.svg`,
        color: '#005eb8',
      },
    ],
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <link rel='manifest' href={`${getBasePath()}/assets/manifest.json`} />
        <script
          src={`${getBasePath()}/lib/nhsuk-frontend-10.0.0.min.js`}
          defer
          type='module'
        />
      </head>
      <body suppressHydrationWarning>
        <script src={`${getBasePath()}/lib/nhs-frontend-js-check.js`} defer />
        <CookiesProvider>
          <ClientLayout>{children}</ClientLayout>
        </CookiesProvider>
      </body>
    </html>
  );
}
