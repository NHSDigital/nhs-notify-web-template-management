'use client';

import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import PreviewTemplateDetailsPdfLetter from './PreviewTemplateDetailsPdfLetter';
import PreviewTemplateDetailsAuthoringLetter from './PreviewTemplateDetailsAuthoringLetter';

export default function PreviewTemplateDetailsLetter({
  template,
  hideStatus,
  hideActions,
}: {
  template: LetterTemplate;
  hideStatus?: boolean;
  hideActions?: boolean;
}) {
  return template.letterVersion === 'PDF' ? (
    <PreviewTemplateDetailsPdfLetter
      template={template}
      hideStatus={hideStatus}
    />
  ) : (
    <PreviewTemplateDetailsAuthoringLetter
      template={template}
      hideStatus={hideStatus}
      hideActions={hideActions}
    />
  );
}
