import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { CombinedLetterErrorSummary } from '@molecules/LetterRender/CombinedLetterErrorSummary';
import {
  LetterRenderErrorProvider,
  useLetterRenderError,
} from '@providers/letter-render-error-provider';
import type { ErrorState } from '@utils/types';
import { Tabs } from 'nhsuk-react-components';

jest.mock('@providers/form-provider', () => ({
  useNHSNotifyForm: jest
    .fn()
    .mockReturnValue([{ fields: {} }, jest.fn(), false]),
}));

import { useNHSNotifyForm } from '@providers/form-provider';

const mockUseNHSNotifyForm = useNHSNotifyForm as jest.Mock;

describe('CombinedLetterErrorSummary', () => {
  beforeEach(() => {
    mockUseNHSNotifyForm.mockReturnValue([{ fields: {} }, jest.fn(), false]);
  });

  function renderComponent() {
    return render(
      <LetterRenderErrorProvider>
        <CombinedLetterErrorSummary />
      </LetterRenderErrorProvider>
    );
  }

  function renderWithLetterRenderError(letterRenderErrorState: ErrorState) {
    function Setter() {
      const { setLetterRenderErrorState } = useLetterRenderError();
      const [called, setCalled] = useState(false);

      useEffect(() => {
        if (!called) {
          setLetterRenderErrorState(letterRenderErrorState);
          setCalled(true);
        }
      }, [called, setLetterRenderErrorState]);

      return null;
    }

    return render(
      <LetterRenderErrorProvider>
        <Setter />
        <CombinedLetterErrorSummary />
      </LetterRenderErrorProvider>
    );
  }

  it('renders nothing when there are no errors', () => {
    const { container } = renderComponent();
    expect(container).not.toHaveTextContent('There is a problem');
  });

  it('displays parentErrorState field errors from the form provider', async () => {
    mockUseNHSNotifyForm.mockReturnValue([
      {
        fields: {},
        errorState: {
          fieldErrors: { 'my-field': ['Field is required'] },
        },
      },
      jest.fn(),
      false,
    ]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('error-summary')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Field is required' })
      ).toBeInTheDocument();
    });
  });

  it('displays letterRenderErrorState errors set via the provider', async () => {
    renderWithLetterRenderError({
      fieldErrors: { 'render-field': ['Render failed'] },
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-summary')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Render failed' })
      ).toBeInTheDocument();
    });
  });

  it('prefers parentErrorState over letterRenderErrorState when both are set', async () => {
    mockUseNHSNotifyForm.mockReturnValue([
      {
        fields: {},
        errorState: {
          fieldErrors: { 'parent-field': ['Parent error'] },
        },
      },
      jest.fn(),
      false,
    ]);

    renderWithLetterRenderError({
      fieldErrors: { 'render-field': ['Render error'] },
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Parent error' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Render error' })
      ).not.toBeInTheDocument();
    });
  });
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
    mockUseNHSNotifyForm.mockReturnValue([
      {
        fields: {},
        errorState: { fieldErrors: { [errorField]: ['An error'] } },
      },
      jest.fn(),
      false,
    ]);

    return render(
      <>
        <LetterRenderErrorProvider>
          <CombinedLetterErrorSummary />
        </LetterRenderErrorProvider>
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

  test('does not prevent default behaviour when the linked field does not exist in the DOM', async () => {
    mockUseNHSNotifyForm.mockReturnValue([
      {
        fields: {},
        errorState: { fieldErrors: { 'non-existent-field': ['An error'] } },
      },
      jest.fn(),
      false,
    ]);

    render(
      <LetterRenderErrorProvider>
        <CombinedLetterErrorSummary />
      </LetterRenderErrorProvider>
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
