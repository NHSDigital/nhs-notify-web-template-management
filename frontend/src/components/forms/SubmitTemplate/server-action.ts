'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getTemplate, setTemplateToSubmitted } from '@utils/form-actions';
import { z } from 'zod';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { validateTemplate } from 'nhs-notify-web-template-management-utils';

export async function submitTemplate(route: string, formData: FormData) {
  const { success, data: templateId } = z
    .string()
    .safeParse(formData.get('templateId'));

  if (!success) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  try {
    await setTemplateToSubmitted(templateId);
  } catch (error) {
    logger.error('Failed to submit template', {
      error,
      templateId,
    });

    throw error;
  }

  return redirect(`/${route}/${templateId}`, RedirectType.push);
}
