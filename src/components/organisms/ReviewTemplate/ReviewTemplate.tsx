'use client';

import styles from './ReviewTemplate.module.scss';

import { Details } from 'nhsuk-react-components';
import { ReviewTemplateProps } from './ReviewTemplate.types';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';

export function ReviewTemplate(props: ReviewTemplateProps) {
  const { form } = props;
  return (
    <>
      <ZodErrorSummary errorHeading={form.errorHeading} state={form.state} />
      <h1
        data-testid='preview-message__heading'
        className={styles.review__heading}
      >
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
      />
    </>
  );
}
