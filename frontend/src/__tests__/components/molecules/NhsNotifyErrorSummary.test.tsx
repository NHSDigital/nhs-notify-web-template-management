import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { ErrorCodes } from '@utils/error-codes';
import { Tabs } from 'nhsuk-react-components';

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
  expect(scrollIntoViewMock).not.toHaveBeenCalled();
});

test('Renders NhsNotifyErrorSummary correctly with empty error state', async () => {
  const container = render(<NhsNotifyErrorSummary errorState={{}} />);

  expect(container.asFragment()).toMatchSnapshot();
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
  function trackDefaultPrevented(target: HTMLElement) {
    let wasPrevented: boolean | undefined;

    const onDocumentClick = (event: MouseEvent) => {
      if (event.target === target) {
        wasPrevented = event.defaultPrevented;
      }
    };

    document.addEventListener('click', onDocumentClick);

    return {
      wasPrevented: () => wasPrevented,
      cleanup: () => document.removeEventListener('click', onDocumentClick),
    };
  }

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

    const user = userEvent.setup();
    const errorLink = screen.getByRole('link', { name: /an error/i });

    // Simulate the hidden tab becoming visible when its tab link is clicked.
    const hiddenTabPanel = document.querySelector<HTMLElement>('#hidden-tab');
    const hiddenTabLink = document.querySelector<HTMLAnchorElement>(
      '[aria-controls="hidden-tab"].nhsuk-tabs__tab'
    );
    let hiddenTabClicked = false;

    hiddenTabLink?.addEventListener('click', () => {
      hiddenTabClicked = true;
      hiddenTabPanel?.classList.remove('nhsuk-tabs__panel--hidden');
    });

    const defaultPreventedTracker = trackDefaultPrevented(errorLink);

    try {
      await user.click(errorLink);
      expect(hiddenTabClicked).toBe(true);
      expect(hiddenTabPanel).not.toHaveClass('nhsuk-tabs__panel--hidden');
      expect(defaultPreventedTracker.wasPrevented()).toBe(true);

      const field = document.querySelector('#hidden-tab-field');
      await waitFor(() => {
        expect(field).toHaveFocus();
      });
    } finally {
      defaultPreventedTracker.cleanup();
    }
  });

  test('does not activate a hidden tab when the target field is in a visible tab panel', async () => {
    renderTabsWithError('visible-tab-field');
    const user = userEvent.setup();

    const errorLink = screen.getByRole('link', { name: /an error/i });
    const hiddenTabPanel = document.querySelector<HTMLElement>('#hidden-tab');
    const hiddenTabLink = document.querySelector<HTMLAnchorElement>(
      '[aria-controls="hidden-tab"].nhsuk-tabs__tab'
    );
    let hiddenTabClicked = false;

    hiddenTabLink?.addEventListener('click', () => {
      hiddenTabClicked = true;
    });

    // In JSDOM hash-link focus is not reliable; verify the handler does not try to activate hidden tabs.
    await user.click(errorLink);
    expect(hiddenTabClicked).toBe(false);
    expect(hiddenTabPanel).toHaveClass('nhsuk-tabs__panel--hidden');
  });

  test('does not prevent default behaviour when the target field is not inside any tab panel', async () => {
    renderTabsWithError('standalone-field');
    const user = userEvent.setup();

    const errorLink = screen.getByRole('link', { name: /an error/i });
    const defaultPreventedTracker = trackDefaultPrevented(errorLink);

    // In JSDOM hash-link focus is not reliable; verify we did not prevent default behaviour.
    try {
      await user.click(errorLink);
    } finally {
      defaultPreventedTracker.cleanup();
    }

    expect(defaultPreventedTracker.wasPrevented()).toBe(false);
  });

  test('does not interact when the event target is not an HTMLElement', async () => {
    const { container } = renderTabsWithError('hidden-tab-field');

    const errorSummary = container.querySelector('.nhsuk-error-summary')!;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    errorSummary.append(svg);

    const user = userEvent.setup();

    const errorLink = screen.getByRole('link', { name: /an error/i });
    const defaultPreventedTracker = trackDefaultPrevented(errorLink);

    try {
      await user.click(svg);
    } finally {
      defaultPreventedTracker.cleanup();
    }

    expect(defaultPreventedTracker.wasPrevented()).toBe(undefined);
  });

  test('does not interact when the click target is not inside any link', async () => {
    const { container } = renderTabsWithError('hidden-tab-field');

    // Click the error summary container directly (not on a link)
    const errorSummary = container.querySelector('.nhsuk-error-summary');

    const user = userEvent.setup();

    const errorLink = screen.getByRole('link', { name: /an error/i });
    const defaultPreventedTracker = trackDefaultPrevented(errorLink);

    try {
      await user.click(errorSummary!);
    } finally {
      defaultPreventedTracker.cleanup();
    }

    expect(defaultPreventedTracker.wasPrevented()).toBe(undefined);
  });

  test('does not prevent default behaviour when the linked field does not exist in the DOM', async () => {
    render(
      <NhsNotifyErrorSummary
        errorState={{ fieldErrors: { 'non-existent-field': ['An error'] } }}
      />
    );

    const user = userEvent.setup();

    const errorLink = screen.getByRole('link', { name: /an error/i });
    const defaultPreventedTracker = trackDefaultPrevented(errorLink);

    try {
      await user.click(errorLink!);
    } finally {
      defaultPreventedTracker.cleanup();
    }

    expect(defaultPreventedTracker.wasPrevented()).toBe(false);
  });
});
