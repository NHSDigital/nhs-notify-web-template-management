'use client';

import { Button, Details, Fieldset, Form } from 'nhsuk-react-components';
import { PreviewMessageProps } from './PreviewMessage.types';

export function PreviewMessage(props: PreviewMessageProps) {
  return (
    <>
      <h1>
        <span className='nhsuk-caption-l'>{props.type} template</span>
        {props.templateName}
      </h1>
      <Details>
        <Details.Summary>{props.details.heading}</Details.Summary>
        <Details.Text>
          {props.details.text.map((val, idx) => (
            <p key={`details-text-${idx}`}>{val}</p>
          ))}
        </Details.Text>
      </Details>
      {props.PreviewComponent}
      <Form>
        <Fieldset>
          <Fieldset.Legend size='m'>
            What would you like to do next with this template?
          </Fieldset.Legend>
          {props.FormOptionsComponent}
        </Fieldset>
        <Button>Continue</Button>
      </Form>
    </>
  );
}
