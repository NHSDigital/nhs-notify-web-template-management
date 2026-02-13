import type { FormState } from 'nhs-notify-web-template-management-utils';

export type RenderTab = 'short' | 'long';

export type LetterRenderFormState = FormState & {
  templateId: string;
  lockNumber: number;
  tab: RenderTab;
  customPersonalisationFields: string[];
};
