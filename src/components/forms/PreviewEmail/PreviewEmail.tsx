'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { PreviewEmailProps } from './PreviewEmail.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function PreviewEmail({
  templateName,
  subject,
  message,
}: PreviewEmailProps) {
  const {
    components: { previewEmailFormComponent },
  } = content;

  const html = renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
          sectionHeading={previewEmailFormComponent.sectionHeader}
          templateName={templateName}
          details={previewEmailFormComponent.details}
          PreviewComponent={<Preview.Email subject={subject} value={html} />}
          FormOptionsComponent={
            <Radios
              data-testid='preview-email-form__radios'
              id='what-would-you-like-to-do-next'
              name='choice'
            >
              {previewEmailFormComponent.options.map((item, index) => (
                <Radios.Radio
                  data-testid={`preview-email-form__radios-${item.id}`}
                  key={`preview-email-form__radios-${item.id}-${index}`}
                  value={item.id}
                >
                  {item.text}
                </Radios.Radio>
              ))}
            </Radios>
          }
        />
      </div>
    </div>
  );
}
