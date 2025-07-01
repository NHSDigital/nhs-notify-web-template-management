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

export type FormErrorState = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

export type FormState = {
  validationError?: FormErrorState;
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

export type CreateLetterTemplate = Extract<
  CreateUpdateTemplate,
  { templateType: 'LETTER' }
>;

export type NHSAppTemplate = Extract<TemplateDto, { templateType: 'NHS_APP' }>;

export type EmailTemplate = Extract<TemplateDto, { templateType: 'EMAIL' }>;

export type SMSTemplate = Extract<TemplateDto, { templateType: 'SMS' }>;

export type LetterTemplate = Extract<TemplateDto, { templateType: 'LETTER' }>;

export type TemplateFormState<T = CreateUpdateTemplate | TemplateDto> =
  FormState & T;

export type PageProps = {
  params: Promise<{
    templateId: string;
  }>;
};

export type TemplateSubmittedPageProps = {
  params: Promise<{
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
  clientId?: string;
  createdAt: string;
  createdBy?: string;
  files?: LetterFiles;
  id: string;
  language?: Language;
  letterType?: LetterType;
  message?: string;
  name: string;
  sftpSendLockTime?: number;
  subject?: string;
  templateStatus: TemplateStatus;
  templateType: TemplateType;
  updatedAt: string;
  updatedBy?: string;
} & DbOnlyTemplateProperties;

type DbOnlyTemplateProperties = {
  owner: string;
  version: number;
};

type AssertExtendsMerged<
  T extends Omit<DatabaseTemplate, keyof DbOnlyTemplateProperties>,
> = T;

// assigned only for the purpose of the assertion
type _Asserted = AssertExtendsMerged<LetterTemplate> &
  AssertExtendsMerged<NHSAppTemplate> &
  AssertExtendsMerged<EmailTemplate> &
  AssertExtendsMerged<SMSTemplate>;

export type TemplateKey = { owner: string; id: string };

export type FileType = 'pdf-template' | 'test-data' | 'proofs';

export type ProofingRequest = {
  owner: string;
  pdfVersionId: string;
  personalisationParameters: string[];
  supplier: string;
  templateId: string;
  testDataVersionId?: string;
};
