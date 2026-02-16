'use client';

import type {
  AuthoringLetterTemplate,
  FormState,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import type { AuthoringPersonalisedRenderDetails } from 'nhs-notify-backend-client';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
import type { RenderTab } from './types';
import styles from './LetterRenderTab.module.scss';

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

function initialisePdfUrl(
  template: AuthoringLetterTemplate,
  tab: RenderTab
): string | null {
  const personalisedRender = getPersonalisedRender(template, tab);
  const initialRender = template.files.initialRender;

  const { fileName } = personalisedRender ?? initialRender ?? {};

  return fileName ? buildPdfUrl(template, fileName) : null;
}

function initialiseFormState(
  template: AuthoringLetterTemplate,
  tab: RenderTab
): FormState {
  const personalisedRender = getPersonalisedRender(template, tab);

  const { systemPersonalisationPackId, personalisationParameters } =
    personalisedRender ?? {};

  const customPersonalisationFields = template.customPersonalisation ?? [];

  return {
    fields: Object.fromEntries([
      ['__systemPersonalisationPackId', systemPersonalisationPackId ?? ''],
      ...customPersonalisationFields.map((f) => [
        f,
        personalisationParameters?.[f] ?? '',
      ]),
    ]),
  };
}

export function LetterRenderTab({ template, tab }: LetterRenderTabProps) {
  const formState = initialiseFormState(template, tab);
  const pdfUrl = initialisePdfUrl(template, tab);

  return (
    <NHSNotifyFormProvider
      initialState={formState}
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
