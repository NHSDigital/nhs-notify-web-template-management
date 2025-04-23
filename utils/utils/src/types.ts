import type { GuardDutyScanResultNotificationEventDetail } from 'aws-lambda';
import {
  CreateUpdateLetterProperties,
  CreateUpdateTemplate,
  EmailProperties,
  Language,
  LetterFiles,
  LetterProperties,
  LetterType,
  NhsAppProperties,
  SmsProperties,
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

type NhsAppTemplateType = {
  templateType: 'NHS_APP';
};

type EmailTemplateType = {
  templateType: 'EMAIL';
};

type SmsTemplateType = {
  templateType: 'SMS';
};

type LetterTemplateType = {
  templateType: 'LETTER';
};

export type CreateUpdateNHSAppTemplate = CreateUpdateTemplate &
  NhsAppProperties &
  NhsAppTemplateType;
export type CreateUpdateEmailTemplate = CreateUpdateTemplate &
  EmailProperties &
  EmailTemplateType;
export type CreateUpdateSMSTemplate = CreateUpdateTemplate &
  SmsProperties &
  SmsTemplateType;
export type CreateUpdateLetterTemplate = CreateUpdateTemplate &
  CreateUpdateLetterProperties &
  LetterTemplateType;

export type NHSAppTemplate = TemplateDto &
  NhsAppProperties &
  NhsAppTemplateType;
export type EmailTemplate = TemplateDto & EmailProperties & EmailTemplateType;
export type SMSTemplate = TemplateDto & SmsProperties & SmsTemplateType;
export type LetterTemplate = TemplateDto &
  LetterProperties &
  LetterTemplateType;

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

export type SubmitTemplatePageComponentProps = {
  templateName: string;
  templateId: string;
  goBackPath: string;
  submitPath: string;
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
  createdAt: string;
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
export type FileType = 'pdf-template' | 'test-data';
