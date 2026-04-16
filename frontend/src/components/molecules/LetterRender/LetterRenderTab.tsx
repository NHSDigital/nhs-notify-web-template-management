'use client';

import type {
  AuthoringLetterTemplate,
  FormState,
} from 'nhs-notify-web-template-management-utils';
import {
  NHSNotifyFormProvider,
  useNHSNotifyForm,
} from '@providers/form-provider';
import type { RenderDetails } from 'nhs-notify-web-template-management-types';
import { LetterRenderDetails } from './LetterRenderDetails';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
import type { PersonalisedRenderKey } from '@utils/types';
import styles from './LetterRenderTab.module.scss';
import { PollLetterRender } from '@molecules/PollLetterRender/PollLetterRender';
import { PERSONALISATION_FORMDATA_PREFIX } from '@utils/constants';
import content from '@content/content';
import { buildLetterRenderUrl } from '@utils/letter-render-url';
import { useLetterRenderError } from '@providers/letter-render-error-provider';
import { useEffect, type ReactNode } from 'react';

const { loadingText } = content.components.letterRender;

type LetterRenderTabProps = {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
  hideEditActions?: boolean;
};

function derivePdfUrl(
  template: AuthoringLetterTemplate,
  personalisedRender: RenderDetails | undefined
): string | null {
  const initialRender = template.files.initialRender;

  const render =
    personalisedRender?.status === 'RENDERED'
      ? personalisedRender
      : initialRender;

  return render?.status === 'RENDERED'
    ? buildLetterRenderUrl(template, render.fileName)
    : null;
}

function deriveFormState(
  template: AuthoringLetterTemplate,
  personalisedRender: RenderDetails | undefined
): FormState {
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

function LetterRenderTabLayout({
  leftColumn,
  rightColumn,
}: {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}) {
  return (
    <div className={`nhsuk-grid-row ${styles.tabRow}`}>
      <div className='nhsuk-grid-column-one-third'>{leftColumn}</div>
      <div className={`nhsuk-grid-column-two-thirds ${styles.iframeColumn}`}>
        {rightColumn}
      </div>
    </div>
  );
}

function LetterRenderTabFormInner({
  template,
  tab,
  pdfUrl,
}: {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
  pdfUrl: string | null;
}) {
  const [state, _dispatch, isPending] = useNHSNotifyForm();
  const { setLetterRenderErrorState } = useLetterRenderError();

  useEffect(() => {
    setLetterRenderErrorState(state.errorState);
  }, [state, setLetterRenderErrorState]);

  return (
    <LetterRenderTabLayout
      leftColumn={<LetterRenderForm template={template} tab={tab} />}
      rightColumn={
        <PollLetterRender
          template={template}
          mode={tab}
          loadingElement={<p>{loadingText}</p>}
          forcePolling={isPending}
        >
          <LetterRenderIframe tab={tab} pdfUrl={pdfUrl} />
        </PollLetterRender>
      }
    />
  );
}

function LetterRenderTabForm({
  template,
  tab,
}: {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
}) {
  const personalisedRender = template.files[tab];
  const formState = deriveFormState(template, personalisedRender);
  const pdfUrl = derivePdfUrl(template, personalisedRender);

  return (
    <NHSNotifyFormProvider
      initialState={formState}
      serverAction={updateLetterPreview}
    >
      <LetterRenderTabFormInner template={template} tab={tab} pdfUrl={pdfUrl} />
    </NHSNotifyFormProvider>
  );
}

function LetterRenderTabReadOnly({
  template,
  tab,
}: {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
}) {
  const pdfUrl = derivePdfUrl(template, template.files[tab]);

  return (
    <LetterRenderTabLayout
      leftColumn={<LetterRenderDetails template={template} tab={tab} />}
      rightColumn={<LetterRenderIframe tab={tab} pdfUrl={pdfUrl} />}
    />
  );
}

export function LetterRenderTab({
  template,
  tab,
  hideEditActions,
}: LetterRenderTabProps) {
  if (hideEditActions) {
    return <LetterRenderTabReadOnly template={template} tab={tab} />;
  }

  return <LetterRenderTabForm template={template} tab={tab} />;
}
