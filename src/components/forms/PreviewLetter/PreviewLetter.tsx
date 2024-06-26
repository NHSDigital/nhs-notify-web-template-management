'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@/molecules/Preview';
import { PreviewMessage } from '@/templates/PreviewMessage';
import { PreviewLetterProps } from './PreviewLetter.types';

export function PreviewLetter({
  templateName,
  heading,
  bodyText,
}: PreviewLetterProps) {
  return (
    <PreviewMessage
      type='Letter'
      templateName={templateName}
      details={{
        heading: ' Who your letter will be sent from',
        text: [
          `The return address is set by NHS Notify's suppliers and is printed on each letter's envelope.`,
          'If you want recipients to reply to you by letter, add your address in the content of your letter. Letter templates do not have a section for a reply address.',
        ],
      }}
      PreviewComponent={
        <Preview
          preview={[
            {
              heading: 'Heading',
              value: heading,
            },
            {
              heading: 'Body text',
              value: bodyText,
            },
          ]}
        />
      }
      FormOptionsComponent={
        <Radios id='what-would-you-like-to-do-next' name='choice'>
          <Radios.Radio value='edit'>Edit</Radios.Radio>
          <Radios.Radio value='preview'>Preview (PDF)</Radios.Radio>
          <Radios.Radio value='submit'>Submit</Radios.Radio>
        </Radios>
      }
    />
  );
}
