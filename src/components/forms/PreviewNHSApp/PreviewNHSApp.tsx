'use client';

import { Radios } from 'nhsuk-react-components';
import { Preview } from '@/molecules/Preview';
import { PreviewMessage } from '@/templates/PreviewMessage';
import { PreviewNHSAppProps } from './PreviewNHSApp.types';
import { MarkdownItWrapper } from '@/src/utils/markdownit';

export const NHS_APP_MD_OPTS = ['heading', 'link', 'list', 'emphasis'];

export function PreviewNHSApp({ templateName, message }: PreviewNHSAppProps) {
  const md = new MarkdownItWrapper().enableLineBreak().enable(NHS_APP_MD_OPTS);

  const html = md.render(message);

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
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
                  value: html,
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
      </div>
    </div>
  );
}
