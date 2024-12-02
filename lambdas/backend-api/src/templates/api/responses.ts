import { Failure, Success, TemplateDTO } from 'nhs-notify-backend-client';

export const apiSuccess = (statusCode: number, template: TemplateDTO) => ({
  statusCode,
  body: JSON.stringify({ statusCode, template } satisfies Success),
});

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
