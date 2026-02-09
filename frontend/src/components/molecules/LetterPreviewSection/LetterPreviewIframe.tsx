'use client';

import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import type { LetterPreviewVariant } from './types';

export function LetterPreviewIframe({
  template,
  variant,
}: {
  template: AuthoringLetterTemplate;
  variant: LetterPreviewVariant;
}) {
  const basePath = getBasePath();

  // Determine which PDF to display
  const renderDetails =
    variant === 'short'
      ? template.files.shortFormRender
      : template.files.longFormRender;

  // Fall back to initial render if no personalised render exists
  const fileName =
    renderDetails?.fileName ?? template.files.initialRender?.fileName;

  if (!fileName) {
    return (
      <p className='nhsuk-body'>
        No preview available. Upload a letter template to see a preview.
      </p>
    );
  }

  // Construct PDF URL (renders stored in S3, served via CloudFront)
  const pdfUrl = `${basePath}/files/${template.clientId}/renders/${template.id}/${fileName}`;

  return (
    <iframe
      src={pdfUrl}
      title={`Letter preview - ${variant} examples`}
      className='nhsuk-u-margin-bottom-4'
      style={{ width: '100%', height: '1200px', border: 'none' }}
      referrerPolicy='no-referrer'
    />
  );
}
