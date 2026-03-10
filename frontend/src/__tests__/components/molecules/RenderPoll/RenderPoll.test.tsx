import { render, screen, act } from '@testing-library/react';
import { RenderPoll } from '@molecules/RenderPoll/RenderPoll';
import {
  RENDER_TIMEOUT_MS,
  POLL_INTERVAL_MS,
} from '@hooks/use-letter-template-poll';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { RenderDetails } from 'nhs-notify-web-template-management-types';

const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const NOW = new Date('2025-06-15T12:00:00.000Z');

const baseTemplate: AuthoringLetterTemplate = {
  id: 'template-123',
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

describe('RenderPoll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children when the render is already RENDERED', () => {
    render(
      <RenderPoll
        template={baseTemplate}
        mode='initialRender'
        loadingElement={<p>{'loading'}</p>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows loading element when the render is PENDING and fresh', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    render(
      <RenderPoll
        template={template}
        mode='initialRender'
        loadingElement={<h1>{'loading'}</h1>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

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

    render(
      <RenderPoll
        template={template}
        mode='initialRender'
        loadingElement={<p>{'loading'}</p>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders children when templateStatus is VALIDATION_FAILED', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'VALIDATION_FAILED',
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    render(
      <RenderPoll
        template={template}
        mode='initialRender'
        loadingElement={<p>{'loading'}</p>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders children when the render file for the mode is absent', () => {
    render(
      <RenderPoll
        template={baseTemplate}
        mode='longFormRender'
        loadingElement={<p>{'loading'}</p>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('uses the mode to select the correct render file', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, shortFormRender: pendingRender },
    };

    render(
      <RenderPoll
        template={template}
        mode='shortFormRender'
        loadingElement={<h1>{'loading'}</h1>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(
      screen.getByRole('heading', { name: 'loading' })
    ).toBeInTheDocument();

    expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();
  });

  it('transitions from loading to children when rerendered with a rendered template', () => {
    const pendingTemplate: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    const renderedTemplate: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: renderedRender },
    };

    const { rerender } = render(
      <RenderPoll
        template={pendingTemplate}
        mode='initialRender'
        loadingElement={<h1>{'loading'}</h1>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'loading' })
    ).toBeInTheDocument();

    rerender(
      <RenderPoll
        template={renderedTemplate}
        mode='initialRender'
        loadingElement={<h1>{'loading'}</h1>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('stops polling and shows children after the timeout is reached', () => {
    const template: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: { ...baseTemplate.files, initialRender: pendingRender },
    };

    render(
      <RenderPoll
        template={template}
        mode='initialRender'
        loadingElement={<h1>{'loading'}</h1>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

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

    render(
      <RenderPoll
        template={template}
        mode='initialRender'
        loadingElement={<h1>{'loading'}</h1>}
      >
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

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
