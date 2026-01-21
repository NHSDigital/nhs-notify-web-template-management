'use server';

import { redirect, RedirectType } from 'next/navigation';
import { setTemplateToDeleted } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export const deleteTemplateNoAction = async () => {
  redirect('/message-templates', RedirectType.push);
};

export const deleteTemplateYesAction = async (
  template: TemplateDto
): Promise<never> => {
  /* istanbul ignore next */
  logger.info('Delete template action called', {
    templateId: template.id,
    lockNumber: template.lockNumber,
  });

  try {
    await setTemplateToDeleted(template.id, template.lockNumber);

    /* istanbul ignore next */
    logger.info(
      'Template deleted successfully, redirecting to templates list',
      {
        templateId: template.id,
      }
    );
    redirect('/message-templates', RedirectType.push);
  } catch (error) {
    /* istanbul ignore next */
    logger.error('Error during template deletion', {
      templateId: template.id,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

    if (error instanceof Error && error.message === 'TEMPLATE_IN_USE') {
      /* istanbul ignore next */
      logger.info('Redirecting to delete error page', {
        templateId: template.id,
      });
      return redirect(
        `/delete-template-error/${template.id}`,
        RedirectType.push
      );
    }

    throw error;
  }
};
