import type { AuthoringLetterFiles } from 'nhs-notify-web-template-management-types';

export type RenderKey = keyof Omit<AuthoringLetterFiles, 'docxTemplate'>;

export type PersonalisedRenderKey = Exclude<RenderKey, 'initialRender'>;
