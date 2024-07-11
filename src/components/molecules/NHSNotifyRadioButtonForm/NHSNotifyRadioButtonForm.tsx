import { Radios, Fieldset, Button } from 'nhsuk-react-components';
import { FormState } from '../../../utils/types';
import { NHSNotifyFormWrapper } from '../NHSNotifyFormWrapper/NHSNotifyFormWrapper';

export type NHSNotifyRadioButtonFormProps = {
  formId: string;
  radiosId: string;
  action: string | ((payload: FormData) => void);
  state: FormState;
  pageHeading: string;
  options: {
    id: string;
    text: string;
  }[];
  buttonText: string;
  hint?: string;
};

export const NHSNotifyRadioButtonForm = ({
  formId,
  radiosId,
  action,
  state,
  pageHeading,
  options,
  buttonText,
  hint,
}: NHSNotifyRadioButtonFormProps) => (
  <NHSNotifyFormWrapper action={action} formId={formId}>
    <Fieldset>
      <Fieldset.Legend isPageHeading size='l'>
        {pageHeading}
      </Fieldset.Legend>
      <Radios
        id={radiosId}
        hint={hint}
        error={state.validationError?.fieldErrors[radiosId]?.join(', ')}
        errorProps={{ id: `${radiosId}-error-message` }}
      >
        {options.map(({ id, text }) => (
          <Radios.Radio
            value={id}
            id={`${radiosId}-${id}`}
            data-testid={`${id}-radio`}
            key={`${id}-radio`}
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
