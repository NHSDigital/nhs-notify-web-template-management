import { render, screen } from '@testing-library/react';
import { RenderPoll } from '@molecules/RenderPoll/RenderPoll';
import {
  RENDER_TIMEOUT_MS,
  useLetterTemplatePoll,
} from '@hooks/use-letter-template-poll';
import { shouldPollRender } from '@molecules/RenderPoll/RenderPoll';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { RenderDetails } from 'nhs-notify-web-template-management-types';

jest.mock('@hooks/use-letter-template-poll');
jest.mock('next/navigation');

const mockUseTemplatePoll = jest.mocked(useLetterTemplatePoll);

const NOW = new Date('2025-06-15T12:00:00.000Z');

const template: AuthoringLetterTemplate = {
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
    mockUseTemplatePoll.mockReturnValue({
      isPolling: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('forwards template and shouldPoll function to useLetterTemplatePoll', () => {
    render(
      <RenderPoll
        template={template}
        mode='initialRender'
        loadingElement={<h1>{'loading'}</h1>}
      >
        <div>content</div>
      </RenderPoll>
    );

    expect(mockUseTemplatePoll).toHaveBeenCalledWith({
      template,
      shouldPoll: expect.any(Function),
    });
  });

  it('renders children when not polling', () => {
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
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
  });

  it('renders the loading spinner with loadingElement and hides children when isPolling is true', () => {
    mockUseTemplatePoll.mockReturnValue({
      isPolling: true,
    });

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
});

describe('shouldPoll', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns false when render status is RENDERED', () => {
    const shouldPoll = shouldPollRender('initialRender');

    expect(shouldPoll(template)).toBe(false);
  });

  it('returns false when render file is absent', () => {
    const shouldPoll = shouldPollRender('longFormRender');

    expect(shouldPoll(template)).toBe(false);
  });

  it('returns true when render status is PENDING and not stale', () => {
    const shouldPoll = shouldPollRender('initialRender');

    const pendingTemplate = {
      ...template,
      files: { ...template.files, initialRender: pendingRender },
    };

    expect(shouldPoll(pendingTemplate)).toBe(true);
  });

  it('returns false when render status is PENDING but stale', () => {
    const shouldPoll = shouldPollRender('initialRender');

    const staleTemplate = {
      ...template,
      files: { ...template.files, initialRender: staleRender },
    };

    expect(shouldPoll(staleTemplate)).toBe(false);
  });

  it('uses the mode to select the appropriate render file', () => {
    const shouldPoll = shouldPollRender('shortFormRender');

    const templateWithPendingShort = {
      ...template,
      files: { ...template.files, shortFormRender: pendingRender },
    };

    expect(shouldPoll(templateWithPendingShort)).toBe(true);

    const templateWithRenderedShort = {
      ...template,
      files: { ...template.files, shortFormRender: renderedRender },
    };

    expect(shouldPoll(templateWithRenderedShort)).toBe(false);
  });
});
