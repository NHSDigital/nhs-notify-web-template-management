import type { Metadata } from 'next';
import '@styles/app.scss';
import { ClientLayout } from '@layouts/client/client-layout';
import content from '@content/content';
import { getBasePath } from '@utils/get-base-path';
import { LogoutWarningModal } from '@molecules/LogoutWarningModal/LogoutWarningModal';

export const metadata: Metadata = {
  title: content.global.mainLayout.title,
  description: content.global.mainLayout.description,
};

const config = {
  basePath: getBasePath(),
  logoutInSeconds:
    Number(process.env.NEXT_PUBLIC_TIME_TILL_LOGOUT_SECONDS) || 120, // 15 minutes force logout
  promptTimeSeconds:
    Number(process.env.NEXT_PUBLIC_PROMPT_SECONDS_BEFORE_LOGOUT) || 60, // 2 minutes before logout
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <script src={`${config.basePath}/lib/nhsuk-8.3.0.min.js`} defer />
        <title>{content.global.mainLayout.title}</title>
        <link
          rel='shortcut icon'
          href={`${config.basePath}/lib/assets/favicons/favicon.ico`}
          type='image/x-icon'
        />
        <link
          rel='apple-touch-icon'
          href={`${config.basePath}/lib/assets/favicons/apple-touch-icon-180x180.png`}
        />
        <link
          rel='mask-icon'
          href={`${config.basePath}/lib/assets/favicons/favicon.svg`}
          color='#005eb8'
        />
        <link
          rel='icon'
          sizes='192x192'
          href={`${config.basePath}/lib/assets/favicons/favicon-192x192.png`}
        />
        <meta
          name='msapplication-TileImage'
          content={`${config.basePath}/lib/assets/favicons/mediumtile-144x144.png`}
        />
        <meta name='msapplication-TileColor' content='#005eb8' />
        <meta
          name='msapplication-square70x70logo'
          content={`${config.basePath}/lib/assets/favicons/smalltile-70x70.png`}
        />
        <meta
          name='msapplication-square150x150logo'
          content={`${config.basePath}/lib/assets/favicons/mediumtile-150x150.png`}
        />
        <meta
          name='msapplication-wide310x150logo'
          content={`${config.basePath}/lib/assets/favicons/widetile-310x150.png`}
        />
        <meta
          name='msapplication-square310x310logo'
          content={`${config.basePath}/lib/assets/favicons/largetile-310x310.png`}
        />
        <script
          type='text/javascript'
          src={`${config.basePath}/lib/nhs-frontend-js-check.js`}
          defer
        />
      </head>
      <body suppressHydrationWarning>
        <ClientLayout>
          <LogoutWarningModal
            logoutInSeconds={config.logoutInSeconds}
            promptBeforeLogoutSeconds={config.promptTimeSeconds}
          />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
