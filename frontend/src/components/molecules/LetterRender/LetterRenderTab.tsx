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
import { getRenderDetails } from '@utils/letter-render';
import { interpolate } from '@utils/interpolate';

const { loadingText, iframe } = content.components.letterRender;

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

function LetterRenderTabContent({
  template,
  tab,
  pdfUrl,
  hideEditActions,
}: {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
  pdfUrl?: string;
  hideEditActions?: boolean;
}) {
  const [_state, _dispatch, isPending] = useNHSNotifyForm();

  const tabDescription = tab === 'longFormRender' ? 'long' : 'short';

  return (
    <div className={`nhsuk-grid-row ${styles.tabRow}`}>
      <div className='nhsuk-grid-column-one-third'>
        {hideEditActions ? (
          <LetterRenderDetails template={template} tab={tab} />
        ) : (
          <LetterRenderForm template={template} tab={tab} />
        )}
      </div>

      <div className={`nhsuk-grid-column-two-thirds ${styles.iframeColumn}`}>
        {hideEditActions ? (
          <LetterRenderIframe
            src={pdfUrl}
            title={interpolate(iframe.personalised.title, {
              tab: tabDescription,
            })}
            aria-label={interpolate(iframe.personalised.ariaLabel, {
              tab: tabDescription,
            })}
          />
        ) : (
          <PollLetterRender
            template={template}
            mode={tab}
            loadingElement={<p>{loadingText}</p>}
            forcePolling={isPending}
          >
            <LetterRenderIframe
              src={pdfUrl}
              title={interpolate(iframe.personalised.title, {
                tab: tabDescription,
              })}
              aria-label={interpolate(iframe.personalised.ariaLabel, {
                tab: tabDescription,
              })}
            />
          </PollLetterRender>
        )}
      </div>
    </div>
  );
}

export function LetterRenderTab({
  template,
  tab,
  hideEditActions,
}: LetterRenderTabProps) {
  const personalisedRender = template.files[tab];

  const formState = deriveFormState(template, personalisedRender);
  const pdfUrl = derivePdfUrl(template, tab);

  return (
    <NHSNotifyFormProvider
      initialState={formState}
      serverAction={updateLetterPreview}
    >
      <LetterRenderTabContent
        template={template}
        tab={tab}
        pdfUrl={pdfUrl}
        hideEditActions={hideEditActions}
      />
    </NHSNotifyFormProvider>
  );
}
