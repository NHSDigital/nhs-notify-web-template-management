'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps, Session, TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';

const isValid = (session?: Session) =>
  session?.templateType === TemplateType.NHS_APP &&
  Boolean(session?.nhsAppTemplateName) &&
  Boolean(session?.nhsAppTemplateMessage);

const SubmitNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session || !isValid(session)) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  return (
    <SubmitTemplate
      templateName={session.nhsAppTemplateName}
      sessionId={session.id}
      goBackPath='preview-nhs-app-template'
      submitPath='nhs-app-template-submitted'
    />
  );
};

export default SubmitNhsAppTemplatePage;
