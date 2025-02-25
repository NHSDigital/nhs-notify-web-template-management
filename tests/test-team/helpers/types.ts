import { Language, LetterType } from 'nhs-notify-backend-client';

export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
}

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'NHS App message',
    [TemplateType.SMS]: 'Text message (SMS)',
    [TemplateType.EMAIL]: 'Email',
    [TemplateType.LETTER]: 'Letter',
  })[type];

export const templateTypeToUrlTextMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'nhs-app',
    [TemplateType.SMS]: 'text-message',
    [TemplateType.EMAIL]: 'email',
    [TemplateType.LETTER]: 'letter',
  })[type];

export enum TemplateStatus {
  NOT_YET_SUBMITTED = 'NOT_YET_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
}

export type Template = {
  createdAt: string;
  updatedAt: string;
  id: string;
  version: number;
  name: string;
  message: string;
  subject?: string;
  templateType: TemplateType;
  templateStatus: TemplateStatus;
  letterType?: LetterType;
  language?: Language;
  pdfTemplateInputFile?: string;
  testPersonalisationInputFile?: string;
  owner: string;
};
