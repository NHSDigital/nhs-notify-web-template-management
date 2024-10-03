'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getSession, saveTemplate, sendEmail } from '@utils/form-actions';
import { createTemplateFromSession, validateTemplate } from '@domain/templates';
import { logger } from '@utils/logger';
import { z } from 'zod';

const $SessionIdSchema = z.string();

export async function submitTemplate(route: string, formData: FormData) {
  const { success, data: sessionId } = $SessionIdSchema.safeParse(
    formData.get('sessionId')
  );

  if (!success) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  const session = await getSession(sessionId);

  if (!session) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  try {
    const templateDTO = createTemplateFromSession(session);

    const validatedTemplate = validateTemplate(templateDTO);

    const templateEntity = await saveTemplate(validatedTemplate);

    await sendEmail(
      templateEntity.id,
      templateEntity.name,
      templateEntity.fields!.content
    );

    return redirect(`/${route}/${templateEntity.id}`, RedirectType.push);
  } catch (error) {
    logger.error('Failed to submit template', {
      error,
      sessionId,
    });

    throw error;
  }
}
