import classNames from 'classnames';
import content from '@content/content';
import styles from './PreviewTemplateDetails.module.scss';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';
import { NHSNotifyWarningCallout } from '@atoms/NHSNotifyWarningCallout/NHSNotifyWarningCallout';
import type { DigitalTemplate } from 'nhs-notify-web-template-management-utils';

const { testMessageBanner, requestProofBanner } =
  content.components.previewDigitalTemplate;

export const PreviewTemplateDetailsBanner = ({
  digitalProofingEnabled,
  template,
}: {
  digitalProofingEnabled: boolean;
  template: DigitalTemplate;
}) => {
  const banner = digitalProofingEnabled
    ? testMessageBanner[template.templateType]
    : requestProofBanner;

  return (
    <div className={classNames('nhsuk-summary-list', styles['message-banner'])}>
      <NHSNotifyWarningCallout
        data-testid={banner['data-testid']}
        className={styles['message-banner__callout']}
      >
        <MarkdownContent
          variables={{ templateId: template.id }}
          mode='inline'
          content={banner.content}
          overrides={banner?.overrides}
        />
      </NHSNotifyWarningCallout>
    </div>
  );
};
