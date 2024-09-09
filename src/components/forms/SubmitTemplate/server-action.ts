'use server';

import { getSession, saveTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { templateFromSessionMapper, validateTemplate } from '@domain/templates';
import { logger } from '@utils/logger';

export async function submitTemplate(formData: FormData) {
  const sessionId = String(formData.get('sessionId'));

  const session = await getSession(sessionId);

  if (!session) {
    return redirect('/invalid-session', RedirectType.push);
  }

  try {
    if (session.templateType === 'UNKNOWN') {
      throw new Error('Unknown template type');
    }

    const templateDTO = templateFromSessionMapper(
      session.templateType,
      session
    );

    const validatedTemplate = validateTemplate(
      session.templateType,
      templateDTO
    );

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
