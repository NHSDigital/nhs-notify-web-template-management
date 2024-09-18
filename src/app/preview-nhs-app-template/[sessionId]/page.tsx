'use server';

import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate';
import { PageProps } from '@utils/types';
import { redirect, RedirectType } from 'next/navigation';
import { SessionService } from '@domain/session';

const PreviewNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const service = SessionService.init();

  const session = await service.findSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <ReviewNHSAppTemplate initialState={session} />;
};

export default PreviewNhsAppTemplatePage;
