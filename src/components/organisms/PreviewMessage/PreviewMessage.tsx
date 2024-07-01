'use client';

import { Button, Details, Fieldset, Form } from 'nhsuk-react-components';
import { PreviewMessageProps } from './PreviewMessage.types';
import content from '@/src/content/content';

export function PreviewMessage(props: PreviewMessageProps) {
  const {
    components: { previewMessageComponent },
  } = content;
  return (
    <>
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
      <Form>
        <Fieldset>
          <Fieldset.Legend data-testid='preview-message-form__legend' size='m'>
            {previewMessageComponent.legendText}
          </Fieldset.Legend>
          {props.FormOptionsComponent}
        </Fieldset>
        <Button data-testid='preview-message-form__button'>
          {previewMessageComponent.buttonText}
        </Button>
      </Form>
    </>
  );
}
