import {
  Language,
  LetterType,
  VirusScanStatus,
} from 'nhs-notify-backend-client';

export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
}

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    NHS_APP: 'NHS App message',
    SMS: 'Text message (SMS)',
    EMAIL: 'Email',
    LETTER: 'Letter',
  })[type];

export const templateTypeToUrlTextMappings = (type: TemplateType) =>
  ({
    NHS_APP: 'nhs-app',
    SMS: 'text-message',
    EMAIL: 'email',
    LETTER: 'letter',
  })[type];

export enum TemplateStatus {
  NOT_YET_SUBMITTED = 'NOT_YET_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
}

type File = {
  fileName: string;
  currentVersion?: string;
  virusScanStatus: VirusScanStatus;
};

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
  files?: {
    pdfTemplate?: File;
    testDataCsv: File;
    proofs?: File[];
  };
  owner: string;
};
