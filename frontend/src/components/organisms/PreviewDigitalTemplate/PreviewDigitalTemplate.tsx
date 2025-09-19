'use client';

import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import {
  PreviewTemplateProps,
  PreviewTemplateRoutingProps,
} from './preview-digitial-template.types';
import { Button } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';

export function PreviewDigitalTemplate({
  form,
  ...props
}: PreviewTemplateProps) {
  return (
    <>
      {props.sectionHeading && (
        <div className='notify-confirmation-panel nhsuk-heading-l'>
          {props.sectionHeading}
        </div>
      )}
      <NhsNotifyErrorSummary errorState={form.state.errorState} />
      {props.previewDetailsComponent}
      <NHSNotifyRadioButtonForm
        {...form}
        legend={{
          isPgeHeading: false,
          size: 'm',
        }}
      />
    </>
  );
}

const { editButton } = content.components.previewDigitalTemplateEditOnly;

export function PreviewDigitalTemplateEditOnly(
  props: PreviewTemplateRoutingProps
) {
  return (
    <>
      {props.sectionHeading && (
        <div className='notify-confirmation-panel nhsuk-heading-l'>
          {props.sectionHeading}
        </div>
      )}
      {props.previewDetailsComponent}
      <Button
        secondary
        href={`${getBasePath()}${props.editPath}`}
        data-testid='edit-template-link'
      >
        {editButton}
      </Button>
    </>
  );
}
