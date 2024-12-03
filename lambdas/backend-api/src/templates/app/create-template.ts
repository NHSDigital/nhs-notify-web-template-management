import { ITemplateClient } from 'nhs-notify-backend-client';
import {
  templateRepository,
  $CreateTemplateSchema,
} from '@backend-api/templates/domain/template';
import { validate, logger } from '@backend-api/utils/index';
import { success } from '@backend-api/utils/result';

export const createTemplate: ITemplateClient['createTemplate'] = async (
  dto,
  token
) => {
  const log = logger.child({
    dto,
  });

  const validationResult = await validate($CreateTemplateSchema, dto);

  if (validationResult.error) {
    log.error('Request failed validation', {
      validationResult,
      dto,
    });

    return validationResult;
  }

  const createResult = await templateRepository.create(
    validationResult.data,
    token
  );

  if (createResult.error) {
    log.error('Failed to save template to the database', {
      createResult,
    });

    return createResult;
  }

  return success(createResult.data);
};
