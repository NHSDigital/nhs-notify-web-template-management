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

export type CreateNHSAppTemplate = CreateTemplate & NhsAppProperties;
export type CreateEmailTemplate = CreateTemplate & EmailProperties;
export type CreateSMSTemplate = CreateTemplate & SmsProperties;
export type CreateLetterTemplate = CreateTemplate & LetterProperties;

export type NHSAppTemplate = TemplateDto & NhsAppProperties;
export type EmailTemplate = TemplateDto & EmailProperties;
export type SMSTemplate = TemplateDto & SmsProperties;
export type LetterTemplate = TemplateDto & LetterProperties;

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
