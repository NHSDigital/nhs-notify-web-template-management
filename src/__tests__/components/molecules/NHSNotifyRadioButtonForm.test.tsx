import { mockDeep } from 'jest-mock-extended';
import { render } from '@testing-library/react';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { FormState } from '@utils/types';

test('Renders NHSNotifyRadioButtonForm correctly without errors', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={mockDeep<FormState>({
        validationError: {
          fieldErrors: {},
          formErrors: [],
        },
      })}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
      hint='Example hint'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders NHSNotifyRadioButtonForm correctly with errors', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={mockDeep<FormState>({
        validationError: {
          fieldErrors: {
            'radios-id': ['Field error'],
          },
          formErrors: ['Form error'],
        },
      })}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders NHSNotifyRadioButtonForm - handles validation errors for other fields', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={mockDeep<FormState>({
        validationError: {
          fieldErrors: {
            'radios-id-2': ['Field error'],
          },
          formErrors: ['Form error'],
        },
      })}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders NHSNotifyRadioButtonForm - renders without validation error field', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={mockDeep<FormState>({})}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});
