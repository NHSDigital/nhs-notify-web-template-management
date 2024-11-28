import { ITemplateClient, success } from 'nhs-notify-templates-client';
import {
  templateRepository,
  $CreateTemplateSchema,
} from '@backend-api/templates/domain/template';
import { userRepository } from '@backend-api/templates/domain/user';
import { validate, logger } from '@backend-api/utils/index';

export const createTemplate: ITemplateClient['createTemplate'] = async (
  dto,
  token
) => {
  const userResult = userRepository.getUser(token);

  if (userResult.error) {
    logger.error('User not found', {
      userResult,
    });

    return userResult;
  }

  const log = logger.child({
    dto,
    user: userResult.data,
  });

  const validationResult = validate($CreateTemplateSchema, dto);

  if (validationResult.error) {
    log.error('Request failed validation', {
      validationResult,
      dto,
    });

    return validationResult;
  }

  const createResult = await templateRepository.create(
    validationResult.data,
    userResult.data.id
  );

  if (createResult.error) {
    log.error('Failed to save template to the database', {
      createResult,
    });

    return createResult;
  }

  return success(createResult.data);
};
