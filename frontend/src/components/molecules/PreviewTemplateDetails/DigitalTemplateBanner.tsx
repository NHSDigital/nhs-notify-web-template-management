import classNames from 'classnames';
import content from '@content/content';
import styles from './PreviewTemplateDetails.module.scss';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';
import { NHSNotifyWarningCallout } from '@atoms/NHSNotifyWarningCallout/NHSNotifyWarningCallout';
import type { DigitalTemplate } from 'nhs-notify-web-template-management-utils';

const { testMessageBanner, requestProofBanner } =
  content.components.previewDigitalTemplate;

const Banner = ({
  templateId,
  testId,
  markdownProps,
}: {
  templateId: string;
  testId: string;
  markdownProps: React.ComponentProps<typeof MarkdownContent>;
}) => (
  <div className={classNames('nhsuk-summary-list', styles['message-banner'])}>
    <NHSNotifyWarningCallout
      data-testid={testId}
      className={styles['message-banner__callout']}
    >
      <MarkdownContent
        variables={{ templateId }}
        mode='inline'
        {...markdownProps}
      />
    </NHSNotifyWarningCallout>
  </div>
);

export const DigitalTemplateBanner = ({
  digitalProofingEnabled,
  template,
}: {
  digitalProofingEnabled: boolean;
  template: DigitalTemplate;
}) => {
  if (digitalProofingEnabled) {
    return (
      <Banner
        templateId={template.id}
        testId='test-message-banner'
        markdownProps={{ content: testMessageBanner[template.templateType] }}
      />
    );
  }

  return (
    <Banner
      templateId={template.id}
      testId='request-proof-message-banner'
      markdownProps={requestProofBanner}
    />
  );
};
