import type { GuardDutyScanResultNotificationEventDetail } from 'aws-lambda';
import {
  CreateUpdateTemplate,
  Language,
  LetterFiles,
  LetterType,
  TemplateDto,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';

export type FormId =
  | 'choose-a-template-type'
  | 'create-nhs-app-template'
  | 'create-email-template'
  | 'create-text-message-template'
  | 'preview-nhs-app-template'
  | 'submit-template'
  | 'create-nhs-app-template-back'
  | 'create-email-template-back';

export type ErrorState = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

export type FormState<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  errorState?: ErrorState;
  fields?: Partial<T>;
};

export type CreateUpdateNHSAppTemplate = Extract<
  CreateUpdateTemplate,
  { templateType: 'NHS_APP' }
>;

export type CreateUpdateEmailTemplate = Extract<
  CreateUpdateTemplate,
  { templateType: 'EMAIL' }
>;
export type CreateUpdateSMSTemplate = Extract<
  CreateUpdateTemplate,
  { templateType: 'SMS' }
>;

export type UploadLetterTemplate = Extract<
  CreateUpdateTemplate,
  { templateType: 'LETTER' }
>;

export type NHSAppTemplate = Extract<TemplateDto, { templateType: 'NHS_APP' }>;

export type EmailTemplate = Extract<TemplateDto, { templateType: 'EMAIL' }>;

export type SMSTemplate = Extract<TemplateDto, { templateType: 'SMS' }>;

export type LetterTemplate = Extract<TemplateDto, { templateType: 'LETTER' }>;

export type TemplateFormState<T = CreateUpdateTemplate | TemplateDto> =
  FormState & T;

export type NextJsPageProps = {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type TemplatePageProps = NextJsPageProps & {
  params: Promise<{
    templateId: string;
  }>;
};

export type MessagePlanPageProps = NextJsPageProps & {
  params: Promise<{
    routingConfigId: string;
  }>;
};

export type MessagePlanAndTemplatePageProps = NextJsPageProps & {
  params: Promise<{
    routingConfigId: string;
    templateId: string;
  }>;
};

export type PageComponentProps<T> = {
  initialState: TemplateFormState<T>;
};

export type ActionPageProps = {
  templateName: string;
  templateId: string;
  channel: TemplateType;
  lockNumber: number;
};

export type ServerAction = string | ((payload: FormData) => void);

export type GuardDutyMalwareScanStatus =
  GuardDutyScanResultNotificationEventDetail['scanResultDetails']['scanResultStatus'];

export type GuardDutyMalwareScanStatusFailed = Exclude<
  GuardDutyMalwareScanStatus,
  'NO_THREATS_FOUND'
>;

export type GuardDutyMalwareScanStatusPassed = Extract<
  GuardDutyMalwareScanStatus,
  'NO_THREATS_FOUND'
>;

export type DatabaseTemplate = {
  campaignId?: string;
  clientId?: string;
  createdAt: string;
  createdBy?: string;
  files?: LetterFiles;
  id: string;
  language?: Language;
  letterType?: LetterType;
  lockNumber?: number;
  message?: string;
  name: string;
  proofingEnabled?: boolean;
  sftpSendLockTime?: number;
  subject?: string;
  supplier?: string;
  templateStatus: TemplateStatus;
  templateType: TemplateType;
  updatedAt: string;
  updatedBy?: string;
  supplierReferences?: Record<string, string>;
} & DbOnlyTemplateProperties;

type DbOnlyTemplateProperties = {
  owner: string;
  version: number;
  ttl?: number;
};

type AssertExtendsMerged<
  T extends Omit<DatabaseTemplate, keyof DbOnlyTemplateProperties>,
> = T;

// assigned only for the purpose of the assertion
type _Asserted = AssertExtendsMerged<LetterTemplate> &
  AssertExtendsMerged<NHSAppTemplate> &
  AssertExtendsMerged<EmailTemplate> &
  AssertExtendsMerged<SMSTemplate>;

export type TemplateKey = {
  clientId: string;
  templateId: string;
};

export type FileType = 'pdf-template' | 'test-data' | 'proofs';

export type ProofingRequest = {
  campaignId: string;
  language: Language;
  letterType: LetterType;
  pdfVersionId: string;
  personalisationParameters: string[];
  supplier: string;
  templateId: string;
  templateName: string;
  testDataVersionId?: string;
  user: User;
};

export type User = { internalUserId: string; clientId: string };
