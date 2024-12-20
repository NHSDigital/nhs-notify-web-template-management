import {
  Failure,
  Success,
  SuccessList,
  TemplateDTO,
} from 'nhs-notify-backend-client';

export const apiSuccess = (
  statusCode: number,
  result: TemplateDTO | TemplateDTO[]
) => {
  if (Array.isArray(result)) {
    return {
      statusCode,
      body: JSON.stringify({
        statusCode,
        templates: result,
      } satisfies SuccessList),
    };
  }

  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      template: result,
    } satisfies Success),
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
