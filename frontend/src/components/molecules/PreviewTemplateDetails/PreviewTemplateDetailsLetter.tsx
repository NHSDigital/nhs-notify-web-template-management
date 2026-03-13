'use client';

import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import PreviewTemplateDetailsPdfLetter from './PreviewTemplateDetailsPdfLetter';
import PreviewTemplateDetailsAuthoringLetter from './PreviewTemplateDetailsAuthoringLetter';
import { DetailsHeader } from './common';

export default function PreviewTemplateDetailsLetter({
  template,
  hideStatus,
  hideEditActions,
}: {
  template: LetterTemplate;
  hideStatus?: boolean;
  hideEditActions?: boolean;
}) {
  return template.letterVersion === 'PDF' ? (
    <PreviewTemplateDetailsPdfLetter
      template={template}
      hideStatus={hideStatus}
    />
  ) : (
    <>
      <DetailsHeader templateName={template.name} />
      <PreviewTemplateDetailsAuthoringLetter
        template={template}
        hideStatus={hideStatus}
        hideEditActions={hideEditActions}
      />
    </>
  );
}
