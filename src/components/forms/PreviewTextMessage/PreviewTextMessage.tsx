'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { PreviewTextMessageProps } from './PreviewTextMessage.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function PreviewTextMessage({
  templateName,
  message,
}: PreviewTextMessageProps) {
  const {
    components: { previewTextMessageFormComponent },
  } = content;

  const html = renderMarkdown(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
          sectionHeading={previewTextMessageFormComponent.sectionHeader}
          templateName={templateName}
          details={previewTextMessageFormComponent.details}
          PreviewComponent={<Preview.TextMessage message={html} />}
          FormOptionsComponent={
            <Radios id='what-would-you-like-to-do-next' name='choice'>
              {previewTextMessageFormComponent.options.map((item, index) => (
                <Radios.Radio
                  data-testid={`preview-sms-form__radios-${item.id}`}
                  key={`preview-${item.id}-form__radios-edit-${item.id}-${index}`}
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
