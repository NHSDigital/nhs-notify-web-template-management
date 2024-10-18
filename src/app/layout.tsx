import type { Metadata } from 'next';
import '@styles/app.scss';
import content from '@content/content';
import { ClientLayout } from '@molecules/ClientLayout/ClientLayout';
import { getBasePath } from '@utils/get-base-path';

export const metadata: Metadata = {
  title: content.global.mainLayout.title,
  description: content.global.mainLayout.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <script src={`${getBasePath()}/lib/nhsuk-8.3.0.min.js`} defer />
        <title>{content.global.mainLayout.title}</title>
        <link
          rel='shortcut icon'
          href={`${getBasePath()}/lib/assets/favicons/favicon.ico`}
          type='image/x-icon'
        />
        <link
          rel='apple-touch-icon'
          href={`${getBasePath()}/lib/assets/favicons/apple-touch-icon-180x180.png`}
        />
        <link
          rel='mask-icon'
          href={`${getBasePath()}/lib/assets/favicons/favicon.svg`}
          color='#005eb8'
        />
        <link
          rel='icon'
          sizes='192x192'
          href={`${getBasePath()}/lib/assets/favicons/favicon-192x192.png`}
        />
        <meta
          name='msapplication-TileImage'
          content={`${getBasePath()}/lib/assets/favicons/mediumtile-144x144.png`}
        />
        <meta name='msapplication-TileColor' content='#005eb8' />
        <meta
          name='msapplication-square70x70logo'
          content={`${getBasePath()}/lib/assets/favicons/smalltile-70x70.png`}
        />
        <meta
          name='msapplication-square150x150logo'
          content={`${getBasePath()}/lib/assets/favicons/mediumtile-150x150.png`}
        />
        <meta
          name='msapplication-wide310x150logo'
          content={`${getBasePath()}/lib/assets/favicons/widetile-310x150.png`}
        />
        <meta
          name='msapplication-square310x310logo'
          content={`${getBasePath()}/lib/assets/favicons/largetile-310x310.png`}
        />
        <script
          type='text/javascript'
          src={`${getBasePath()}/lib/nhs-frontend-js-check.js`}
          defer
        />
      </head>
      <body suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
