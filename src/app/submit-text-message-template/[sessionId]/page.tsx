'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps, Session, TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';

const isValid = (session?: Session) =>
  session?.templateType === TemplateType.SMS &&
  Boolean(session?.smsTemplateMessage) &&
  Boolean(session?.smsTemplateName);

const SubmitSmsTemplatePage = async ({ params: { sessionId } }: PageProps) => {
  const session = await getSession(sessionId);

  if (!session || !isValid(session)) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  return (
    <SubmitTemplate
      templateName={session.smsTemplateName!}
      sessionId={session.id}
      goBackPath='preview-text-message-template'
      submitPath='text-message-template-submitted'
    />
  );
};

export default SubmitSmsTemplatePage;
