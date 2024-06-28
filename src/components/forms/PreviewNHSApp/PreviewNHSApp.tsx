'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@templates/PreviewMessage';
import { PreviewNHSAppProps } from './PreviewNHSApp.types';

export function PreviewNHSApp({
  templateName,
  message,
  pageActions,
}: PreviewNHSAppProps) {
  const html = pageActions.renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
          type='NHS app message'
          templateName={templateName}
          details={{
            heading: 'Who your text message will be sent from',
            text: [
              'Set your NHS App message sender name during onboarding.',
              'If you need to set up a different NHS App message sender name for other messages, contact our onboarding team.',
            ],
          }}
          PreviewComponent={<Preview.NHSApp message={html} />}
          FormOptionsComponent={
            <Radios id='what-would-you-like-to-do-next' name='choice'>
              <Radios.Radio
                data-testid='preview-nhs-app-form__radios-edit'
                value='edit'
              >
                Edit
              </Radios.Radio>
              <Radios.Radio
                data-testid='preview-nhs-app-form__radios-submit'
                value='submit'
              >
                Submit
              </Radios.Radio>
            </Radios>
          }
        />
      </div>
    </div>
  );
}
