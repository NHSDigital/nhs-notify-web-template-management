import { ITemplateClient } from 'nhs-notify-backend-client';
import { templateRepository } from '@backend-api/templates/domain/template';
import { logger, success } from '@backend-api/utils/index';

export const listTemplates: ITemplateClient['listTemplates'] = async (
  token
) => {
  const listResult = await templateRepository.list(token);

  if (listResult.error) {
    logger.error('Failed to list templates', { listResult });

    return listResult;
  }

  return success(listResult.data);
};
