export enum TemplateType {
  NHS_APP = 'NHS_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  LETTER = 'LETTER',
}

export enum TemplateStatus {
  NOT_YET_SUBMITTED = 'NOT_YET_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
}

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'NHS App message',
    [TemplateType.SMS]: 'Text message (SMS)',
    [TemplateType.EMAIL]: 'Email',
    [TemplateType.LETTER]: 'Letter',
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
    [TemplateType.LETTER]: 'letter',
  })[type];
