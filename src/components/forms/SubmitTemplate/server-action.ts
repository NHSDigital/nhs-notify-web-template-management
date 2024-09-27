'use server';

import { redirect, RedirectType } from 'next/navigation';
import { getSession, saveTemplate, sendEmail } from '@utils/form-actions';
import { createTemplateFromSession, validateTemplate } from '@domain/templates';
import { logger } from '@utils/logger';
import { z } from 'zod';
import { TemplateType } from '@utils/types';

const $SessionIdSchema = z.string();

const routeMap: Record<TemplateType, string> = {
  [TemplateType.NHS_APP]: 'nhs-app-template-submitted',
  [TemplateType.EMAIL]: '404',
  [TemplateType.LETTER]: '404',
  [TemplateType.SMS]: 'text-message-template-submitted',
};

export async function submitTemplate(formData: FormData) {
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

    const route = routeMap[templateEntity.type!];

    return redirect(`/${route}/${templateEntity.id}`, RedirectType.push);
  } catch (error) {
    logger.error('Failed to submit template', {
      error,
      sessionId,
    });

    throw error;
  }
}
