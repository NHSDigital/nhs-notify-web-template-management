export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum TemplateStatus {
  NOT_YET_SUBMITTED = 'NOT_YET_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
}

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'NHS App',
    [TemplateType.SMS]: 'Text message (SMS)',
    [TemplateType.EMAIL]: 'Email',
  })[type];

export const templateStatustoDisplayMappings = (status: TemplateStatus) =>
  ({
    [TemplateStatus.NOT_YET_SUBMITTED]: 'Not yet submitted',
    [TemplateStatus.SUBMITTED]: 'Submitted',
  })[status];

export const previewTemplatePages = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'preview-nhs-app-template',
    [TemplateType.SMS]: 'preview-text-message-template',
    [TemplateType.EMAIL]: 'preview-email-template',
  })[type];

export const viewSubmittedTemplatePages = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'view-submitted-nhs-app-template',
    [TemplateType.SMS]: 'view-submitted-text-message-template',
    [TemplateType.EMAIL]: 'view-submitted-email-template',
  })[type];
