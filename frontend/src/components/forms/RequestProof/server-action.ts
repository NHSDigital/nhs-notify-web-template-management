'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getTemplate, requestTemplateProof } from '@utils/form-actions';
import { z } from 'zod';
import {
  templateTypeToUrlTextMappings,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { $LockNumber, TemplateType } from 'nhs-notify-backend-client';

const $RequestProofFormData = z.object({
  templateId: z.uuidv4(),
  lockNumber: $LockNumber,
});

export async function requestProof(channel: TemplateType, formData: FormData) {
  const { success, data } = $RequestProofFormData.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!success) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { templateId, lockNumber } = data;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  try {
    await requestTemplateProof(templateId, lockNumber);
  } catch (error) {
    logger.error('Failed to request template proof', {
      error,
      templateId,
    });

    throw error;
  }

  const channelRedirectSegment = templateTypeToUrlTextMappings(channel);

  return redirect(
    `/preview-${channelRedirectSegment}-template/${templateId}`,
    RedirectType.push
  );
}
