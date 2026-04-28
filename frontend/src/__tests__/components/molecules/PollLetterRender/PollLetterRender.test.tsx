import { render, screen, act } from '@testing-library/react';
import {
  PollLetterRender,
  RENDER_TIMEOUT_MS,
  POLL_INTERVAL_MS,
} from '@molecules/PollLetterRender/PollLetterRender';
import { LetterRenderPollingProvider } from '@providers/letter-render-polling-provider';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { RenderDetails } from 'nhs-notify-web-template-management-types';
import { RenderKey } from '@utils/types';

const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const NOW = new Date('2025-06-15T12:00:00.000Z');

const baseTemplate: AuthoringLetterTemplate = {
  id: 'template-123',
  campaignId: 'campaign',
  clientId: 'client-id',
  name: 'Test Authoring Letter',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  letterType: 'x0',
  language: 'en',
  letterVersion: 'AUTHORING',
  letterVariantId: 'variant-1',
  files: {
    docxTemplate: {
      currentVersion: 'v1',
      fileName: 'template.docx',
      virusScanStatus: 'PASSED',
    },
    initialRender: {
      fileName: 'render.pdf',
      currentVersion: 'v1',
      status: 'RENDERED',
      pageCount: 2,
    },
  },
  systemPersonalisation: [],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

const pendingRender: RenderDetails = {
  status: 'PENDING',
  requestedAt: NOW.toISOString(),
};

const staleRender: RenderDetails = {
  status: 'PENDING',
  requestedAt: new Date(NOW.getTime() - RENDER_TIMEOUT_MS - 5000).toISOString(),
};

const renderedRender: RenderDetails = {
  status: 'RENDERED',
  fileName: 'render.pdf',
  currentVersion: 'v1',
  pageCount: 2,
};

function renderComponent(
  template: AuthoringLetterTemplate,
  mode: RenderKey,
  startPollingTimestamp?: string
) {
  return render(
    <LetterRenderPollingProvider>
      <PollLetterRender
        template={template}
        mode={mode}
        loadingElement={<h1>{'loading'}</h1>}
        startPollingTimestamp={startPollingTimestamp}
      >
        <div data-testid='page-content'>content</div>
      </PollLetterRender>
    </LetterRenderPollingProvider>
  );
}

function rerenderComponent(
  rerender: (ui: React.ReactElement) => void,
  template: AuthoringLetterTemplate,
  mode: RenderKey,
  startPollingTimestamp?: string
) {
  return rerender(
    <LetterRenderPollingProvider>
      <PollLetterRender
        template={template}
        mode={mode}
        loadingElement={<h1>{'loading'}</h1>}
        startPollingTimestamp={startPollingTimestamp}
      >
        <div data-testid='page-content'>content</div>
      </PollLetterRender>
    </LetterRenderPollingProvider>
  );
}

describe('PollLetterRender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children when the render is already RENDERED', () => {
    renderComponent(baseTemplate, 'initialRender');

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows loading element when the render is PENDING and fresh', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    renderComponent(template, 'initialRender');

    expect(
      screen.getByRole('heading', { name: 'loading' })
    ).toBeInTheDocument();

    expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();
  });

  it('renders children when the render is PENDING but stale', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: staleRender },
    };

    renderComponent(template, 'initialRender');

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders children when templateStatus is VALIDATION_FAILED', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'VALIDATION_FAILED',
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    renderComponent(template, 'initialRender');

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders children when the render file for the mode is absent', () => {
    renderComponent(baseTemplate, 'longFormRender');

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('uses the mode to select the correct render file', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, shortFormRender: pendingRender },
    };

    renderComponent(template, 'shortFormRender');

    expect(
      screen.getByRole('heading', { name: 'loading' })
    ).toBeInTheDocument();

    expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();
  });

  it('transitions from loading to children when rerendered with a RENDERED template', () => {
    const pendingTemplate: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    const renderedTemplate: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: renderedRender },
    };

    const { rerender } = renderComponent(pendingTemplate, 'initialRender');

    expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'loading' })
    ).toBeInTheDocument();

    rerenderComponent(rerender, renderedTemplate, 'initialRender');

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('stops polling and shows children after the timeout is reached', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    renderComponent(template, 'initialRender');

    expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(RENDER_TIMEOUT_MS);
    });

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('calls router.refresh on each poll interval while polling', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    renderComponent(template, 'initialRender');

    expect(mockRefresh).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });

  it('does not call router.refresh after timeout', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    renderComponent(template, 'initialRender');

    act(() => {
      jest.advanceTimersByTime(RENDER_TIMEOUT_MS);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(10);

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS * 3);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(10);
  });

  describe('startPollingTimestamp', () => {
    const pollingTimestamp = NOW.toISOString();

    it('shows loading element when startPollingTimestamp is set even if render is RENDERED', () => {
      const template: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: { ...baseTemplate.files, longFormRender: renderedRender },
      };

      renderComponent(template, 'longFormRender', pollingTimestamp);

      expect(
        screen.getByRole('heading', { name: 'loading' })
      ).toBeInTheDocument();

      expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();
    });

    it('initiates polling when startPollingTimestamp transitions from undefined to a value', () => {
      const { rerender } = renderComponent(
        baseTemplate,
        'longFormRender',
        undefined
      );

      expect(screen.getByTestId('page-content')).toBeInTheDocument();

      rerenderComponent(
        rerender,
        baseTemplate,
        'longFormRender',
        pollingTimestamp
      );

      expect(
        screen.getByRole('heading', { name: 'loading' })
      ).toBeInTheDocument();

      expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();
    });

    it('does not stop polling while startPollingTimestamp is set and template has not been updated', () => {
      const template: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: { ...baseTemplate.files, longFormRender: renderedRender },
      };

      const { rerender } = renderComponent(
        template,
        'longFormRender',
        pollingTimestamp
      );

      expect(
        screen.getByRole('heading', { name: 'loading' })
      ).toBeInTheDocument();

      rerenderComponent(rerender, template, 'longFormRender', pollingTimestamp);

      expect(
        screen.getByRole('heading', { name: 'loading' })
      ).toBeInTheDocument();
    });

    it('stops polling after timeout even with startPollingTimestamp set', () => {
      const template: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: { ...baseTemplate.files, longFormRender: pendingRender },
      };

      renderComponent(template, 'longFormRender', pollingTimestamp);

      expect(
        screen.getByRole('heading', { name: 'loading' })
      ).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(RENDER_TIMEOUT_MS);
      });

      expect(screen.getByTestId('page-content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('keeps polling via startPollingTimestamp until template updatedAt catches up', () => {
      const pendingTemplate: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: { ...baseTemplate.files, shortFormRender: pendingRender },
      };

      const renderedTemplate: AuthoringLetterTemplate = {
        ...baseTemplate,
        updatedAt: new Date(NOW.getTime() + 1000).toISOString(),
        files: { ...baseTemplate.files, shortFormRender: renderedRender },
      };

      const { rerender } = renderComponent(
        baseTemplate,
        'shortFormRender',
        pollingTimestamp
      );

      expect(
        screen.getByRole('heading', { name: 'loading' })
      ).toBeInTheDocument();

      // template has not been updated yet — still polling
      rerenderComponent(
        rerender,
        baseTemplate,
        'shortFormRender',
        pollingTimestamp
      );

      expect(
        screen.getByRole('heading', { name: 'loading' })
      ).toBeInTheDocument();

      // template is updated to PENDING
      rerenderComponent(
        rerender,
        pendingTemplate,
        'shortFormRender',
        pollingTimestamp
      );

      expect(
        screen.getByRole('heading', { name: 'loading' })
      ).toBeInTheDocument();

      // template is RENDERED with updatedAt after startPollingTimestamp
      rerenderComponent(
        rerender,
        renderedTemplate,
        'shortFormRender',
        pollingTimestamp
      );

      expect(screen.getByTestId('page-content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('calls router.refresh while startPollingTimestamp is active', () => {
      renderComponent(baseTemplate, 'shortFormRender', pollingTimestamp);

      expect(mockRefresh).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(POLL_INTERVAL_MS);
      });

      expect(mockRefresh).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(POLL_INTERVAL_MS);
      });

      expect(mockRefresh).toHaveBeenCalledTimes(2);
    });
  });
});
