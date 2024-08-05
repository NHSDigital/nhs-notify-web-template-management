export type Page =
  | 'choose-template'
  | 'create-nhs-app-template'
  | 'create-email-template'
  | 'create-letter-template'
  | 'create-sms-template'
  | 'review-nhs-app-template'
  | 'submit-template';

export type FormId =
  | Page
  | 'create-nhs-app-template-back'
  | 'review-nhs-app-template-back';

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
  templateType: TemplateType | '';
  nhsAppTemplateName: string;
  nhsAppTemplateMessage: string;
};

export type FormState = {
  validationError?: FormErrorState;
};

export type TemplateFormState = FormState & {
  sessionId: string;
  page: Page;
  templateType: TemplateType | '';
  nhsAppTemplateName: string;
  nhsAppTemplateMessage: string;
  reviewNHSAppTemplateAction?: 'nhsapp-edit' | 'nhsapp-submit';
};

export type PageComponentProps = {
  state: TemplateFormState;
  action: string | ((payload: FormData) => void);
};
