'use server';

import { Session } from '@utils/types';
import { createSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const initialSessionState: Omit<Session, 'id'> = {
  templateType: 'UNKNOWN',
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
  emailTemplateName: '',
  emailTemplateSubjectLine: '',
  emailTemplateMessage: '',
};

const CreateTemplate = async () => {
  const sessionData = await createSession(initialSessionState);

  if (!sessionData?.id) {
    throw new Error('Error creating session');
  }

  redirect(`/choose-a-template-type/${sessionData.id}`, RedirectType.replace);
};

export default CreateTemplate;
