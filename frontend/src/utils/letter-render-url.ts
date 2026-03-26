import { AuthoringLetterTemplate } from '../../../utils/utils/src/types';
import { getBasePath } from './get-base-path';

export function buildLetterRenderUrl(
  template: AuthoringLetterTemplate,
  fileName: string
) {
  const basePath = getBasePath();
  return `${basePath}/files/${template.clientId}/renders/${template.id}/${fileName}`;
}
