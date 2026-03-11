'use client';

import type {
  AuthoringLetterTemplate,
  FormState,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import {
  NHSNotifyFormProvider,
  useNHSNotifyForm,
} from '@providers/form-provider';
import type { RenderDetails } from 'nhs-notify-web-template-management-types';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
import type { PersonalisedRenderKey } from '@utils/types';
import styles from './LetterRenderTab.module.scss';
import { PollLetterRender } from '@molecules/PollLetterRender/PollLetterRender';
import { PERSONALISATION_FORMDATA_PREFIX } from '@utils/constants';

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
        `${PERSONALISATION_FORMDATA_PREFIX}${f}`,
        personalisationParameters?.[f] ?? '',
      ]),
      ['systemPersonalisationPackId', systemPersonalisationPackId ?? ''],
    ]),
  };
}

function LetterRenderTabContent({
  template,
  tab,
  pdfUrl,
}: {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
  pdfUrl: string | null;
}) {
  const [_state, _dispatch, isPending] = useNHSNotifyForm();

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-one-third'>
        <LetterRenderForm template={template} tab={tab} />
      </div>

      <div className={`nhsuk-grid-column-two-thirds ${styles.iframeColumn}`}>
        <PollLetterRender
          template={template}
          mode={tab}
          loadingElement={<p>loading</p>}
          forcePolling={isPending}
        >
          <LetterRenderIframe tab={tab} pdfUrl={pdfUrl} />
        </PollLetterRender>
      </div>
    </div>
  );
}

export function LetterRenderTab({ template, tab }: LetterRenderTabProps) {
  const formState = initialiseFormState(template, tab);
  const pdfUrl = initialisePdfUrl(template, tab);

  return (
    <NHSNotifyFormProvider
      initialState={formState}
      serverAction={updateLetterPreview}
    >
      <LetterRenderTabContent template={template} tab={tab} pdfUrl={pdfUrl} />
    </NHSNotifyFormProvider>
  );
}
