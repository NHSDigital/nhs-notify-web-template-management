import type { FormState } from 'nhs-notify-web-template-management-utils';

export type LetterPreviewVariant = 'short' | 'long';

export interface LetterPreviewFormState extends FormState {
  // Additional fields not in the standard FormState.fields
  templateId?: string;
  variant?: LetterPreviewVariant;
  pdsPersonalisationPackId?: string;
  personalisationParameters?: Record<string, string>;
}
