'use server';

import { PageProps } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ReviewSMSTemplate } from '@forms/ReviewSMSTemplate';

const PreviewSMSTemplatePage = async ({ params: { sessionId } }: PageProps) => {
  const session = await getSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <ReviewSMSTemplate initialState={session} />;
};

export default PreviewSMSTemplatePage;
