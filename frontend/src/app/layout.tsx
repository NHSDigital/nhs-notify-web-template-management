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
    icon: {
      url: `${getBasePath()}/lib/assets/favicons/favicon-192x192.png`,
      sizes: '192x192',
    },
    shortcut: {
      url: `${getBasePath()}/lib/assets/favicons/favicon.ico`,
      type: 'image/x-icon',
    },
    apple: {
      url: `${getBasePath()}/lib/assets/favicons/apple-touch-icon-180x180.png`,
    },
    other: [
      {
        rel: 'mask-icon',
        url: `${getBasePath()}/lib/assets/favicons/favicon.svg`,
        color: '#005eb8',
      },
    ],
  },
  other: {
    'msapplication-TileImage': `${getBasePath()}/lib/assets/favicons/mediumtile-144x144.png`,
    'msapplication-TileColor': '#005eb8',
    'msapplication-square70x70logo': `${getBasePath()}/lib/assets/favicons/smalltile-70x70.png`,
    'msapplication-square150x150logo': `${getBasePath()}/lib/assets/favicons/mediumtile-150x150.png`,
    'msapplication-wide310x150logo': `${getBasePath()}/lib/assets/favicons/widetile-310x150.png`,
    'msapplication-square310x310logo': `${getBasePath()}/lib/assets/favicons/largetile-310x310.png`,
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
        <script src={`${getBasePath()}/lib/nhsuk-9.1.0.min.js`} defer />
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
