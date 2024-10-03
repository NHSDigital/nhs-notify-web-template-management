'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps } from '@utils/types';
import { getSession } from '@utils/form-actions';

const SubmitNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return (
    <SubmitTemplate
      templateName={session.nhsAppTemplateName}
      sessionId={session.id}
      goBackPath='preview-nhs-app-template'
    />
  );
};

export default SubmitNhsAppTemplatePage;
