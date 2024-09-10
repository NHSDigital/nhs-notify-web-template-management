'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getSession, saveTemplate } from '@utils/form-actions';
import { createTemplateFromSession, validateTemplate } from '@domain/templates';
import { logger } from '@utils/logger';

export async function submitTemplate(formData: FormData) {
  const sessionId = String(formData.get('sessionId'));

  const session = await getSession(sessionId);

  if (!session) {
    return redirect('/invalid-session', RedirectType.push);
  }

  try {
    const templateDTO = createTemplateFromSession(session);

    const validatedTemplate = validateTemplate(templateDTO);

    const templateEntity = await saveTemplate(validatedTemplate);

    // TODO: send email

    // TODO: delete session

    return redirect(
      `/nhs-app-template-submitted/${templateEntity.id}`,
      RedirectType.push
    );
  } catch (error) {
    logger.error('Failed to submit template', {
      error,
      sessionId,
    });

    throw error;
  }
}
