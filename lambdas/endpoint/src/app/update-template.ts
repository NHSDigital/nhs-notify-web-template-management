import {
  ITemplateClient,
  Result,
  success,
  TemplateDTO,
  UpdateTemplateInput,
} from 'nhs-notify-templates-client';
import { templateRepository, $UpdateTemplateSchema } from '../domain/template';
import { userRepository } from '../domain/user';
import { validate, logger } from '../utils';

export const updateTemplate: ITemplateClient['updateTemplate'] = async (
  dto: UpdateTemplateInput,
  token: string
): Promise<Result<TemplateDTO>> => {
  const userResult = await userRepository.getUser(token);

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
