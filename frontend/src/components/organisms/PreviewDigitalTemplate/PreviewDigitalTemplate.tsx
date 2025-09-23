'use client';

import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { PreviewTemplateProps } from './preview-digitial-template.types';
import { Button } from 'nhsuk-react-components';
import content from '@content/content';
import Link from 'next/link';

const { editButton } = content.components.previewDigitalTemplate;

export function PreviewDigitalTemplate(props: PreviewTemplateProps) {
  return (
    <>
      {props.sectionHeading && (
        <div className='notify-confirmation-panel nhsuk-heading-l'>
          {props.sectionHeading}
        </div>
      )}
      {props.routingEnabled ? (
        <>
          {props.previewDetailsComponent}
          <Link href={props.editPath} passHref legacyBehavior>
            <Button secondary data-testid='edit-template-button'>
              {editButton}
            </Button>
          </Link>
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
