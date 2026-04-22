import type { AuthoringLetterFiles } from 'nhs-notify-web-template-management-types';
import { AuthoringLetterTemplate } from '../../../utils/utils/src/types';
import { getBasePath } from './get-base-path';

function buildLetterRenderUrl(
  template: AuthoringLetterTemplate,
  fileName: string
) {
  const basePath = getBasePath();
  return `${basePath}/files/${template.clientId}/renders/${template.id}/${fileName}`;
}

export type RenderedFileKey = Exclude<
  keyof AuthoringLetterFiles,
  'docxTemplate'
>;

export function getRenderDetails(
  template: AuthoringLetterTemplate,
  renderKey: RenderedFileKey
): {
  rendered: boolean;
  src?: string;
} {
  const file = template.files[renderKey];

  if (!file || file.status !== 'RENDERED') {
    return { rendered: false };
  }

  return {
    rendered: true,
    src: buildLetterRenderUrl(template, file.fileName),
  };
}
