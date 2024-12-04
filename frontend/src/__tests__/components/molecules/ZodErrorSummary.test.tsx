import { render } from '@testing-library/react';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';

test('Renders ZodErrorSummary correctly without errors', () => {
  const container = render(
    <ZodErrorSummary errorHeading='Error heading' state={{}} />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders ZodErrorSummary correctly with errors', () => {
  const container = render(
    <ZodErrorSummary
      errorHeading='Error heading'
      state={{
        validationError: {
          fieldErrors: {
            'radios-id': ['Field error'],
          },
          formErrors: ['Form error'],
        },
      }}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});
