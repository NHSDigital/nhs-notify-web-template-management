'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { PreviewLetterProps } from './PreviewLetter.types';
import { renderMarkdown } from './server-actions';

export function PreviewLetter({
  templateName,
  heading,
  bodyText,
}: PreviewLetterProps) {
  const html = renderMarkdown(bodyText);

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
      PreviewComponent={<Preview.Letter heading={heading} bodyText={html} />}
      FormOptionsComponent={
        <Radios id='what-would-you-like-to-do-next' name='choice'>
          <Radios.Radio
            data-testid='preview-letter-form__radios-edit'
            value='edit'
          >
            Edit
          </Radios.Radio>
          <Radios.Radio
            data-testid='preview-letter-form__radios-preview'
            value='preview'
          >
            Preview (PDF)
          </Radios.Radio>
          <Radios.Radio
            data-testid='preview-letter-form__radios-submit'
            value='submit'
          >
            Submit
          </Radios.Radio>
        </Radios>
      }
    />
  );
}
