'use client';

import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { PreviewTemplateProps } from './preview-digitial-template.types';

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
      <ZodErrorSummary errorHeading={form.errorHeading} state={form.state} />
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
