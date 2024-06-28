import { Radios, Button, Fieldset } from 'nhsuk-react-components';
import { FormState } from '../../../utils/types';

export type NHSNotifyRadioButtonFormProps = {
  radiosId: string;
  action: string | ((payload: FormData) => void);
  state: FormState;
  pageHeading: string;
  options: {
    id: string;
    text: string;
  }[];
  buttonText: string;
};

export const NHSNotifyRadioButtonForm = ({
  radiosId,
  action,
  state,
  pageHeading,
  options,
  buttonText,
}: NHSNotifyRadioButtonFormProps) => (
  <form action={action}>
    <Fieldset>
      <Fieldset.Legend isPageHeading={true} size='l'>
        {pageHeading}
      </Fieldset.Legend>
      <Radios
        id={radiosId}
        error={state.fieldErrors[radiosId]?.join(', ')}
        errorProps={{ id: `${radiosId}-error-message` }}
      >
        {options.map(({ id, text }) => (
          <Radios.Radio
            value={id}
            data-testid={`${id}-radio`}
            key={`${id}-radio`}
          >
            {text}
          </Radios.Radio>
        ))}
      </Radios>
    </Fieldset>
    <Button type='submit' data-testid='submit-button'>
      {buttonText}
    </Button>
  </form>
);
