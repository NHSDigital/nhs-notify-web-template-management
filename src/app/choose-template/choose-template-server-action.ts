'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { FormState } from '../../utils/types';

const formSchema = z.object({
  'choose-template': z.enum(['sms', 'email', 'nhs-app', 'letter'], {
    message: 'Select a template type',
  }),
});

export const chooseTemplateServerAction = (
  _: {},
  formData: FormData
): FormState => {
  const templateType = formData.get('choose-template');
  const form = {
    'choose-template': templateType,
  };

  const parsedForm = formSchema.safeParse(form);

  if (!parsedForm.success) {
    return parsedForm.error.flatten();
  }
  redirect(`/create-template/${templateType}`);
};
