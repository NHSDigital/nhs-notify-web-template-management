import { AuthoringLetterFiles } from 'nhs-notify-backend-client';

export type RenderTab = Extract<
  keyof AuthoringLetterFiles,
  'longFormRender' | 'shortFormRender'
>;
