import { z } from 'zod';
import {
  $Template,
  $EmailTemplate,
  $SMSTemplate,
  $NHSAppTemplate,
  $ChannelTemplate,
  $SubmittedChannelTemplate,
  $SubmittedEmailTemplate,
  $SubmittedSMSTemplate,
  $SubmittedNHSAppTemplate,
} from './zod-validators';

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

export type Template = z.infer<typeof $Template>;

export type EmailTemplate = z.infer<typeof $EmailTemplate>;

export type SubmittedEmailTemplate = z.infer<typeof $SubmittedEmailTemplate>;

export type SMSTemplate = z.infer<typeof $SMSTemplate>;

export type SubmittedSMSTemplate = z.infer<typeof $SubmittedSMSTemplate>;

export type NHSAppTemplate = z.infer<typeof $NHSAppTemplate>;

export type SubmittedNHSAppTemplate = z.infer<typeof $SubmittedNHSAppTemplate>;

export type ChannelTemplate = z.infer<typeof $ChannelTemplate>;

export type SubmittedChannelTemplate = z.infer<
  typeof $SubmittedChannelTemplate
>;

export type Draft<T> = Omit<T, 'id'>;

export type FormState = {
  validationError?: FormErrorState;
};

export type TemplateFormState<T = Template> = FormState & T;

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
