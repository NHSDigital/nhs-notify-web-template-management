import { render } from '@testing-library/react';
import { ZodErrorSummary } from '../../components/molecules/ZodErrorSummary/ZodErrorSummary';
import { mockDeep } from 'jest-mock-extended';
import { FormState } from '@/src/utils/types';

test('Renders ZodErrorSummary correctly without errors', () => {
  const container = render(
    <ZodErrorSummary
      errorHeading='Error heading'
      state={mockDeep<FormState>({ validationError: null })}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('Renders ZodErrorSummary correctly with errors', () => {
  const container = render(
    <ZodErrorSummary
      errorHeading='Error heading'
      state={mockDeep<FormState>({
        validationError: {
          fieldErrors: {
            'radios-id': ['Field error'],
          },
          formErrors: ['Form error'],
        },
      })}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});
