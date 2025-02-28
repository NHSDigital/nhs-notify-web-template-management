import { render } from '@testing-library/react';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';

test('Renders NHSNotifyRadioButtonForm correctly without errors', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={{
        validationError: {
          fieldErrors: {},
          formErrors: [],
        },
      }}
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
      state={{
        validationError: {
          fieldErrors: {
            'radios-id': ['Field error'],
          },
          formErrors: ['Form error'],
        },
      }}
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
      state={{
        validationError: {
          fieldErrors: {
            'radios-id-2': ['Field error'],
          },
          formErrors: ['Form error'],
        },
      }}
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
      state={{}}
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

test('Renders NHSNotifyRadioButtonForm with learn more link', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={{
        validationError: {
          fieldErrors: {},
          formErrors: [],
        },
      }}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
      hint='Example hint'
      learnMoreLink='/features'
      learnMoreText='learn more'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders NHSNotifyRadioButtonForm without learn more link if learnMoreLink is not provided', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={{
        validationError: {
          fieldErrors: {},
          formErrors: [],
        },
      }}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
      hint='Example hint'
      learnMoreText='learn more'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders NHSNotifyRadioButtonForm without learn more link if learnMoreText is not provided', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={{
        validationError: {
          fieldErrors: {},
          formErrors: [],
        },
      }}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        { id: 'option-2', text: 'option 2' },
      ]}
      buttonText='Continue'
      hint='Example hint'
      learnMoreLink='/features'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});
