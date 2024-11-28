import { TemplateDTO } from 'nhs-notify-templates-client';

export const success = (statusCode: number, template: TemplateDTO) => ({
  statusCode,
  body: JSON.stringify({ statusCode, template }),
});

export const failure = (statusCode: number, technicalMessage: string) => ({
  statusCode,
  body: JSON.stringify({ statusCode, technicalMessage }),
});