'use client';

import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { PreviewTemplateProps } from './preview-digital-template.types';
import { Button } from 'nhsuk-react-components';
import content from '@content/content';
import Link from 'next/link';
import { useFeatureFlags } from '@providers/client-config-provider';
import {
  DigitalTemplateType,
  sendDigitalTemplateTestMessageUrl,
} from 'nhs-notify-web-template-management-utils';
import { NHSNotifyWarningCallout } from '@atoms/NHSNotifyWarningCallout/NHSNotifyWarningCallout';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';
import classNames from 'classnames';
import styles from './PreviewDigitalTemplate.module.scss';

const { editButton, sendTestMessageButton } =
  content.components.previewDigitalTemplate;

const { testMessageBanner, requestProofBanner } =
  content.components.previewDigitalTemplate;

export function PreviewDigitalTemplate(props: PreviewTemplateProps) {
  const features = useFeatureFlags();

  const { template, sectionHeading, editPath } = props;

  const featureFlagMap: Record<DigitalTemplateType, boolean | undefined> = {
    NHS_APP: features.digitalProofingNhsApp,
    SMS: features.digitalProofingSms,
    EMAIL: features.digitalProofingEmail,
  };

  const isDigitalProofingEnabledForType =
    !!featureFlagMap[template.templateType];

  const canSendTestMessage =
    isDigitalProofingEnabledForType &&
    template.templateStatus === 'NOT_YET_SUBMITTED';

  // Do not show the banner when digital proofing is enabled and the template is already submitted
  const showMessageBanner =
    !isDigitalProofingEnabledForType || canSendTestMessage;

  const banner = isDigitalProofingEnabledForType
    ? {
        content: testMessageBanner[template.templateType],
        overrides: undefined,
      }
    : requestProofBanner;

  return (
    <>
      {sectionHeading && (
        <div className='notify-confirmation-panel nhsuk-heading-l'>
          {sectionHeading}
        </div>
      )}
      {features.routing ? (
        <>
          {props.previewDetailsComponent}

          {showMessageBanner && (
            <div
              className={classNames(
                'nhsuk-summary-list',
                styles['message-banner']
              )}
            >
              <NHSNotifyWarningCallout
                data-testid='message-banner'
                className={styles['message-banner__callout']}
              >
                <MarkdownContent
                  variables={{ templateId: template.id }}
                  mode='inline'
                  {...banner}
                />
              </NHSNotifyWarningCallout>
            </div>
          )}

          <Link href={editPath} passHref legacyBehavior>
            <Button secondary data-testid='edit-template-button'>
              {editButton}
            </Button>
          </Link>

          {canSendTestMessage && (
            <Link
              href={sendDigitalTemplateTestMessageUrl(
                template.templateType,
                template.id
              )}
              passHref
              legacyBehavior
            >
              <Button
                secondary
                className='nhsuk-u-margin-left-3'
                data-testid='send-test-message-button'
              >
                {sendTestMessageButton}
              </Button>
            </Link>
          )}
        </>
      ) : (
        <>
          <NhsNotifyErrorSummary errorState={props.form.state.errorState} />
          {props.previewDetailsComponent}
          <NHSNotifyRadioButtonForm
            {...props.form}
            legend={{
              isPgeHeading: false,
              size: 'm',
            }}
          />
        </>
      )}
    </>
  );
}
