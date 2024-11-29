import { TemplateDTO } from 'nhs-notify-backend-client';

export const apiSuccess = (statusCode: number, template: TemplateDTO) => ({
  statusCode,
  body: JSON.stringify({ statusCode, template }),
});

export const apiFailure = (statusCode: number, technicalMessage: string) => ({
  statusCode,
  body: JSON.stringify({ statusCode, technicalMessage }),
});
