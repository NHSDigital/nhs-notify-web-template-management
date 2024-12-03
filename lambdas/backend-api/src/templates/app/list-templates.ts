import { ITemplateClient } from 'nhs-notify-backend-client';
import { templateRepository } from '@backend-api/templates/domain/template';
import { userRepository } from '@backend-api/templates/domain/user';
import { logger, success } from '@backend-api/utils/index';

export const listTemplates: ITemplateClient['listTemplates'] = async (
  token
) => {
  const userResult = await userRepository.getUser(token);

  if (userResult.error) {
    logger.error('User not found', {
      userResult,
    });

    return userResult;
  }

  const log = logger.child({
    user: userResult.data,
  });

  const listResult = await templateRepository.list(userResult.data.id);

  if (listResult.error) {
    log.error('Failed to list templates', { listResult });

    return listResult;
  }

  return success(listResult.data);
};
