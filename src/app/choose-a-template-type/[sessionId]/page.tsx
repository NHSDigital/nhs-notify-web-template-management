'use server';

import { SessionService } from '@domain/session/session-service';
import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { PageProps } from '@utils/types';
import { redirect, RedirectType } from 'next/navigation';

const ChooseATemplateTypePage = async ({
  params: { sessionId },
}: PageProps) => {
  const service = SessionService.init();

  const session = await service.findSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <ChooseTemplate initialState={session} />;
};

export default ChooseATemplateTypePage;
