'use server';

import { PageProps, Session, TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ReviewEmailTemplate } from '@forms/ReviewEmailTemplate';

const isValid = (session?: Session) =>
  session?.templateType === TemplateType.EMAIL &&
  Boolean(session?.emailTemplateName) &&
  Boolean(session?.emailTemplateSubjectLine) &&
  Boolean(session?.emailTemplateMessage);

const PreviewEmailTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session || !isValid(session)) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <ReviewEmailTemplate initialState={session} />;
};

export default PreviewEmailTemplatePage;
