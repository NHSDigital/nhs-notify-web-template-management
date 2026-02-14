'use client';

import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
import type { RenderTab, LetterRenderFormState } from './types';
import styles from './LetterRenderTab.module.scss';
import { AuthoringPersonalisedRenderDetails } from 'nhs-notify-backend-client';

type LetterRenderTabProps = {
  template: AuthoringLetterTemplate;
  tab: RenderTab;
};

function buildPdfUrl(template: AuthoringLetterTemplate, fileName: string) {
  const basePath = getBasePath();
  return `${basePath}/files/${template.clientId}/renders/${template.id}/${fileName}`;
}

function getPersonalisedRender(
  template: AuthoringLetterTemplate,
  tab: RenderTab
): AuthoringPersonalisedRenderDetails | undefined {
  return tab === 'short'
    ? template.files.shortFormRender
    : template.files.longFormRender;
}

function getInitialPdfUrl(
  template: AuthoringLetterTemplate,
  tab: RenderTab
): string | null {
  const personalisedRender = getPersonalisedRender(template, tab);
  const initialRender = template.files.initialRender;

  const { fileName } = personalisedRender ?? initialRender ?? {};

  return fileName ? buildPdfUrl(template, fileName) : null;
}

function getInitialFormState(
  template: AuthoringLetterTemplate,
  tab: RenderTab
): LetterRenderFormState {
  const personalisedRender = getPersonalisedRender(template, tab);

  const { systemPersonalisationPackId, personalisationParameters } =
    personalisedRender ?? {};

  const customPersonalisationFields = template.customPersonalisation ?? [];

  const fields = Object.fromEntries([
    ['systemPersonalisationPackId', systemPersonalisationPackId ?? ''],
    ...customPersonalisationFields.map((f) => [
      `custom_${f}`,
      personalisationParameters?.[f] ?? '',
    ]),
  ]);

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
