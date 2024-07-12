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

export type FormState = {
  page: Page;
  validationError?: FormErrorState;
  nhsAppTemplateName: string;
  nhsAppTemplateMessage: string;
  reviewNHSAppTemplateAction?: 'nhsapp-edit' | 'nhsapp-submit';
};

export type PageComponentProps = {
  state: FormState;
  action: string | ((payload: FormData) => void);
};
