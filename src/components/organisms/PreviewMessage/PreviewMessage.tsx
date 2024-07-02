'use client';

import { Details } from 'nhsuk-react-components';
import { PreviewMessageProps } from './PreviewMessage.types';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';

export function PreviewMessage(props: PreviewMessageProps) {
  const { form } = props;
  return (
    <>
      <ZodErrorSummary errorHeading={form.errorHeading} state={form.state} />
      <h1 data-testid='preview-message__heading'>
        <span
          data-testid='preview-message__heading-caption'
          className='nhsuk-caption-l'
        >
          {props.sectionHeading}
        </span>
        {props.templateName}
      </h1>
      <Details>
        <Details.Summary data-testid='preview-message-details__heading'>
          {props.details.heading}
        </Details.Summary>
        <Details.Text data-testid='preview-message-details__text'>
          {props.details.text.map((val, idx) => (
            <p key={`details-text-${idx}`}>{val}</p>
          ))}
        </Details.Text>
      </Details>
      {props.PreviewComponent}
      <NHSNotifyRadioButtonForm
        radiosId={form.radiosId}
        action={form.action}
        state={form.state}
        pageHeading={form.pageHeading}
        options={form.options}
        buttonText={form.buttonText}
        legend={form.legend}
      />
    </>
  );
}
