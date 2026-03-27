import { Fragment } from 'react';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import {
  LONG_EXAMPLE_RECIPIENTS,
  SHORT_EXAMPLE_RECIPIENTS,
} from '@content/example-recipients';
import type { PersonalisedRenderKey } from '@utils/types';
import styles from './LetterRenderDetails.module.scss';

type LetterRenderDetailsProps = {
  template: AuthoringLetterTemplate;
  tab: PersonalisedRenderKey;
};

export function LetterRenderDetails({
  template,
  tab,
}: LetterRenderDetailsProps) {
  const { letterRender: copy } = content.components;

  const hasCustomFields =
    template.customPersonalisation && template.customPersonalisation.length > 0;

  const render = template.files[tab];

  return (
    <>
      <section aria-labelledby={`tab-${tab}-pds-heading`}>
        <h3 id={`tab-${tab}-pds-heading`} className='nhsuk-heading-s'>
          {copy.pdsSection.heading}
        </h3>

        <dl className={styles.dl}>
          <dt>{copy.pdsSection.recipientLabel}</dt>
          <dd>
            {
              [...SHORT_EXAMPLE_RECIPIENTS, ...LONG_EXAMPLE_RECIPIENTS].find(
                ({ id }) => id === render?.systemPersonalisationPackId
              )?.name
            }
          </dd>
        </dl>
      </section>

      {hasCustomFields && (
        <section aria-labelledby={`tab-${tab}-custom-personalisation`}>
          <h3
            id={`tab-${tab}-custom-personalisation`}
            className='nhsuk-heading-s nhsuk-u-padding-top-4'
          >
            {copy.customSection.heading}
          </h3>
          <dl className={styles.dl}>
            {template.customPersonalisation!.map((field) => (
              <Fragment key={field}>
                <dt>{field}</dt>
                <dd>{render?.personalisationParameters?.[field]}</dd>
              </Fragment>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}
