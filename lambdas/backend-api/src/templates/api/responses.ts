import { removeUndefinedFromObject } from '@backend-api/utils/remove-undefined';
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
        templates: result.map((item) => removeUndefinedFromObject(item)),
      } satisfies SuccessList),
    };
  }

  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      template: removeUndefinedFromObject(result),
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
