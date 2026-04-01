'use client';

import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import PreviewTemplateDetailsPdfLetter from './PreviewTemplateDetailsPdfLetter';
import PreviewTemplateDetailsAuthoringLetter from './PreviewTemplateDetailsAuthoringLetter';
import { LetterRenderIframe } from '@molecules/LetterRender/LetterRenderIframe';
import { buildLetterRenderUrl } from '@utils/letter-render-url';
import concatClassNames from '@utils/concat-class-names';
import styles from './PreviewTemplateDetailsLetter.module.scss';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';

export default function PreviewTemplateDetailsLetter({
  template,
  letterVariant,
  hideStatus,
  hideEditActions,
}: {
  template: LetterTemplate;
  letterVariant?: LetterVariant;
  hideStatus?: boolean;
  hideEditActions?: boolean;
}) {
  if (template.letterVersion === 'PDF') {
    return (
      <PreviewTemplateDetailsPdfLetter
        template={template}
        hideStatus={hideStatus}
      />
    );
  }

  const { initialRender } = template.files;

  const pdfUrl =
    initialRender.status === 'RENDERED'
      ? buildLetterRenderUrl(template, initialRender.fileName)
      : null;

  return (
    <>
      <PreviewTemplateDetailsAuthoringLetter
        template={template}
        letterVariant={letterVariant}
        hideStatus={hideStatus}
        hideEditActions={hideEditActions}
      />
      <h2 className='nhsuk-heading-m'>{'h2'}</h2>
      <LetterRenderIframe
        renderType={'initialRender'}
        pdfUrl={pdfUrl}
        className={concatClassNames(styles.iframe, 'nhsuk-u-margin-bottom-6')}
      />
    </>
  );
}
