import type { AuthoringLetterFiles } from 'nhs-notify-web-template-management-types';

export type RenderKey = keyof Omit<AuthoringLetterFiles, 'docxTemplate'>;
// → 'initialRender' | 'longFormRender' | 'shortFormRender'

export type PersonalisedRenderKey = Exclude<RenderKey, 'initialRender'>;
// → 'longFormRender' | 'shortFormRender'
