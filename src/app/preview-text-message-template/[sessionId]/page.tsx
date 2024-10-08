'use server';

import { PageProps, Session, TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { ReviewSMSTemplate } from '@forms/ReviewSMSTemplate';

const isValid = (session?: Session) =>
  session?.templateType === TemplateType.SMS &&
  session?.smsTemplateMessage !== undefined &&
  session?.smsTemplateName !== undefined;

const PreviewSMSTemplatePage = async ({ params: { sessionId } }: PageProps) => {
  const session = await getSession(sessionId);

  if (!session || !isValid(session)) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <ReviewSMSTemplate initialState={session} />;
};

export default PreviewSMSTemplatePage;
