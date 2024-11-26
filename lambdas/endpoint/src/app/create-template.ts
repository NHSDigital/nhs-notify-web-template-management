import {
  CreateTemplateInput,
  ErrorCase,
  failure,
  Result,
  success,
  TemplateDTO,
} from 'nhs-notify-templates-client';
import { templateRepository, $CreateTemplateSchema } from '../domain/template';
import { userRepository } from '../domain/user';
import { validate, logger } from '../utils';

export async function createTemplate(
  dto: CreateTemplateInput,
  token: string
): Promise<Result<TemplateDTO>> {
  const userResult = await userRepository.getUser(token);

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

  if (!createResult.data) {
    log.error(
      'Database returned undefined template but did not throw an error'
    );

    return failure(ErrorCase.TEMPLATE_NOT_CREATED, 'Template not created');
  }

  return success(createResult.data);
}
