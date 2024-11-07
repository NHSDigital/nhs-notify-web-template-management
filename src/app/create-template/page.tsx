'use server';

import { Template } from '@utils/types';
import { createTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const initialTemplateState: Omit<Template, 'id'> = {
  templateType: 'UNKNOWN',
  version: 1,
};

const CreateTemplate = async () => {
  const templateData = await createTemplate(initialTemplateState);

  if (!templateData?.id) {
    throw new Error('Error creating template');
  }

  redirect(`/choose-a-template-type/${templateData.id}`, RedirectType.replace);
};

export default CreateTemplate;
