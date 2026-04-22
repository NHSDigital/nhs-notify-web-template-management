import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { ErrorCodes } from '@utils/error-codes';
import { Tabs } from 'nhsuk-react-components';

const focusMock = jest.spyOn(window.HTMLElement.prototype, 'focus');
const scrollIntoViewMock = jest.spyOn(
  window.HTMLElement.prototype,
  'scrollIntoView'
);

beforeEach(() => {
  jest.clearAllMocks();
});

test('Renders NhsNotifyErrorSummary correctly without errors', async () => {
  const container = render(<NhsNotifyErrorSummary errorState={undefined} />);

  expect(container.asFragment()).toMatchSnapshot();
  expect(focusMock).not.toHaveBeenCalled();
  expect(scrollIntoViewMock).not.toHaveBeenCalled();
});

test('Renders NhsNotifyErrorSummary correctly with empty error state', async () => {
  const container = render(<NhsNotifyErrorSummary errorState={{}} />);

  expect(container.asFragment()).toMatchSnapshot();
  expect(focusMock).not.toHaveBeenCalled();
  expect(scrollIntoViewMock).not.toHaveBeenCalled();
});

test('Renders NhsNotifyErrorSummary correctly with falsey error state', async () => {
  const container = render(
    <NhsNotifyErrorSummary
      errorState={{
        fieldErrors: {},
        formErrors: [],
      }}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
  expect(focusMock).not.toHaveBeenCalled();
  expect(scrollIntoViewMock).not.toHaveBeenCalled();
});

test('Renders NhsNotifyErrorSummary correctly with errors', async () => {
  const container = render(
    <NhsNotifyErrorSummary
      errorState={{
        fieldErrors: {
          'radios-id': ['#1 Radio error', '#2 Radio error'],
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

test('renders correctly with markdown formatted formErrors', async () => {
  const container = render(
    <NhsNotifyErrorSummary
      errorState={{
        formErrors: [
          [
            { type: 'text', text: 'There is a **problem**' },
            {
              type: 'text',
              text: '[Click here](https://example.com) to fix it',
            },
          ],
        ],
      }}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

describe('handleErrorLinkClick — hidden tab panel behaviour', () => {
  function renderTabsWithError(errorField: string) {
    return render(
      <>
        <NhsNotifyErrorSummary
          errorState={{ fieldErrors: { [errorField]: ['An error'] } }}
        />
        <Tabs className='nhsuk-u-margin-top-6'>
          <Tabs.Title>Tab Title</Tabs.Title>
          <Tabs.List>
            <Tabs.ListItem id='visible-tab'>Visible Tab</Tabs.ListItem>
            <Tabs.ListItem id='hidden-tab'>Hidden Tab</Tabs.ListItem>
          </Tabs.List>
          <Tabs.Contents id='visible-tab'>
            <input id='visible-tab-field' />
          </Tabs.Contents>
          <Tabs.Contents id='hidden-tab'>
            <input id='hidden-tab-field' />
          </Tabs.Contents>
        </Tabs>
        <input id='standalone-field' />
      </>
    );
  }

  test('activates the hidden tab and focuses the field when its error link is clicked', async () => {
    renderTabsWithError('hidden-tab-field');

    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        cb(0);
        return 0;
      });

    const clickSpy = jest
      .spyOn(HTMLElement.prototype, 'click')
      .mockImplementation(function (this: HTMLElement) {
        // Simulate the tab panel becoming visible when the NHS UK tab link is clicked
        if (this.classList.contains('nhsuk-tabs__tab')) {
          document
            .querySelector('.nhsuk-tabs__panel--hidden')
            ?.classList.remove('nhsuk-tabs__panel--hidden');
        }
      });

    focusMock.mockClear();

    const errorLink = screen.getByRole('link', { name: /an error/i });
    fireEvent.click(errorLink);

    expect(clickSpy).toHaveBeenCalled();

    const field = document.querySelector('#hidden-tab-field');
    expect(focusMock).toHaveBeenCalledTimes(1);
    expect(focusMock.mock.instances[0]).toBe(field);

    clickSpy.mockRestore();
    rafSpy.mockRestore();
  });

  test('does not intercept the click when the target field is in a visible tab panel', () => {
    renderTabsWithError('visible-tab-field');

    const clickSpy = jest
      .spyOn(HTMLElement.prototype, 'click')
      .mockImplementation(jest.fn());

    const errorLink = screen.getByRole('link', { name: /an error/i });
    fireEvent.click(errorLink);

    expect(clickSpy).not.toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  test('link focuses without handler interacting when the target field is not inside any tab panel', () => {
    renderTabsWithError('standalone-field');

    // No tab links clicked — if the handler incorrectly tried to interact it would throw
    const errorLink = screen.getByRole('link', { name: /an error/i });
    expect(() => fireEvent.click(errorLink)).not.toThrow();
    expect(focusMock).toHaveBeenCalledTimes(1);
  });

  test('does not interact when the event target is not an HTMLElement', () => {
    const { container } = renderTabsWithError('hidden-tab-field');

    const errorSummary = container.querySelector('.nhsuk-error-summary')!;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    errorSummary.append(svg);

    focusMock.mockClear();
    expect(() => fireEvent.click(svg, { bubbles: true })).not.toThrow();
    expect(focusMock).not.toHaveBeenCalled();
  });

  test('does not interact when the click target is not inside any link', () => {
    const { container } = renderTabsWithError('hidden-tab-field');

    // Click the error summary container directly (not on a link)
    const errorSummary = container.querySelector('.nhsuk-error-summary');
    expect(errorSummary).toBeTruthy();

    focusMock.mockClear();
    expect(() =>
      fireEvent.click(errorSummary!, { bubbles: true })
    ).not.toThrow();
    expect(focusMock).not.toHaveBeenCalled();
  });

  test('does not interact when the linked field does not exist in the DOM', () => {
    render(
      <NhsNotifyErrorSummary
        errorState={{ fieldErrors: { 'non-existent-field': ['An error'] } }}
      />
    );

    focusMock.mockClear();
    const errorLink = screen.getByRole('link', { name: /an error/i });
    expect(() => fireEvent.click(errorLink)).not.toThrow();
    expect(focusMock).not.toHaveBeenCalled();
  });
});
