import { render } from '@testing-library/react';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { Radios } from 'nhsuk-react-components';

test('Renders NHSNotifyRadioButtonForm correctly without errors', () => {
  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={{
        errorState: {
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
        errorState: {
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
        errorState: {
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
        errorState: {
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
        errorState: {
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
        errorState: {
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

test('Renders NHSNotifyRadioButtonForm with conditional content for a radio option', () => {
  const conditionalContent = (
    <div data-testid='conditional-content'>
      <p>This is conditional content</p>
    </div>
  );

  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={{
        errorState: {
          fieldErrors: {},
          formErrors: [],
        },
      }}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        {
          id: 'option-2',
          text: 'option 2',
          conditional: conditionalContent,
          checked: true,
        },
      ]}
      buttonText='Continue'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders NHSNotifyRadioButtonForm with nested conditional radio buttons', () => {
  const conditionalRadios = (
    <Radios id='nested-radios' data-testid='nested-radios'>
      <Radios.Radio value='nested-1' id='nested-1'>
        Nested option 1
      </Radios.Radio>
      <Radios.Radio value='nested-2' id='nested-2'>
        Nested option 2
      </Radios.Radio>
    </Radios>
  );

  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={{
        errorState: {
          fieldErrors: {},
          formErrors: [],
        },
      }}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        {
          id: 'option-2',
          text: 'option 2',
          conditional: conditionalRadios,
          checked: true,
        },
      ]}
      buttonText='Continue'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders NHSNotifyRadioButtonForm with conditional radios and validation error on nested field', () => {
  const conditionalRadios = (
    <Radios
      id='nested-radios'
      data-testid='nested-radios'
      error='Please select a nested option'
      errorProps={{ id: 'nested-radios--error-message' }}
    >
      <Radios.Radio value='nested-1' id='nested-1'>
        Nested option 1
      </Radios.Radio>
      <Radios.Radio value='nested-2' id='nested-2'>
        Nested option 2
      </Radios.Radio>
    </Radios>
  );

  const container = render(
    <NHSNotifyRadioButtonForm
      formId='form-id'
      radiosId='radios-id'
      action='/action'
      state={{
        errorState: {
          fieldErrors: {
            'nested-radios': ['Please select a nested option'],
          },
          formErrors: [],
        },
      }}
      pageHeading='Page heading'
      options={[
        { id: 'option-1', text: 'option 1' },
        {
          id: 'option-2',
          text: 'option 2',
          conditional: conditionalRadios,
          checked: true,
        },
      ]}
      buttonText='Continue'
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});
