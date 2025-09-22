'use client';

import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { PreviewTemplateProps } from './preview-digitial-template.types';
import { Button } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';

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
          <Button
            secondary
            href={`${getBasePath()}${props.editPath}`}
            data-testid='edit-template-button'
          >
            {editButton}
          </Button>
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
