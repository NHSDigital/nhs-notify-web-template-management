import { Radios, Fieldset } from 'nhsuk-react-components';
import { FormState } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';

export type NHSNotifyRadioButtonFormProps = {
  formId: string;
  radiosId: string;
  action: string | ((payload: FormData) => void);
  state: FormState;
  pageHeading: string;
  options: {
    id: string;
    text: string;
    checked?: boolean;
  }[];
  buttonText: string;
  hint?: string;
  legend?: {
    isPgeHeading: boolean;
    size: 'l' | 'm' | 's';
  };
  learnMoreLink?: string;
  learnMoreText?: string;
  formAttributes?: DetailedHTMLProps<
    FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >;
};

export const NHSNotifyRadioButtonForm = ({
  formId,
  radiosId,
  action,
  state,
  pageHeading,
  options,
  buttonText,
  formAttributes,
  legend = { isPgeHeading: true, size: 'l' },
  hint = '',
  learnMoreLink = '',
  learnMoreText = '',
}: NHSNotifyRadioButtonFormProps) => (
  <NHSNotifyFormWrapper
    action={action}
    formId={formId}
    formAttributes={formAttributes}
  >
    <Fieldset>
      <Fieldset.Legend
        data-testid={`${radiosId}-form__legend`}
        isPageHeading={legend.isPgeHeading}
        size={legend.size}
      >
        {pageHeading}
      </Fieldset.Legend>
      {learnMoreLink && learnMoreText && (
        <p>
          <a href={learnMoreLink} target='_blank' rel='noopener noreferrer'>
            {learnMoreText}
          </a>
        </p>
      )}
      <Radios
        id={radiosId}
        hint={hint}
        error={state.validationError?.fieldErrors[radiosId]?.join(', ')}
        errorProps={{ id: `${radiosId}--error-message` }}
      >
        {options.map(({ id, text, checked }) => (
          <Radios.Radio
            value={id}
            id={`${radiosId}-${id}`}
            data-testid={`${id}-radio`}
            key={`${id}-radio`}
            defaultChecked={checked}
          >
            {text}
          </Radios.Radio>
        ))}
      </Radios>
    </Fieldset>
    <NHSNotifyButton
      type='submit'
      data-testid='submit-button'
      id={`${formId}-submit-button`}
    >
      {buttonText}
    </NHSNotifyButton>
  </NHSNotifyFormWrapper>
);
