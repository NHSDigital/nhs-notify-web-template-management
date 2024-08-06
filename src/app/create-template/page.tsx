'use server';

import { Session } from '@/src/utils/types';
import { createSession } from '@utils/form-actions';
import { redirect } from 'next/navigation';

const initialSessionState: Omit<Session, 'id'> = {
  templateType: 'UNKNOWN',
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const CreateTemplate = async () => {
  const sessionData = await createSession(initialSessionState);

  if (!sessionData?.id) {
    throw new Error('Error creating session');
  }

  redirect(`/create-template/${sessionData.id}`);
};

export default CreateTemplate;
