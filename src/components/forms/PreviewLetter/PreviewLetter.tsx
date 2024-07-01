'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { PreviewLetterProps } from './PreviewLetter.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function PreviewLetter({
  templateName,
  heading,
  bodyText,
}: PreviewLetterProps) {
  const {
    components: { previewLetterFormComponent },
  } = content;

  const html = renderMarkdown(bodyText);

  return (
    <PreviewMessage
      sectionHeading={previewLetterFormComponent.sectionHeader}
      templateName={templateName}
      details={previewLetterFormComponent.details}
      PreviewComponent={<Preview.Letter heading={heading} bodyText={html} />}
      FormOptionsComponent={
        <Radios id='what-would-you-like-to-do-next' name='choice'>
          {previewLetterFormComponent.options.map((item, index) => (
            <Radios.Radio
              data-testid={`preview-letter-form__radios-${item.id}`}
              key={`preview-letter-form__radios-edit-${item.id}-${index}`}
              value={item.id}
            >
              {item.text}
            </Radios.Radio>
          ))}
        </Radios>
      }
    />
  );
}
