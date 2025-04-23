'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getTemplate, requestTemplateProof } from '@utils/form-actions';
import { z } from 'zod';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

const $TemplateIdSchema = z.string();

export async function requestProof(route: string, formData: FormData) {
  const { success, data: templateId } = $TemplateIdSchema.safeParse(
    formData.get('templateId')
  );

  if (!success) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  try {
    await requestTemplateProof(templateId);
  } catch (error) {
    logger.error('Failed to request template proof', {
      error,
      templateId,
    });

    throw error;
  }

  return redirect(`/${route}/${templateId}`, RedirectType.push);
}
