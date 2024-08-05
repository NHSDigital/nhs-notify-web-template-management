'use server';

import { z } from 'zod';
import {
  handleForm as handleNHSAppForm,
  handleFormBack as handleNHSFormBack,
} from '@forms/ReviewNHSAppTemplate';
import { removeUndefinedFromObject } from '@/src/utils/remove-undefined';
import { FormId, Session, TemplateFormState } from '@utils/types';
import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { saveSession } from '@utils/form-actions';
import { chooseTemplateAction } from './choose-template-action';

const serverActions: Partial<
  Record<
    FormId,
    (formState: TemplateFormState, formData: FormData) => TemplateFormState
  >
> = {
  'choose-template': chooseTemplateAction,
  'create-nhs-app-template-back': (
    formState: TemplateFormState,
    formData: FormData
  ) =>
    zodValidationServerAction(
      formState,
      formData,
      z.object({
        nhsAppTemplateName: z.string({ message: 'Internal server error' }),
        nhsAppTemplateMessage: z.string({ message: 'Internal server error' }),
      }),
      'choose-template'
    ),
  'create-nhs-app-template': (
    formState: TemplateFormState,
    formData: FormData
  ) =>
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

export const mainServerAction = async (
  formState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> => {
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

  const serverActionResult = serverAction(formState, formData);
  if (serverActionResult.validationError) {
    return serverActionResult;
  }

  const session: Session = removeUndefinedFromObject({
    id: serverActionResult.sessionId,
    templateType: serverActionResult.templateType,
    nhsAppTemplateName: serverActionResult.nhsAppTemplateName,
    nhsAppTemplateMessage: serverActionResult.nhsAppTemplateMessage,
  });

  await saveSession(session);

  return serverActionResult;
};
