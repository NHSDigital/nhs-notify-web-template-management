'use client';

import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import {
  NHSNotifyFormProvider,
  useNHSNotifyForm,
} from '@providers/form-provider';
import type { RenderDetails } from 'nhs-notify-web-template-management-types';
import { LetterRenderDetails } from './LetterRenderDetails';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import { updateLetterPreview } from './server-action';
import type { FormState, PersonalisedRenderKey } from '@utils/types';
import styles from './LetterRenderTab.module.scss';
import { PollLetterRender } from '@molecules/PollLetterRender/PollLetterRender';
import { PERSONALISATION_FORMDATA_PREFIX } from '@utils/constants';
import content from '@content/content';
import { useLetterRenderError } from '@providers/letter-render-error-provider';
import { useEffect, type ReactNode } from 'react';
import { getRenderDetails } from '@utils/letter-render';
import { interpolate } from '@utils/interpolate';

const {
  letterRender: { loadingText },
  letterRenderIframe: { personalised: iframe },
} = content.components;

type LetterRenderTabProps = {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
  hideEditActions?: boolean;
};

function derivePdfUrl(
  template: AuthoringLetterTemplate,
  key: PersonalisedRenderKey
): string | undefined {
  const personalisedRender = getRenderDetails(template, key);

  if (personalisedRender.rendered) return personalisedRender.src;

  return getRenderDetails(template, 'initialRender').src;
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
  pdfUrl?: string;
  hideEditActions?: boolean;
}) {
  const [state, _dispatch, isPending] = useNHSNotifyForm();
  const { setLetterRenderErrorState } = useLetterRenderError();

  useEffect(() => {
    setLetterRenderErrorState(state.errorState);
  }, [state, setLetterRenderErrorState]);

  const tabDescription = tab === 'longFormRender' ? 'long' : 'short';

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
          <LetterRenderIframe
            src={pdfUrl}
            title={interpolate(iframe.title, {
              tab: tabDescription,
            })}
            aria-label={interpolate(iframe.ariaLabel, {
              tab: tabDescription,
            })}
          />
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
  const tabDescription = tab === 'longFormRender' ? 'long' : 'short';
  const pdfUrl = derivePdfUrl(template, tab);

  return (
    <NHSNotifyFormProvider
      initialState={formState}
      serverAction={updateLetterPreview}
    >
      <LetterRenderTabFormInner
        template={template}
        tab={tab}
        tabDescription={tabDescription}
        pdfUrl={pdfUrl}
      />
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
  const tabDescription = tab === 'longFormRender' ? 'long' : 'short';
  const pdfUrl = derivePdfUrl(template, tab);

  return (
    <LetterRenderTabLayout
      leftColumn={<LetterRenderDetails template={template} tab={tab} />}
      rightColumn={
        <LetterRenderIframe
          src={pdfUrl}
          title={interpolate(iframe.title, { tab: tabDescription })}
          aria-label={interpolate(iframe.ariaLabel, {
            tab: tabDescription,
          })}
        />
      }
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
