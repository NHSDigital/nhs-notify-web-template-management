'use server';

import { getSession, saveTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { DbOperationException } from '../../../domain/errors/db-operation.exception';
import { ValidationException } from '../../../domain/errors/validation.exception';
import { templateFactory } from '../../../infra/template-factory';

export async function submitTemplate(formData: FormData) {
  const sessionId = String(formData.get('sessionId'));

  const session = await getSession(sessionId);

  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  // TODO: I'm not a huge fan of this TBH
  const template = templateFactory(session);

  const result = template.validate();

  if (!result.valid) {
    console.log(result);
    // TODO: I think these exceptions are badly constructed
    throw new ValidationException({
      message: `${template.type} template is invalid`,
      sessionId,
      cause: result.errors,
    });
  }

  const { data, errors } = await saveTemplate(template);

  // TODO: Why do I need to check both sides...
  if (errors || !data) {
    // TODO: I think these exceptions are badly constructed
    throw new DbOperationException({
      message: `Failed to saving ${template.type} template`,
      sessionId,
      cause: errors,
    });
  }

  // TODO: send email

  return redirect(
    `/nhs-app-template-submitted/${data.id}`,
    RedirectType.replace
  );
}
