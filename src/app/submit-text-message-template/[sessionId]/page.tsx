'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { PageProps } from '@utils/types';
import { getSession } from '@utils/form-actions';

const SubmitSmsTemplatePage = async ({ params: { sessionId } }: PageProps) => {
  const session = await getSession(sessionId);

  if (!session) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  return (
    <SubmitTemplate
      templateName={session.smsTemplateName!}
      sessionId={session.id}
    />
  );
};

export default SubmitSmsTemplatePage;
