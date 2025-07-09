import {
  Failure,
  TemplateSuccess,
  TemplateSuccessList,
  TemplateDto,
} from 'nhs-notify-backend-client';

export const apiSuccess = (
  statusCode: number,
  result: TemplateDto | TemplateDto[]
) => {
  if (Array.isArray(result)) {
    return {
      statusCode,
      body: JSON.stringify({
        statusCode,
        templates: result,
      } satisfies TemplateSuccessList),
    };
  }

  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      template: result,
    } satisfies TemplateSuccess),
  };
};

export const apiFailure = (
  statusCode: number,
  technicalMessage: string,
  details?: unknown
) => ({
  statusCode,
  body: JSON.stringify({
    statusCode,
    technicalMessage,
    details,
  } satisfies Failure),
});
