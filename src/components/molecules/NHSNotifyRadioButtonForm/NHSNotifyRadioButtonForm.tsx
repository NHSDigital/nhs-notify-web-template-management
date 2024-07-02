import { Radios, Button, Fieldset } from 'nhsuk-react-components';
import { FormState } from '../../../utils/types';

export type NHSNotifyRadioButtonFormProps = {
  radiosId: string;
  action: string | ((_payload: FormData) => void);
  state: FormState;
  pageHeading: string;
  options: {
    id: string;
    text: string;
  }[];
  buttonText: string;
  legend?: {
    isPgeHeading: boolean;
    size: 'l' | 'm' | 's';
  };
};

export const NHSNotifyRadioButtonForm = ({
  radiosId,
  action,
  state,
  pageHeading,
  options,
  buttonText,
  legend = { isPgeHeading: true, size: 'l' },
}: NHSNotifyRadioButtonFormProps) => (
  <form action={action}>
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
