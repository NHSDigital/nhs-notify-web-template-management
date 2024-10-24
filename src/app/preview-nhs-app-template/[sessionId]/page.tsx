'use server';

import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate';
import { PageProps, Session, TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const isValid = (session?: Session) =>
  session?.templateType === TemplateType.NHS_APP &&
  Boolean(session?.nhsAppTemplateName) &&
  Boolean(session?.nhsAppTemplateMessage);

const PreviewNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session || !isValid(session)) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  return <ReviewNHSAppTemplate initialState={session} />;
};

export default PreviewNhsAppTemplatePage;
