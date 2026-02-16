'use client';

import { WarningCallout } from 'nhsuk-react-components';
import { DigitalTemplateType } from 'nhs-notify-web-template-management-utils';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';
import styles from './TestMessageBanner.module.scss';

import copy from '@content/content';
import classNames from 'classnames';

export type TestMessageBannerProps = {
  templateType: DigitalTemplateType;
  templateId: string;
};

export function TestMessageBanner({
  templateType,
  templateId,
}: TestMessageBannerProps) {
  const content =
    copy.components.previewDigitalTemplate.testMessageBanner[templateType];

  return (
    <div
      className={classNames(
        styles['test-message-banner'],
        'nhsuk-summary-list',
        'nhsuk-u-margin-bottom-6'
      )}
    >
      <WarningCallout data-testid='test-message-banner'>
        <MarkdownContent
          content={content}
          variables={{ templateId }}
          mode='inline'
        />
      </WarningCallout>
    </div>
  );
}
