import { render } from '@testing-library/react';
import { ZodErrorSummary } from '../../components/molecules/ZodErrorSummary/ZodErrorSummary';

test('Renders ZodErrorSummary correctly without errors', () => {
  const container = render(
    <ZodErrorSummary
      errorHeading='Error heading'
      state={{
        fieldErrors: {},
        formErrors: [],
      }}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders v correctly with errors', () => {
  const container = render(
    <ZodErrorSummary
      errorHeading='Error heading'
      state={{
        fieldErrors: {
          'radios-id': ['Field error'],
        },
        formErrors: ['Form error'],
      }}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});
