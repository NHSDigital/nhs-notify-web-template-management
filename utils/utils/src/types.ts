import type { GuardDutyScanResultNotificationEventDetail } from 'aws-lambda';
import type {
  AuthoringLetterFiles,
  AuthoringLetterProperties,
  BaseCreatedTemplate,
  CreateUpdateTemplate,
  Language,
  LetterType,
  LetterVersion,
  PdfLetterFiles,
  PdfLetterProperties,
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

type FormStateFieldValue = string | undefined;

export type FormStateFields = Record<string, FormStateFieldValue>;

export type FormState = {
  errorState?: ErrorState;
  fields?: FormStateFields;
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

export type PdfLetterTemplate = BaseCreatedTemplate & PdfLetterProperties;

export type AuthoringLetterTemplate = BaseCreatedTemplate &
  AuthoringLetterProperties;

export type LetterTemplate = PdfLetterTemplate | AuthoringLetterTemplate;

export type DigitalTemplate = NHSAppTemplate | EmailTemplate | SMSTemplate;

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

type DatabaseFiles = Partial<PdfLetterFiles & AuthoringLetterFiles>;

export type DatabaseTemplate = {
  campaignId?: string;
  clientId?: string;
  createdAt: string;
  createdBy?: string;
  customPersonalisation?: string[];
  files?: DatabaseFiles;
  id: string;
  language?: Language;
  letterType?: LetterType;
  letterVariantId?: string;
  letterVersion?: LetterVersion;
  lockNumber?: number;
  message?: string;
  name: string;
  pdsPersonalisation?: string[];
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

export type FileType =
  | 'docx-template'
  | 'pdf-template'
  | 'test-data'
  | 'proofs';

export type UnionKeys<T> = T extends T ? keyof T : never;

export type LetterFileKey = UnionKeys<LetterTemplate['files']>;

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
