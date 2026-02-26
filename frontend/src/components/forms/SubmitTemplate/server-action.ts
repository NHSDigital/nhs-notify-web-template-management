'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getTemplate, setTemplateToSubmitted } from '@utils/form-actions';
import { z } from 'zod';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import {
  legacyTemplateTypeToUrlTextMappings,
  validateTemplate,
} from 'nhs-notify-web-template-management-utils';
import { $LockNumber } from 'nhs-notify-backend-client';
import type { TemplateType } from 'nhs-notify-web-template-management-types';

const $SubmitTemplateFormData = z.object({
  templateId: z.uuidv4(),
  lockNumber: $LockNumber,
});

export async function submitTemplate(
  {
    channel,
    routingEnabled,
  }: { channel: TemplateType; routingEnabled?: boolean },
  formData: FormData
) {
  const { success, data } = $SubmitTemplateFormData.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!success) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { templateId, lockNumber } = data;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  try {
    await setTemplateToSubmitted(templateId, lockNumber);
  } catch (error) {
    logger.error('Failed to submit template', {
      error,
      templateId,
    });

    throw error;
  }

  if (routingEnabled && channel === 'LETTER') {
    return redirect('/message-templates', RedirectType.push);
  }

  const channelRedirectSegment = legacyTemplateTypeToUrlTextMappings(channel);

  return redirect(
    `/${channelRedirectSegment}-template-submitted/${templateId}`,
    RedirectType.push
  );
}
