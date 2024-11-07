export type FormId =
  | 'choose-a-template-type'
  | 'create-nhs-app-template'
  | 'create-email-template'
  | 'create-letter-template'
  | 'create-text-message-template'
  | 'preview-nhs-app-template'
  | 'submit-template'
  | 'create-nhs-app-template-back'
  | 'create-email-template-back';

export type FormErrorState = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
}

export type BaseTemplateFields = {
  name: string;
  message: string;
};

export type BaseTemplateFieldsWithSubject = BaseTemplateFields & {
  subject: string;
};

export type Template = {
  id: string;
  version: number;
  templateType: TemplateType | 'UNKNOWN';
  NHS_APP?: BaseTemplateFields | null;
  EMAIL?: BaseTemplateFieldsWithSubject | null;
  SMS?: BaseTemplateFields | null;
  LETTER?: BaseTemplateFields | null;
};

export type NHSAppTemplate = Omit<Template, 'templateType' | 'NHS_APP'> & {
  templateType: TemplateType.NHS_APP;
  NHS_APP: BaseTemplateFields;
};

export type EmailTemplate = Omit<Template, 'templateType' | 'EMAIL'> & {
  templateType: TemplateType.EMAIL;
  EMAIL: BaseTemplateFieldsWithSubject;
};

export type SMSTemplate = Omit<Template, 'templateType' | 'SMS'> & {
  templateType: TemplateType.SMS;
  SMS: BaseTemplateFields;
};

export type ChannelTemplate = NHSAppTemplate | EmailTemplate | SMSTemplate;

export type FormState = {
  validationError?: FormErrorState;
  redirect?: string;
};

export type TemplateFormState<T = Template> = FormState & T;

export type PageProps = {
  params: {
    templateId: string;
  };
};

export type TemplateSubmittedPageProps = {
  params: {
    templateId: string;
  };
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
