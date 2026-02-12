'use client';

import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { NHSNotifyTabs, type TabItem } from '@atoms/NHSNotifyTabs';
import { LetterRenderTab } from './LetterRenderTab';

export function LetterRender({
  template,
}: {
  template: AuthoringLetterTemplate;
}) {
  const { letterRender: copy } = content.components;

  const tabs: TabItem[] = [
    {
      id: 'tab-short',
      label: copy.tabs.short,
      content: <LetterRenderTab template={template} tab='short' />,
    },
    {
      id: 'tab-long',
      label: copy.tabs.long,
      content: <LetterRenderTab template={template} tab='long' />,
    },
  ];

  return (
    <section className='nhsuk-u-margin-top-6'>
      <h2 className='nhsuk-heading-m'>{copy.heading}</h2>
      <p>{copy.guidance}</p>

      <NHSNotifyTabs
        title={copy.tabTitle}
        tabs={tabs}
        className='nhsuk-u-margin-top-6'
      />
    </section>
  );
}
