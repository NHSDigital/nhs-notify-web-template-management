import { render, screen, waitFor } from '@testing-library/react';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { ErrorCodes } from '@utils/error-codes';

const focusMock = jest.spyOn(window.HTMLElement.prototype, 'focus');
const scrollIntoViewMock = jest.spyOn(
  window.HTMLElement.prototype,
  'scrollIntoView'
);

beforeEach(() => {
  jest.clearAllMocks();
});

test('Renders NhsNotifyErrorSummary correctly without errors', () => {
  const container = render(<NhsNotifyErrorSummary errorState={undefined} />);

  expect(container.asFragment()).toMatchSnapshot();
  expect(focusMock).not.toHaveBeenCalled();
  expect(scrollIntoViewMock).not.toHaveBeenCalled();
});

test('Renders NhsNotifyErrorSummary correctly with errors', async () => {
  const container = render(
    <NhsNotifyErrorSummary
      errorState={{
        fieldErrors: {
          'radios-id': ['Radio error 1', 'Radio error 2'],
          'select-id': [
            'Select error',
            ErrorCodes.MESSAGE_CONTAINS_INVALID_PERSONALISATION_FIELD_NAME,
          ],
        },
        formErrors: ['Form error', 'Form error 2'],
      }}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
  expect(focusMock).toHaveBeenCalled();
  expect(scrollIntoViewMock).toHaveBeenCalled();

  const errorSummaryHeading = await screen.getByTestId('error-summary');

  // "error-summary" test id targets the nested heading rather than the top level of the error summary
  // so we need to assert against the parent element
  await waitFor(() => {
    expect(errorSummaryHeading.parentElement).toHaveFocus();
  });
});
