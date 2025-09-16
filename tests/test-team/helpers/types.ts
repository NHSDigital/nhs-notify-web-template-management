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

export type ProofFile = {
  fileName: string;
  supplier: string;
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
    proofs?: Record<string, ProofFile>;
  };
  personalisationParameters?: string[];
  testDataCsvHeaders?: string[];
};

export type CreateTemplatePayload = TypeSpecificProperties & {
  name: string;
  templateType: string;
};

export type UpdateTemplatePayload = TypeSpecificProperties & {
  name: string;
  templateType: string;
  templateStatus: string;
};

export type Template = TypeSpecificProperties & {
  campaignId?: string;
  clientId?: string;
  createdAt: string;
  id: string;
  name: string;
  owner: string;
  templateStatus: string;
  templateType: string;
  updatedAt: string;
  version: number;
  proofingEnabled?: boolean;
};

export type RoutingConfig = {
  id: string;
  owner: string;
  status: 'DELETED' | 'DRAFT';
};
