'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@molecules/Preview';
import { PreviewMessage } from '@organisms/PreviewMessage';
import { PreviewNHSAppProps } from './PreviewNHSApp.types';
import { renderMarkdown } from './server-actions';
import content from '@/src/content/content';

export function PreviewNHSApp({ templateName, message }: PreviewNHSAppProps) {
  const html = renderMarkdown(message);

  const {
    components: { previewNHSAppFormComponent },
  } = content;

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <PreviewMessage
          sectionHeading={previewNHSAppFormComponent.sectionHeader}
          templateName={templateName}
          details={previewNHSAppFormComponent.details}
          PreviewComponent={<Preview.NHSApp message={html} />}
          FormOptionsComponent={
            <Radios id='what-would-you-like-to-do-next' name='choice'>
              {previewNHSAppFormComponent.options.map((item, index) => (
                <Radios.Radio
                  data-testid={`preview-nhs-app-form__radios-${item.id}`}
                  key={`preview-nhs-app-form__radios-edit-${item.id}-${index}`}
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
