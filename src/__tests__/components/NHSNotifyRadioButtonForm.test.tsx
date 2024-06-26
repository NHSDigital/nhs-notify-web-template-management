import { render } from '@testing-library/react';
import { NHSNotifyRadioButtonForm } from '../../components/molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';

test('Renders NHSNotifyRadioButtonForm correctly without errors', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      radiosId='radios-id'
      action='/action'
      state={{
        fieldErrors: {},
        formErrors: [],
      }}
      pageHeading={'Page heading'}
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders NHSNotifyRadioButtonForm correctly with errors', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      radiosId='radios-id'
      action='/action'
      state={{
        fieldErrors: {
          'radios-id': ['Field error'],
        },
        formErrors: ['Form error'],
      }}
      pageHeading={'Page heading'}
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});
