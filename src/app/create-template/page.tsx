'use server';

import { createSession } from '@utils/form-actions';
import { redirect } from 'next/navigation';

const CreateTemplate = async () => {
  const sessionData = await createSession({
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  });

  if (!sessionData?.id) {
    throw new Error('Error creating session');
  }

  redirect(`/create-template/${sessionData.id}`);
};

export default CreateTemplate;
