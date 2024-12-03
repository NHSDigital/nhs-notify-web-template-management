import {
  Failure,
  Success,
  SuccessList,
  TemplateDTO,
} from 'nhs-notify-backend-client';

type SuccessResponse = Success | SuccessList;

export const apiSuccess = (
  statusCode: number,
  result: TemplateDTO | TemplateDTO[]
) => {
  if (Array.isArray(result)) {
    return {
      statusCode,
      body: JSON.stringify({
        statusCode,
        items: result,
      } satisfies SuccessList),
    };
  }

  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      template: result,
    } satisfies SuccessResponse),
  };
};

export const apiFailure = (
  statusCode: number,
  technicalMessage: string,
  details?: Record<string, string>
) => ({
  statusCode,
  body: JSON.stringify({
    statusCode,
    technicalMessage,
    details,
  } satisfies Failure),
});
