'use client';

import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LetterPreviewForm } from './LetterPreviewForm';
import { LetterPreviewIframe } from './LetterPreviewIframe';
import type { LetterPreviewVariant } from './types';

export function LetterPreviewTabContent({
  template,
  variant,
}: {
  template: AuthoringLetterTemplate;
  variant: LetterPreviewVariant;
}) {
  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-one-third'>
        <LetterPreviewForm template={template} variant={variant} />
      </div>
      <div className='nhsuk-grid-column-two-thirds'>
        <LetterPreviewIframe template={template} variant={variant} />
      </div>
    </div>
  );
}
