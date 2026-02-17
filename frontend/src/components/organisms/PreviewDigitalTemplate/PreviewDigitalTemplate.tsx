'use client';

import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { TestMessageBanner } from '@molecules/TestMessageBanner/TestMessageBanner';
import { PreviewTemplateProps } from './preview-digital-template.types';
import { Button } from 'nhsuk-react-components';
import content from '@content/content';
import Link from 'next/link';
import { useFeatureFlags } from '@providers/client-config-provider';
import {
  DigitalTemplateType,
  sendDigitalTemplateTestMessageUrl,
} from 'nhs-notify-web-template-management-utils';

const { editButton, sendTestMessageButton } =
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
    !!featureFlagMap[template.templateType as DigitalTemplateType] &&
    template.templateStatus === 'NOT_YET_SUBMITTED';

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

          {isDigitalProofingEnabledForType && (
            <TestMessageBanner
              templateType={template.templateType as DigitalTemplateType}
              templateId={template.id}
            />
          )}

          <Link href={editPath} passHref legacyBehavior>
            <Button secondary data-testid='edit-template-button'>
              {editButton}
            </Button>
          </Link>

          {isDigitalProofingEnabledForType && (
            <Link
              href={sendDigitalTemplateTestMessageUrl(
                template.templateType as DigitalTemplateType,
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
