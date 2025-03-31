'use server';

import { createLetterTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import {
  CreateUpdateLetterTemplate,
  LetterTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { $CreateUpdateLetterTemplate } from './form-schema';

export async function processFormActions(
  formState: TemplateFormState<CreateUpdateLetterTemplate | LetterTemplate>,
  formData: FormData
): Promise<TemplateFormState<CreateUpdateLetterTemplate>> {
  const parsedForm = $CreateLetterTemplateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  delete formState.validationError;

  const {
    letterTemplateName,
    letterTemplateLetterType,
    letterTemplateLanguage,
    letterTemplatePdf,
    letterTemplateCsv,
  } = parsedForm.data;

  const updatedTemplate: CreateUpdateLetterTemplate = {
    ...formState,
    name: letterTemplateName,
    letterType: letterTemplateLetterType,
    language: letterTemplateLanguage,
  };

  if ('id' in updatedTemplate) {
    throw new Error('Update is not available for letter templates');
  }

  const savedTemplate = await createLetterTemplate(
    updatedTemplate,
    letterTemplatePdf,
    letterTemplateCsv
  );

  return redirect(
    `/preview-letter-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
