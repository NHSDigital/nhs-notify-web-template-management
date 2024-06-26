'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@/molecules/Preview';
import { PreviewMessage } from '@/templates/PreviewMessage';
import { PreviewNHSAppProps } from './PreviewNHSApp.types';

export function PreviewNHSApp({ templateName, message }: PreviewNHSAppProps) {
  return (
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
          <Radios.Radio value='submit'>Submit</Radios.Radio>
        </Radios>
      }
    />
  );
}
