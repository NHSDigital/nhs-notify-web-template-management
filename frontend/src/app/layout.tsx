import type { Metadata } from 'next';
import { CookiesProvider } from 'next-client-cookies/server';
import '@styles/app.scss';
import content from '@content/content';
import { getBasePath } from '@utils/get-base-path';
import { AuthProvider } from '@providers/auth-provider';
import { NHSNotifySkipLink } from '@atoms/NHSNotifySkipLink/NHSNotifySkipLink';
import { NhsNotifyHeader } from '@molecules/Header/Header';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyFooter } from '@molecules/Footer/Footer';
import { LogoutWarningModal } from '@molecules/LogoutWarningModal/LogoutWarningModal';
import { serverIsFeatureEnabled } from '@utils/server-features';

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

const config = {
  logoutInSeconds:
    Number(process.env.NEXT_PUBLIC_TIME_TILL_LOGOUT_SECONDS) || 900, // 15 minutes force logout
  promptTimeSeconds:
    Number(process.env.NEXT_PUBLIC_PROMPT_SECONDS_BEFORE_LOGOUT) || 120, // 2 minutes before logout
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const routingEnabled = await serverIsFeatureEnabled('routing');

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
          <AuthProvider>
            <NHSNotifySkipLink />
            <NhsNotifyHeader routingEnabled={routingEnabled} />
            <NHSNotifyContainer>{children}</NHSNotifyContainer>
            <NHSNotifyFooter />
            <LogoutWarningModal
              logoutInSeconds={config.logoutInSeconds}
              promptBeforeLogoutSeconds={config.promptTimeSeconds}
            />
          </AuthProvider>
        </CookiesProvider>
      </body>
    </html>
  );
}
