'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { PreviewEmailProps } from './PreviewEmail.types';

export function PreviewEmail({
  templateName,
  subject,
  message,
  pageActions,
}: PreviewEmailProps) {
  const html = pageActions.renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
          type='Email'
          templateName={templateName}
          details={{
            heading: 'Who your email will be sent from',
            text: [
              'Set your reply-to and from email addresses during onboarding.',
              'If you need to set up a different reply-to or from address for other messages, contact our onboarding team.',
            ],
          }}
          PreviewComponent={<Preview.Email subject={subject} value={html} />}
          FormOptionsComponent={
            <Radios
              data-testid='preview-email-form__radios'
              id='what-would-you-like-to-do-next'
              name='choice'
            >
              <Radios.Radio
                data-testid='preview-email-form__radios-edit'
                value='edit'
              >
                Edit
              </Radios.Radio>
              <Radios.Radio
                data-testid='preview-email-form__radios-send'
                value='send'
              >
                Send a test email
              </Radios.Radio>
              <Radios.Radio
                data-testid='preview-email-form__radios-submit'
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
