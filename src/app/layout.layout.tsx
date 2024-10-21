import type { Metadata } from 'next';
import '@styles/app.scss';
import content from '@content/content';
import { ClientLayout } from '@molecules/ClientLayout/ClientLayout';

export const metadata: Metadata = {
  title: content.global.mainLayout.title,
  description: content.global.mainLayout.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
