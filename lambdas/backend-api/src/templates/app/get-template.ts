import { ITemplateClient } from 'nhs-notify-backend-client';
import { templateRepository } from '@backend-api/templates/domain/template';
import { userRepository } from '@backend-api/templates/domain/user';
import { logger, success } from '@backend-api/utils/index';

export const getTemplate: ITemplateClient['getTemplate'] = async (
  templateId,
  token
) => {
  const userResult = await userRepository.getUser(token);

  if (userResult.error) {
    logger.error('User not found', {
      userResult,
      templateId,
    });

    return userResult;
  }

  const log = logger.child({
    templateId,
    user: userResult.data,
  });

  const getResult = await templateRepository.get(
    templateId,
    userResult.data.id
  );

  if (getResult.error) {
    log.error('Failed to get template', { getResult });

    return getResult;
  }

  return success(getResult.data);
};
