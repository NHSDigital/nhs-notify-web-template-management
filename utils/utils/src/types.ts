import type { GuardDutyScanResultNotificationEventDetail } from 'aws-lambda';
import {
  CreateUpdateLetterProperties,
  CreateUpdateTemplate,
  EmailProperties,
  LetterProperties,
  NhsAppProperties,
  SmsProperties,
  TemplateDto,
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

type NhsAppType = {
  templateType: 'NHS_APP';
};

type EmailType = {
  templateType: 'EMAIL';
};

type SmsType = {
  templateType: 'SMS';
};

type LetterType = {
  templateType: 'LETTER';
};

export type CreateUpdateNHSAppTemplate = CreateUpdateTemplate &
  NhsAppProperties &
  NhsAppType;
export type CreateUpdateEmailTemplate = CreateUpdateTemplate &
  EmailProperties &
  EmailType;
export type CreateUpdateSMSTemplate = CreateUpdateTemplate &
  SmsProperties &
  SmsType;
export type CreateUpdateLetterTemplate = CreateUpdateTemplate &
  CreateUpdateLetterProperties &
  LetterType;

export type NHSAppTemplate = TemplateDto & NhsAppProperties & NhsAppType;
export type EmailTemplate = TemplateDto & EmailProperties & EmailType;
export type SMSTemplate = TemplateDto & SmsProperties & SmsType;
export type LetterTemplate = TemplateDto & LetterProperties & LetterType;

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
