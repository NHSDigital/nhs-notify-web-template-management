'use server';

import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { getSession } from '@utils/form-actions';
import { PageProps } from '@utils/types';
import { redirect, RedirectType } from 'next/navigation';
import { cookies } from 'next/headers';
import { logger } from '@utils/logger';

const ChooseATemplateTypePage = async ({
  params: { sessionId },
}: PageProps) => {

  logger.info('all cookies', cookies().getAll());

  const session = await getSession(sessionId);
  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <ChooseTemplate initialState={session} />;
};

export default ChooseATemplateTypePage;
