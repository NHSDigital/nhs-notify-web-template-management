'use server';

import { randomUUID } from 'node:crypto';
import { redirect, RedirectType } from 'next/navigation';
import { getSession, sendEmail } from '@utils/form-actions';
import { PageProps } from '@utils/types';

const NhsAppTemplateSubmittedPage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  const templateId = randomUUID();

  await sendEmail(
    templateId,
    session.nhsAppTemplateName,
    session.nhsAppTemplateMessage
  );

  return (
    <h2 className='nhsuk-heading-l' data-testid='page-sub-heading'>
      Placeholder page
    </h2>
  );
};

export default NhsAppTemplateSubmittedPage;
