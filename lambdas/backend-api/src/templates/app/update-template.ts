import { ITemplateClient } from 'nhs-notify-backend-client';
import {
  templateRepository,
  $UpdateTemplateSchema,
} from '@backend-api/templates/domain/template';
import { userRepository } from '@backend-api/templates/domain/user';
import { validate, logger, success } from '@backend-api/utils/index';

export const updateTemplate: ITemplateClient['updateTemplate'] = async (
  templateId,
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
    templateId,
    validationResult.data,
    userResult.data.id
  );

  if (updateResult.error) {
    log.error('Failed to update template', { updateResult });

    return updateResult;
  }

  return success(updateResult.data);
};
