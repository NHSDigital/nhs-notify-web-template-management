'use client';

import { Button, Details, Fieldset, Form } from 'nhsuk-react-components';
import { PreviewMessageProps } from './PreviewMessage.types';

export function PreviewMessage(props: PreviewMessageProps) {
  return (
    <>
      <h1 data-testid='preview-message__heading'>
        <span
          data-testid='preview-message__heading-caption'
          className='nhsuk-caption-l'
        >
          {props.type} template
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
            What would you like to do next with this template?
          </Fieldset.Legend>
          {props.FormOptionsComponent}
        </Fieldset>
        <Button data-testid='preview-message-form__button'>Continue</Button>
      </Form>
    </>
  );
}
