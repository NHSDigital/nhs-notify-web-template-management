'use client';

import type {
  AuthoringLetterTemplate,
  FormState,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import type { RenderDetails } from 'nhs-notify-web-template-management-types';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
import type { PersonalisedRenderKey } from '@utils/types';
import styles from './LetterRenderTab.module.scss';

type LetterRenderTabProps = {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
};

function buildPdfUrl(template: AuthoringLetterTemplate, fileName: string) {
  const basePath = getBasePath();
  return `${basePath}/files/${template.clientId}/renders/${template.id}/${fileName}`;
}

function getPersonalisedRender(
  template: AuthoringLetterTemplate,
  tab: PersonalisedRenderKey
): RenderDetails | undefined {
  return template.files[tab];
}

function initialisePdfUrl(
  template: AuthoringLetterTemplate,
  tab: PersonalisedRenderKey
): string | null {
  const personalisedRender = getPersonalisedRender(template, tab);
  const initialRender = template.files.initialRender;

  const render =
    personalisedRender?.status === 'RENDERED'
      ? personalisedRender
      : initialRender;

  return render?.status === 'RENDERED'
    ? buildPdfUrl(template, render.fileName)
    : null;
}

function initialiseFormState(
  template: AuthoringLetterTemplate,
  tab: PersonalisedRenderKey
): FormState {
  const personalisedRender = getPersonalisedRender(template, tab);

  const renderedPersonalisation =
    personalisedRender?.status === 'RENDERED' ? personalisedRender : null;

  const { systemPersonalisationPackId, personalisationParameters } =
    renderedPersonalisation ?? {};

  const customPersonalisationFields = template.customPersonalisation ?? [];

  return {
    fields: Object.fromEntries([
      ...customPersonalisationFields.map((f) => [
        f,
        personalisationParameters?.[f] ?? '',
      ]),
      ['__systemPersonalisationPackId', systemPersonalisationPackId ?? ''],
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
