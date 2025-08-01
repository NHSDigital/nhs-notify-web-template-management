'use server';

import { uploadLetterTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import {
  UploadLetterTemplate,
  LetterTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { $UploadLetterTemplateForm } from './form-schema';

export async function processFormActions(
  formState: TemplateFormState<UploadLetterTemplate | LetterTemplate>,
  formData: FormData
): Promise<TemplateFormState<UploadLetterTemplate>> {
  const parsedForm = $UploadLetterTemplateForm.safeParse(
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

  const updatedTemplate: UploadLetterTemplate = {
    ...formState,
    name: letterTemplateName,
    letterType: letterTemplateLetterType,
    language: letterTemplateLanguage,
  };

  if ('id' in updatedTemplate) {
    throw new Error('Update is not available for letter templates');
  }

  const savedTemplate = await uploadLetterTemplate(
    updatedTemplate,
    letterTemplatePdf,
    letterTemplateCsv
  );

  return redirect(
    `/preview-letter-template/${savedTemplate.id}?from=edit`,
    RedirectType.push
  );
}
