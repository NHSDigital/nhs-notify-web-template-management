'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps } from '@utils/types';
import { SessionService } from '@domain/session';

const SubmitNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const service = SessionService.init();

  const session = await service.findSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  const validatedSessionData = session.validate();

  return (
    <SubmitTemplate
      templateName={validatedSessionData.}
      sessionId={validatedSessionData.id}
    />
  );
};

export default SubmitNhsAppTemplatePage;
