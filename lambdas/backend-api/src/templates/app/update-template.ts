import { ITemplateClient } from 'nhs-notify-backend-client';
import {
  templateRepository,
  $UpdateTemplateSchema,
} from '@backend-api/templates/domain/template';
import { validate, logger, success } from '@backend-api/utils/index';

export const updateTemplate: ITemplateClient['updateTemplate'] = async (
  templateId,
  dto,
  token
) => {
  const log = logger.child({
    templateId,
    dto,
  });

  const validationResult = await validate($UpdateTemplateSchema, dto);

  if (validationResult.error) {
    log.error('Invalid template', { validationResult });

    return validationResult;
  }

  const updateResult = await templateRepository.update(
    templateId,
    validationResult.data,
    token
  );

  if (updateResult.error) {
    log.error('Failed to update template', { updateResult });

    return updateResult;
  }

  return success(updateResult.data);
};
