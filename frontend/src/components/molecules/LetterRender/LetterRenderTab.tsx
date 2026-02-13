'use client';

import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
import type { RenderTab, LetterRenderFormState } from './types';
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

function getInitialPdfUrl(
  template: AuthoringLetterTemplate,
  tab: RenderTab
): string | null {
  const renderDetails =
    tab === 'short'
      ? template.files.shortFormRender
      : template.files.longFormRender;

  const file =
    renderDetails?.fileName ?? template.files.initialRender?.fileName ?? null;

  return file ? buildPdfUrl(template, file) : null;
}

function getInitialFormState(
  template: AuthoringLetterTemplate,
  tab: RenderTab
): LetterRenderFormState {
  const renderDetails =
    tab === 'short'
      ? template.files.shortFormRender
      : template.files.longFormRender;

  const { systemPersonalisationPackId, personalisationParameters } =
    renderDetails ?? {};

  const customPersonalisationFields = template.customPersonalisation ?? [];

  // Build fields object for FormState
  const fields: Record<string, string> = {
    systemPersonalisationPackId: systemPersonalisationPackId ?? '',
  };

  // Add custom personalisation fields
  for (const fieldName of customPersonalisationFields) {
    fields[`custom_${fieldName}`] =
      personalisationParameters?.[fieldName] ?? '';
  }

  return {
    templateId: template.id,
    lockNumber: template.lockNumber,
    tab,
    customPersonalisationFields,
    fields,
  };
}

export function LetterRenderTab({ template, tab }: LetterRenderTabProps) {
  const initialFormState = getInitialFormState(template, tab);
  const pdfUrl = getInitialPdfUrl(template, tab);

  return (
    <NHSNotifyFormProvider
      initialState={initialFormState}
      serverAction={updateLetterPreview}
    >
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-one-third'>
          <LetterRenderForm template={template} tab={tab} />
        </div>

        <div className={`nhsuk-grid-column-two-thirds ${styles.iframeColumn}`}>
          <LetterRenderIframe tab={tab} pdfUrl={pdfUrl} />
        </div>
      </div>
    </NHSNotifyFormProvider>
  );
}
