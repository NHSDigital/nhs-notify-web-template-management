'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@templates/PreviewMessage';
import { PreviewTextMessageProps } from './PreviewTextMessage.types';

export function PreviewTextMessage({
  templateName,
  message,
  pageActions,
}: PreviewTextMessageProps) {
  const html = pageActions.renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
          type='Text message'
          templateName={templateName}
          details={{
            heading: 'Who your text message will be sent from',
            text: [
              'Set your text message sender name during onboarding.',
              'If you need to set up a different text message sender name for other messages, contact our onboarding team.',
            ],
          }}
          PreviewComponent={<Preview.TextMessage message={html} />}
          FormOptionsComponent={
            <Radios id='what-would-you-like-to-do-next' name='choice'>
              <Radios.Radio
                data-testid='preview-sms-form__radios-edit'
                value='edit'
              >
                Edit
              </Radios.Radio>
              <Radios.Radio
                data-testid='preview-sms-form__radios-send'
                value='send'
              >
                Send a text message
              </Radios.Radio>
              <Radios.Radio
                data-testid='preview-sms-form__radios-submit'
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