'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getTemplate, setTemplateToSubmitted } from '@utils/form-actions';
import { z } from 'zod';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import {
  templateTypeToUrlTextMappings,
  validateTemplate,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateType } from 'nhs-notify-backend-client';

export async function submitTemplate(
  channel: TemplateType,
  formData: FormData
) {
  const { success, data: templateId } = z
    .uuidv4()
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

  const channelRedirectSegment = templateTypeToUrlTextMappings(channel);

  return redirect(
    `/${channelRedirectSegment}-template-submitted/${templateId}`,
    RedirectType.push
  );
}
