'use client';

import { Tabs } from 'nhsuk-react-components';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import content from '@content/content';
import { LetterPreviewTabContent } from './LetterPreviewTabContent';
import { updateLetterPreview } from './server-action';
import type { LetterPreviewFormState, LetterPreviewVariant } from './types';

function buildFormState(
  template: AuthoringLetterTemplate,
  variant: LetterPreviewVariant
): LetterPreviewFormState {
  const renderDetails =
    variant === 'short'
      ? template.files.shortFormRender
      : template.files.longFormRender;

  return {
    templateId: template.id,
    variant,
    pdsPersonalisationPackId: renderDetails?.pdsPersonalisationPackId ?? '',
    personalisationParameters: renderDetails?.personalisationParameters ?? {},
  };
}

export function LetterPreviewSection({
  template,
}: {
  template: AuthoringLetterTemplate;
}) {
  const { letterPreviewSection: copy } = content.components;

  const shortInitialState = buildFormState(template, 'short');
  const longInitialState = buildFormState(template, 'long');

  return (
    <section className='nhsuk-u-margin-top-6'>
      <h2 className='nhsuk-heading-m'>{copy.heading}</h2>
      <p>{copy.guidance}</p>
      <p>
        <a
          href={copy.learnMoreLink.href}
          target='_blank'
          rel='noopener noreferrer'
        >
          {copy.learnMoreLink.text}
        </a>
      </p>

      <Tabs className='nhsuk-u-margin-top-6'>
        <Tabs.Title>{copy.tabTitle}</Tabs.Title>
        <Tabs.List>
          <Tabs.ListItem id='tab-short'>{copy.tabs.short}</Tabs.ListItem>
          <Tabs.ListItem id='tab-long'>{copy.tabs.long}</Tabs.ListItem>
        </Tabs.List>

        <Tabs.Contents id='tab-short'>
          <NHSNotifyFormProvider
            serverAction={updateLetterPreview}
            initialState={shortInitialState}
          >
            <LetterPreviewTabContent template={template} variant='short' />
          </NHSNotifyFormProvider>
        </Tabs.Contents>

        <Tabs.Contents id='tab-long'>
          <NHSNotifyFormProvider
            serverAction={updateLetterPreview}
            initialState={longInitialState}
          >
            <LetterPreviewTabContent template={template} variant='long' />
          </NHSNotifyFormProvider>
        </Tabs.Contents>
      </Tabs>
    </section>
  );
}
