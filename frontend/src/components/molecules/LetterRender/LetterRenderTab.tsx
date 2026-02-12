'use client';

import { useState } from 'react';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
import {
  SHORT_EXAMPLE_RECIPIENTS,
  LONG_EXAMPLE_RECIPIENTS,
} from '@content/example-recipients';
import type { RenderTab, RenderFormData } from './types';
import styles from './LetterRenderTab.module.scss';

type LetterRenderTabProps = {
  template: AuthoringLetterTemplate;
  tab: RenderTab;
};

function buildPdfUrl(
  template: AuthoringLetterTemplate,
  fileName: string
): string {
  const basePath = getBasePath();
  return `${basePath}/files/${template.clientId}/renders/${template.id}/${fileName}`;
}

function getInitialState(template: AuthoringLetterTemplate, tab: RenderTab) {
  const renderDetails =
    tab === 'short'
      ? template.files.shortFormRender
      : template.files.longFormRender;

  const { fileName, systemPersonalisationPackId, personalisationParameters } =
    renderDetails ?? {};

  const file = fileName ?? template.files.initialRender?.fileName ?? null;
  const pdfUrl = file ? buildPdfUrl(template, file) : null;

  const formData: RenderFormData = {
    systemPersonalisationPackId: systemPersonalisationPackId ?? '',
    personalisationParameters: personalisationParameters ?? {},
  };

  return { formData, pdfUrl };
}

export function LetterRenderTab({ template, tab }: LetterRenderTabProps) {
  const initial = getInitialState(template, tab);

  const [formData, setFormData] = useState<RenderFormData>(initial.formData);
  // setPdfUrl omitted because it's not used for now
  const [pdfUrl] = useState<string | null>(initial.pdfUrl);

  const { systemPersonalisationPackId, personalisationParameters } = formData;

  const handleSubmit = async () => {
    const exampleRecipients =
      tab === 'short' ? SHORT_EXAMPLE_RECIPIENTS : LONG_EXAMPLE_RECIPIENTS;

    const recipient = exampleRecipients.find(
      (r) => r.id === systemPersonalisationPackId
    );

    const personalisation = {
      ...recipient?.data,
      ...personalisationParameters,
    };

    await updateLetterPreview({
      templateId: template.id,
      lockNumber: template.lockNumber,
      tab,
      systemPersonalisationPackId,
      personalisation,
    });
  };

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-one-third'>
        <LetterRenderForm
          template={template}
          tab={tab}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
        />
      </div>

      <div className={`nhsuk-grid-column-two-thirds ${styles.iframeColumn}`}>
        <LetterRenderIframe tab={tab} pdfUrl={pdfUrl} />
      </div>
    </div>
  );
}
