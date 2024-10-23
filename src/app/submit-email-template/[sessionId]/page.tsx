'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps, Session, TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';

const isValid = (session?: Session) =>
  session?.templateType === TemplateType.EMAIL &&
  session?.emailTemplateName !== undefined &&
  session?.emailTemplateSubjectLine !== undefined &&
  session?.emailTemplateMessage !== undefined;

const SubmitEmailTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session || !isValid(session)) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  return (
    <SubmitTemplate
      templateName={session.emailTemplateName!}
      sessionId={session.id}
      goBackPath='preview-email-template'
      submitPath='email-template-submitted'
    />
  );
};

export default SubmitEmailTemplatePage;
