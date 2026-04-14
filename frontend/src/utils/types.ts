import { ContentBlock } from '@molecules/ContentRenderer/ContentRenderer';
import type {
  AuthoringLetterFiles,
  CreateUpdateTemplate,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';

export type RenderKey = keyof Omit<AuthoringLetterFiles, 'docxTemplate'>;

export type PersonalisedRenderKey = Exclude<RenderKey, 'initialRender'>;

export type ErrorState = {
  formErrors?: (ContentBlock[] | string)[];
  fieldErrors?: Record<string, string[]>;
};

type FormStateFieldValue = string | undefined;

export type FormStateFields = Record<string, FormStateFieldValue>;

export type FormState = {
  errorState?: ErrorState;
  fields?: FormStateFields;
};

export type TemplateFormState<T = CreateUpdateTemplate | TemplateDto> =
  FormState & T;

export type PageComponentProps<T> = {
  initialState: TemplateFormState<T>;
};
