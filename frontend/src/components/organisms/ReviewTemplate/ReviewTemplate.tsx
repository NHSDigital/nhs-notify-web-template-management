'use client';

import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ReviewTemplateProps } from './review-template.types';

export function ReviewTemplate({
  form,
  ...props
}: Readonly<ReviewTemplateProps>) {
  return (
    <>
      {props.sectionHeading && (
        <div className='notify-confirmation-panel nhsuk-heading-l'>
          {props.sectionHeading}
        </div>
      )}
      <ZodErrorSummary errorHeading={form.errorHeading} state={form.state} />
      {props.PreviewComponent}
      <NHSNotifyRadioButtonForm
        formId={form.formId}
        radiosId={form.radiosId}
        action={form.action}
        state={form.state}
        pageHeading={form.pageHeading}
        options={form.options}
        buttonText={form.buttonText}
        legend={{
          isPgeHeading: false,
          size: 'm',
        }}
        csrfToken={form.csrfToken}
      />
    </>
  );
}
