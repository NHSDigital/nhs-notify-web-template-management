export const templateTypeDisplayMappings: Record<string, string> = {
  NHS_APP: 'NHS App message',
  SMS: 'Text message (SMS)',
  EMAIL: 'Email',
  LETTER: 'Letter',
};

export const templateTypeToUrlTextMappings: Record<string, string> = {
  NHS_APP: 'nhs-app',
  SMS: 'text-message',
  EMAIL: 'email',
  LETTER: 'letter',
};

export type File = {
  fileName: string;
  currentVersion: string;
  virusScanStatus: string;
};

type TypeSpecificProperties = {
  message?: string;
  subject?: string;
  letterType?: string;
  language?: string;
  files?: {
    pdfTemplate?: File;
    testDataCsv?: File;
    proofs?: Record<string, Pick<File, 'fileName' | 'virusScanStatus'>>;
  };
  personalisationParameters?: string[];
  testDataCsvHeaders?: string[];
};

export type CreateTemplatePayload = TypeSpecificProperties & {
  clientId: string;
  name: string;
  templateType: string;
  userId: string;
};

export type UpdateTemplatePayload = TypeSpecificProperties & {
  clientId: string;
  name: string;
  templateType: string;
  templateStatus: string;
  userId: string;
};

export type Template = TypeSpecificProperties & {
  clientId: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  version: number;
  name: string;
  templateType: string;
  templateStatus: string;
  owner: string;
  userId: string;
};
