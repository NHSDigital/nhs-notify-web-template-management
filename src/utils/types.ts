export type FormId =
  | 'choose-a-template-type'
  | 'create-nhs-app-template'
  | 'create-email-template'
  | 'create-letter-template'
  | 'create-sms-template'
  | 'preview-nhs-app-template'
  | 'submit-template'
  | 'create-nhs-app-template-back';

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

export type Session = {
  id: string;
  templateType: TemplateType | 'UNKNOWN';
  nhsAppTemplateName: string;
  nhsAppTemplateMessage: string;
};

export type FormState = {
  validationError?: FormErrorState;
};

export type TemplateFormState = FormState & Session;

export type PageProps = {
  params: {
    sessionId: string;
  };
};

export type PageComponentProps = {
  initialState: TemplateFormState;
};

export enum TemplateFormatText {
  APP = 'APP',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
  SMS = 'SMS',
}
