'use server';

import { redirect, RedirectType } from 'next/navigation';
import {
  deleteSession,
  getSession,
  saveTemplate,
  sendEmail,
} from '@utils/form-actions';
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

  let templateId;
  try {
    const templateDTO = createTemplateFromSession(session);

    const validatedTemplate = validateTemplate(templateDTO);

    const templateEntity = await saveTemplate(validatedTemplate);

    templateId = templateEntity.id;
    const promises = [
      deleteSession(sessionId),
      sendEmail(
        templateId,
        templateEntity.name,
        templateEntity.fields!.content,
        templateEntity.fields!.subjectLine
      ),
    ];

    await Promise.all(promises);
  } catch (error) {
    logger.error('Failed to submit template', {
      error,
      sessionId,
    });

    throw error;
  }

  return redirect(`/${route}/${templateId}`, RedirectType.push);
}
