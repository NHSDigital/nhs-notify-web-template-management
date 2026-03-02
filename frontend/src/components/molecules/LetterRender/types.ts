import type { AuthoringLetterFiles } from 'nhs-notify-web-template-management-types';

export type RenderTab = Extract<
  keyof AuthoringLetterFiles,
  'longFormRender' | 'shortFormRender'
>;
