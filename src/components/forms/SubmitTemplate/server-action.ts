'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getTemplate, saveTemplate, sendEmail } from '@utils/form-actions';
import { logger } from '@utils/logger';
import { z } from 'zod';
import { validateChannelTemplate } from '@utils/validate-template';

const $TemplateIdSchema = z.string();

export async function submitTemplate(route: string, formData: FormData) {
  const { success, data: templateId } = $TemplateIdSchema.safeParse(
    formData.get('templateId')
  );

  if (!success) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const template = await getTemplate(templateId);

  const validatedTemplate = validateChannelTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  try {
    await saveTemplate({
      ...validatedTemplate,
    });

    const { name, subject, message } = { subject: null, ...validatedTemplate };
    await sendEmail(templateId, name, message, subject);
  } catch (error) {
    logger.error('Failed to submit template', {
      error,
      templateId,
    });

    throw error;
  }

  return redirect(`/${route}/${templateId}`, RedirectType.push);
}
