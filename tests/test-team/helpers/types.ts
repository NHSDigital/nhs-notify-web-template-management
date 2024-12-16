export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'NHS App message',
    [TemplateType.SMS]: 'Text message (SMS)',
    [TemplateType.EMAIL]: 'Email',
    [TemplateType.LETTER]: 'Letter',
  })[type];

export enum TemplateStatus {
  NOT_YET_SUBMITTED = 'NOT_YET_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
}

export type Template = {
  __typename: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  version: number;
  name: string;
  message: string;
  subject?: string;
  templateType: TemplateType;
  templateStatus: TemplateStatus;
};
