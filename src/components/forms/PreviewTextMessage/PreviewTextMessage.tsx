'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@/molecules/Preview';
import { PreviewMessage } from '@/templates/PreviewMessage';
import { PreviewTextMessageProps } from './PreviewTextMessage.types';
import MarkdownIt from 'markdown-it';

const SMS_MD_OPTS: string[] = [];

export function PreviewTextMessage({
  templateName,
  message,
}: PreviewTextMessageProps) {
  const md = new MarkdownIt('zero').enable(SMS_MD_OPTS);

  const html = md.render(message);

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
          PreviewComponent={
            <Preview
              preview={[
                {
                  heading: 'Message',
                  value: message,
                },
              ]}
            />
          }
          FormOptionsComponent={
            <Radios id='what-would-you-like-to-do-next' name='choice'>
              <Radios.Radio value='edit'>Edit</Radios.Radio>
              <Radios.Radio value='send'>Send a text message</Radios.Radio>
              <Radios.Radio value='submit'>Submit</Radios.Radio>
            </Radios>
          }
        />
      </div>
    </div>
  );
}
