'use server';

import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate';
import { PageProps } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const PreviewNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <ReviewNHSAppTemplate initialState={session} />;
};

export default PreviewNhsAppTemplatePage;
