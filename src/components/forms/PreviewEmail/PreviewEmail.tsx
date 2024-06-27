'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@templates/PreviewMessage';
import { PreviewEmailProps } from './PreviewEmail.types';
import { MarkdownItWrapper } from '@utils/markdownit';

export const EMAIL_MD_OPTS = ['heading', 'link', 'list', 'hr'];

export function PreviewEmail({
  templateName,
  subject,
  message,
}: PreviewEmailProps) {
  const md = new MarkdownItWrapper().enableLineBreak().enable(EMAIL_MD_OPTS);

  const html = md.render(message);

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
          PreviewComponent={
            <Preview
              preview={[
                {
                  heading: 'Subject',
                  value: subject,
                },
                {
                  heading: 'Message',
                  value: html,
                },
              ]}
            />
          }
          FormOptionsComponent={
            <Radios id='what-would-you-like-to-do-next' name='choice'>
              <Radios.Radio value='edit'>Edit</Radios.Radio>
              <Radios.Radio value='send'>Send a test email</Radios.Radio>
              <Radios.Radio value='submit'>Submit</Radios.Radio>
            </Radios>
          }
        />
      </div>
    </div>
  );
}
