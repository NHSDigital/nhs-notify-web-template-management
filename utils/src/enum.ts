import { TemplateType, TemplateStatus } from 'nhs-notify-backend-client';

// eslint-disable-next-line unicorn/prefer-export-from
export { TemplateType, TemplateStatus };

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'NHS App message',
    [TemplateType.SMS]: 'Text message (SMS)',
    [TemplateType.EMAIL]: 'Email',
  })[type];

export const templateStatustoDisplayMappings = (status: TemplateStatus) =>
  ({
    [TemplateStatus.NOT_YET_SUBMITTED]: 'Not yet submitted',
    [TemplateStatus.SUBMITTED]: 'Submitted',
  })[status];

export const templateTypeToUrlTextMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'nhs-app',
    [TemplateType.SMS]: 'text-message',
    [TemplateType.EMAIL]: 'email',
  })[type];

export const previewTemplatePages = (type: TemplateType) =>
  `preview-${templateTypeToUrlTextMappings(type)}-template`;
export const viewSubmittedTemplatePages = (type: TemplateType) =>
  `view-submitted-${templateTypeToUrlTextMappings(type)}-template`;
