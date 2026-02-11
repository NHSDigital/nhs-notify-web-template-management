'use client';

import { useState } from 'react';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
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
  const [pdfUrl] = useState<string | null>(initial.pdfUrl);
  const [errors] = useState<Record<string, string[]>>({});

  const handleSubmit = async () => {
    await updateLetterPreview({
      templateId: template.id,
      tab,
      systemPersonalisationPackId: formData.systemPersonalisationPackId,
      personalisationParameters: formData.personalisationParameters,
    });
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.formColumn}>
        <LetterRenderForm
          template={template}
          tab={tab}
          formData={formData}
          errors={errors}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
        />
      </div>

      <div className={styles.iframeColumn}>
        <LetterRenderIframe tab={tab} pdfUrl={pdfUrl} />
      </div>
    </div>
  );
}
