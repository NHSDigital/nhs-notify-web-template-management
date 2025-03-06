import {
  CreateTemplate,
  EmailProperties,
  LetterProperties,
  NHSAppProperties,
  SMSProperties,
  TemplateDTO,
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

export type CreateNHSAppTemplate = CreateTemplate & NHSAppProperties;
export type CreateEmailTemplate = CreateTemplate & EmailProperties;
export type CreateSMSTemplate = CreateTemplate & SMSProperties;
export type CreateLetterTemplate = CreateTemplate & LetterProperties;

export type NHSAppTemplate = TemplateDTO & NHSAppProperties;
export type EmailTemplate = TemplateDTO & EmailProperties;
export type SMSTemplate = TemplateDTO & SMSProperties;
export type LetterTemplate = TemplateDTO & LetterProperties;

export type TemplateFormState<T = CreateTemplate | TemplateDTO> = FormState & T;

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
