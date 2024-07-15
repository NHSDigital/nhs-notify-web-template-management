'use server';

import { z } from 'zod';
import {
  handleForm as handleNHSAppForm,
  handleFormBack as handleNHSFormBack,
} from '@forms/ReviewNHSAppTemplate';
import { FormState, FormId } from '../../utils/types';
import { zodValidationServerAction } from '../../utils/zod-validation-server-action';

const serverActions: Partial<
  Record<FormId, (formState: FormState, formData: FormData) => FormState>
> = {
  'choose-template': (formState: FormState, formData: FormData) =>
    zodValidationServerAction(
      formState,
      formData,
      z.object({
        page: z.enum(
          [
            'create-sms-template',
            'create-email-template',
            'create-nhs-app-template',
            'create-letter-template',
          ],
          { message: 'Select a template type' }
        ),
      })
    ),
  'create-nhs-app-template-back': (formState: FormState, formData: FormData) =>
    zodValidationServerAction(
      formState,
      formData,
      z.object({
        nhsAppTemplateName: z.string({ message: 'Internal server error' }),
        nhsAppTemplateMessage: z.string({ message: 'Internal server error' }),
      }),
      'choose-template'
    ),
  'create-nhs-app-template': (formState: FormState, formData: FormData) =>
    zodValidationServerAction(
      formState,
      formData,
      z.object({
        nhsAppTemplateName: z
          .string()
          .min(1, { message: 'Enter a template name' }),
        nhsAppTemplateMessage: z
          .string()
          .min(1, { message: 'Enter a template message' })
          .max(5000, { message: 'Template message too long' }),
      }),
      'review-nhs-app-template'
    ),
  'review-nhs-app-template': handleNHSAppForm,
  'review-nhs-app-template-back': handleNHSFormBack,
};

const schema = z.object({
  formId: z.enum(
    [
      'choose-template',
      'create-nhs-app-template-back',
      'create-nhs-app-template',
      'create-sms-template',
      'review-nhs-app-template',
      'review-nhs-app-template-back',
      'submit-template',
    ],
    { message: 'Internal server error' }
  ),
});

export const mainServerAction = (
  formState: FormState,
  formData: FormData
): FormState => {
  const formId = formData.get('form-id');

  const parsedFormId = schema.safeParse({ formId });

  if (!parsedFormId.success) {
    return {
      ...formState,
      validationError: parsedFormId.error.flatten(),
    };
  }

  const serverAction = serverActions[parsedFormId.data.formId];

  if (!serverAction) {
    return {
      ...formState,
      validationError: {
        formErrors: ['Internal server error'],
        fieldErrors: {},
      },
    };
  }

  return serverAction(formState, formData);
};
