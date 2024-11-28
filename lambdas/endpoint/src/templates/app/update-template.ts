import { ITemplateClient, success } from 'nhs-notify-templates-client';
import { templateRepository, $UpdateTemplateSchema } from '@templates/domain/template';
import { userRepository } from '@templates/domain/user';
import { validate, logger } from '@utils/index';

export const updateTemplate: ITemplateClient['updateTemplate'] = async (
  dto,
  token
) => {
  const userResult = userRepository.getUser(token);

  if (userResult.error) {
    logger.error('User not found', {
      dto,
      userResult,
    });

    return userResult;
  }

  const log = logger.child({
    dto,
    user: userResult.data,
  });

  const validationResult = validate($UpdateTemplateSchema, dto);

  if (validationResult.error) {
    log.error('Invalid template', { validationResult });

    return validationResult;
  }

  const updateResult = await templateRepository.update(
    validationResult.data,
    userResult.data.id
  );

  if (updateResult.error) {
    log.error('Failed to update template', { updateResult });

    return updateResult;
  }

  return success(updateResult.data);
};
