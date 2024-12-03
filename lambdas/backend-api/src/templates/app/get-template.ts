import { ITemplateClient } from 'nhs-notify-backend-client';
import { templateRepository } from '@backend-api/templates/domain/template';
import { logger, success } from '@backend-api/utils/index';

export const getTemplate: ITemplateClient['getTemplate'] = async (
  templateId,
  token
) => {
  const getResult = await templateRepository.get(templateId, token);

  if (getResult.error) {
    logger.error('Failed to get template', { getResult });

    return getResult;
  }

  return success(getResult.data);
};
