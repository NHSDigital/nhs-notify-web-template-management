import { Result, success, TemplateDTO } from 'nhs-notify-templates-client';
import { templateRepository } from '../domain/template';
import { userRepository } from '../domain/user';
import { logger } from '../utils';

export async function getTemplate(
  templateId: string,
  token: string
): Promise<Result<TemplateDTO>> {
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
}
