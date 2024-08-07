import { Radios, Fieldset, Button } from 'nhsuk-react-components';
import { FormState } from '@utils/types';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';

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
};

export const NHSNotifyRadioButtonForm = ({
  formId,
  radiosId,
  action,
  state,
  pageHeading,
  options,
  buttonText,
  legend = { isPgeHeading: true, size: 'l' },
  hint = '',
}: NHSNotifyRadioButtonFormProps) => (
  <NHSNotifyFormWrapper action={action} formId={formId}>
    <Fieldset>
      <Fieldset.Legend
        data-testid={`${radiosId}-form__legend`}
        isPageHeading={legend.isPgeHeading}
        size={legend.size}
      >
        {pageHeading}
      </Fieldset.Legend>
      <Radios
        id={radiosId}
        hint={hint}
        error={state.validationError?.fieldErrors[radiosId]?.join(', ')}
        errorProps={{ id: `${radiosId}-error-message` }}
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
    <Button
      type='submit'
      data-testid='submit-button'
      id={`${formId}-submit-button`}
    >
      {buttonText}
    </Button>
  </NHSNotifyFormWrapper>
);
