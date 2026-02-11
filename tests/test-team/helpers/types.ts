import type {
  Channel,
  CreateRoutingConfig,
  RoutingConfig,
  Language,
  LetterType,
} from 'nhs-notify-backend-client';

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

export const expectedChannelLabels: Record<Channel, string> = {
  NHSAPP: 'NHS App',
  SMS: 'Text message (SMS)',
  EMAIL: 'Email',
  LETTER: 'Standard English letter',
};

export const allChannels: Channel[] = ['NHSAPP', 'EMAIL', 'SMS', 'LETTER'];

export const ordinals = ['first', 'second', 'third', 'fourth', 'fifth'];

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

export type AuthoringRenderFile = {
  fileName: string;
  currentVersion: string;
  status: string;
  pageCount: number;
};

type TypeSpecificProperties = {
  message?: string;
  subject?: string;
  letterType?: string;
  letterVersion?: string;
  language?: string;
  files?: {
    // PDF letter files
    pdfTemplate?: File;
    testDataCsv?: File;
    proofs?: Record<string, ProofFile>;
    // Authoring letter files
    initialRender?: AuthoringRenderFile;
    shortFormRender?: AuthoringRenderFile;
    longFormRender?: AuthoringRenderFile;
  };
  personalisationParameters?: string[];
  testDataCsvHeaders?: string[];
  campaignId?: string;
  supplierReferences?: Record<string, string>;
  letterVariantId?: string;
  // Authoring letter custom personalisation
  customPersonalisation?: string[];
  systemPersonalisation?: string[];
  // Validation errors for authoring letters
  validationErrors?: string[];
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
  lockNumber: number;
  owner: string;
  templateStatus: string;
  templateType: string;
  updatedAt: string;
  version: number;
  proofingEnabled?: boolean;
};

export type RoutingConfigDbEntry = RoutingConfig & {
  owner: string;
  updatedBy: string;
  createdBy: string;
};

export type FactoryRoutingConfig = {
  apiPayload: CreateRoutingConfig;
  apiResponse: RoutingConfig;
  dbEntry: RoutingConfigDbEntry;
};

export type FactoryRoutingConfigWithModifiers = FactoryRoutingConfig & {
  addTemplate: (
    channel: Channel,
    templateId?: string
  ) => FactoryRoutingConfigWithModifiers;
  withTemplates: (...channels: Channel[]) => FactoryRoutingConfigWithModifiers;
  addLanguageTemplate: (
    language: Language,
    templateId?: string
  ) => FactoryRoutingConfigWithModifiers;
  addAccessibleFormatTemplate: (
    accessibleFormat: LetterType,
    templateId?: string
  ) => FactoryRoutingConfigWithModifiers;
};
