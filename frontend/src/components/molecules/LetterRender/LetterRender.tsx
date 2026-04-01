'use client';

import Link from 'next/link';
import { Tabs } from 'nhsuk-react-components';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { LetterRenderTab } from './LetterRenderTab';

export function LetterRender({
  template,
  hideEditActions,
}: {
  template: AuthoringLetterTemplate;
  hideEditActions?: boolean;
}) {
  const { letterRender: copy } = content.components;

  return (
    <section className='nhsuk-u-margin-top-6'>
      <h2 className='nhsuk-heading-m'>{copy.heading}</h2>

      {!hideEditActions && (
        <>
          <p>{copy.guidance}</p>
          <Link
            href={copy.guidanceLink.href}
            className='nhsuk-body'
            target='_blank'
            rel='noopener noreferrer'
          >
            {copy.guidanceLink.text}
          </Link>
        </>
      )}

      <Tabs className='nhsuk-u-margin-top-6'>
        <Tabs.Title>{copy.tabTitle}</Tabs.Title>
        <Tabs.List>
          <Tabs.ListItem id='tab-short'>{copy.tabs.short}</Tabs.ListItem>
          <Tabs.ListItem id='tab-long'>{copy.tabs.long}</Tabs.ListItem>
        </Tabs.List>
        <Tabs.Contents id='tab-short'>
          <LetterRenderTab
            template={template}
            tab='shortFormRender'
            hideEditActions={hideEditActions}
          />
        </Tabs.Contents>
        <Tabs.Contents id='tab-long'>
          <LetterRenderTab
            template={template}
            tab='longFormRender'
            hideEditActions={hideEditActions}
          />
        </Tabs.Contents>
      </Tabs>
    </section>
  );
}
