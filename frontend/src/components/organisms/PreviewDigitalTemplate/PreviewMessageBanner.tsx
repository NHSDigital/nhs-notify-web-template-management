import classNames from 'classnames';
import content from '@content/content';
import styles from './PreviewDigitalTemplate.module.scss';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';
import { NHSNotifyWarningCallout } from '@atoms/NHSNotifyWarningCallout/NHSNotifyWarningCallout';
import type { DigitalTemplate } from 'nhs-notify-web-template-management-utils';

const { testMessageBanner, requestProofBanner } =
  content.components.previewDigitalTemplate;

const PreviewMessageBanner = ({
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

export const RequestProofBanner = ({ templateId }: { templateId: string }) => (
  <PreviewMessageBanner
    templateId={templateId}
    testId='request-proof-message-banner'
    markdownProps={requestProofBanner}
  />
);

export function DigitalProofingBanner({
  template,
  isDigitalProofingEnabled,
}: {
  template: DigitalTemplate;
  isDigitalProofingEnabled: boolean;
}) {
  if (!isDigitalProofingEnabled) {
    return <RequestProofBanner templateId={template.id} />;
  }

  if (template.templateStatus === 'NOT_YET_SUBMITTED') {
    return (
      <PreviewMessageBanner
        templateId={template.id}
        testId='test-message-banner'
        markdownProps={{ content: testMessageBanner[template.templateType] }}
      />
    );
  }

  return null;
}
