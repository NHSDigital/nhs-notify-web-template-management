import { ITemplateClient, success } from 'nhs-notify-templates-client';
import { templateRepository } from '../domain/template';
import { userRepository } from '../domain/user';
import { logger } from '../utils';

export const getTemplate: ITemplateClient['getTemplate'] = async (
  templateId,
  token
) => {
  const userResult = userRepository.getUser(token);

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
