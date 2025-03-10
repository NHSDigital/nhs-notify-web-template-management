'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getTemplate, saveTemplate } from '@utils/form-actions';
import { z } from 'zod';
import {
  TemplateStatus,
  validateTemplate,
} from 'nhs-notify-web-template-management-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

const $TemplateIdSchema = z.string();

export async function submitTemplate(route: string, formData: FormData) {
  const { success, data: templateId } = $TemplateIdSchema.safeParse(
    formData.get('templateId')
  );

  if (!success) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  try {
    await saveTemplate(validatedTemplate.id, {
      ...validatedTemplate,
      templateStatus: TemplateStatus.SUBMITTED,
    });
  } catch (error) {
    logger.error('Failed to submit template', {
      error,
      templateId,
    });

    throw error;
  }

  return redirect(`/${route}/${templateId}`, RedirectType.push);
}
