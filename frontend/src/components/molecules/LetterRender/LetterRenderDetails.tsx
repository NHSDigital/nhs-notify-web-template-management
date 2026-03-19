'use client';

import { Label } from 'nhsuk-react-components';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import {
  LONG_EXAMPLE_RECIPIENTS,
  SHORT_EXAMPLE_RECIPIENTS,
} from '@content/example-recipients';
import type { PersonalisedRenderKey } from '@utils/types';

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
      <h3 className='nhsuk-heading-s'>{copy.pdsSection.heading}</h3>

      <Label size='s'>{copy.pdsSection.recipientLabel}</Label>
      <div className='nhsuk-u-margin-bottom-4'>
        {
          [...SHORT_EXAMPLE_RECIPIENTS, ...LONG_EXAMPLE_RECIPIENTS].find(
            ({ id }) => id === render?.systemPersonalisationPackId
          )?.name
        }
      </div>

      {hasCustomFields && (
        <>
          <h3 className='nhsuk-heading-s nhsuk-u-padding-top-4'>
            {copy.customSection.heading}
          </h3>
          {template.customPersonalisation!.map((field) => {
            return (
              <div key={field}>
                <Label size='s'>{field}</Label>
                <div className='nhsuk-u-margin-bottom-4'>
                  {render?.personalisationParameters?.[field]}
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
