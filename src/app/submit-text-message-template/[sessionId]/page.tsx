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

  // TODO: We probably need to start thinking about how we handle users going direct to different pages
  // probably validate the session object has the required values on a get?
  return (
    <SubmitTemplate
      templateName={session.smsTemplateName!}
      sessionId={session.id}
    />
  );
};

export default SubmitSmsTemplatePage;
