import { render } from '@testing-library/react';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

const focusMock = jest.fn();
window.HTMLElement.prototype.focus = focusMock;

const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

test('Renders NhsNotifyErrorSummary correctly without errors', () => {
  const container = render(<NhsNotifyErrorSummary errorState={undefined} />);

  expect(container.asFragment()).toMatchSnapshot();
  expect(focusMock).not.toHaveBeenCalled();
  expect(scrollIntoViewMock).not.toHaveBeenCalled();
});

test('Renders NhsNotifyErrorSummary correctly with errors', () => {
  const container = render(
    <NhsNotifyErrorSummary
      errorState={{
        fieldErrors: {
          'radios-id': ['Radio error 1', 'Radio error 2'],
          'select-id': ['Select error'],
        },
        formErrors: ['Form error', 'Form error 2'],
      }}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
  expect(focusMock).toHaveBeenCalled();
  expect(scrollIntoViewMock).toHaveBeenCalled();
});
