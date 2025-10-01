'use server';

import { z } from 'zod';
import { uploadLetterTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import {
  UploadLetterTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { $UploadLetterTemplateForm } from './form-schema';

export async function processFormActions(
  formState: TemplateFormState<UploadLetterTemplate>,
  formData: FormData
): Promise<TemplateFormState<UploadLetterTemplate>> {
  const parsedForm = $UploadLetterTemplateForm.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      errorState: z.flattenError(parsedForm.error),
    };
  }

  delete formState.errorState;

  const {
    letterTemplateName,
    letterTemplateCampaignId,
    letterTemplateLetterType,
    letterTemplateLanguage,
    letterTemplatePdf,
    letterTemplateCsv,
  } = parsedForm.data;

  const updatedTemplate: UploadLetterTemplate = {
    ...formState,
    name: letterTemplateName,
    campaignId: letterTemplateCampaignId,
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
