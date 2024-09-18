'use server';

import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import { PageProps } from '@utils/types';
import { redirect, RedirectType } from 'next/navigation';
import { SessionService } from '@domain/session';

const CreateNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const service = SessionService.init();

  const session = await service.findSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <CreateNhsAppTemplate initialState={session} />;
};

export default CreateNhsAppTemplatePage;
