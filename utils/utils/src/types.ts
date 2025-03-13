import {
  CreateTemplate,
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

type NhsAppPropertiesWithType = NhsAppProperties & {
  templateType: 'NHS_APP';
};

type EmailPropertiesWithType = EmailProperties & {
  templateType: 'EMAIL';
};

type SmsPropertiesWithType = SmsProperties & {
  templateType: 'SMS';
};

type LetterPropertiesWithType = LetterProperties & {
  templateType: 'LETTER';
};

export type CreateNHSAppTemplate = CreateTemplate & NhsAppPropertiesWithType;
export type CreateEmailTemplate = CreateTemplate & EmailPropertiesWithType;
export type CreateSMSTemplate = CreateTemplate & SmsPropertiesWithType;
export type CreateLetterTemplate = CreateTemplate & LetterPropertiesWithType;

export type NHSAppTemplate = TemplateDto & NhsAppPropertiesWithType;
export type EmailTemplate = TemplateDto & EmailPropertiesWithType;
export type SMSTemplate = TemplateDto & SmsPropertiesWithType;
export type LetterTemplate = TemplateDto & LetterPropertiesWithType;

export type TemplateFormState<T = CreateTemplate | TemplateDto> = FormState & T;

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
