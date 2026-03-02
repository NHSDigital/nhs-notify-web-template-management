import { render, screen } from '@testing-library/react';
import {
  RenderPoll,
  isRenderAlreadyStale,
} from '@molecules/RenderPoll/RenderPoll';
import {
  RENDER_TIMEOUT_MS,
  useLetterTemplatePoll,
} from '@hooks/use-letter-template-poll';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { RenderDetails } from 'nhs-notify-web-template-management-types';

jest.mock('@hooks/use-letter-template-poll');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

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
      isTimedOut: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('forwards template and a shouldPoll function to useLetterTemplatePoll', () => {
    render(
      <RenderPoll template={template} mode='initialRender'>
        <div>content</div>
      </RenderPoll>
    );

    expect(mockUseTemplatePoll).toHaveBeenCalledWith({
      template,
      shouldPoll: expect.any(Function),
    });
  });

  describe('shouldPoll built from mode', () => {
    function getShouldPoll() {
      render(
        <RenderPoll template={template} mode='initialRender'>
          <div>content</div>
        </RenderPoll>
      );
      return mockUseTemplatePoll.mock.calls[0][0].shouldPoll;
    }

    it('returns false when render status is RENDERED', () => {
      const shouldPoll = getShouldPoll();
      expect(shouldPoll(template)).toBe(false);
    });

    it('returns true when render status is PENDING and not stale', () => {
      const shouldPoll = getShouldPoll();
      const pendingTemplate = {
        ...template,
        files: { ...template.files, initialRender: pendingRender },
      };
      expect(shouldPoll(pendingTemplate)).toBe(true);
    });

    it('returns false when render status is PENDING but stale', () => {
      const shouldPoll = getShouldPoll();
      const staleTemplate = {
        ...template,
        files: { ...template.files, initialRender: staleRender },
      };
      expect(shouldPoll(staleTemplate)).toBe(false);
    });
  });

  it('renders children when not polling', () => {
    render(
      <RenderPoll template={template} mode='initialRender'>
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(
      screen.queryByText('Uploading letter template')
    ).not.toBeInTheDocument();
  });

  it('renders the loading spinner and hides children when isPolling is true', () => {
    mockUseTemplatePoll.mockReturnValue({
      isPolling: true,
      isTimedOut: false,
    });

    render(
      <RenderPoll template={template} mode='initialRender'>
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.getByText('Uploading letter template')).toBeInTheDocument();
    expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();
  });

  it('renders children when polling has timed out (isPolling is false)', () => {
    mockUseTemplatePoll.mockReturnValue({
      isPolling: false,
      isTimedOut: true,
    });

    render(
      <RenderPoll template={template} mode='initialRender'>
        <div data-testid='page-content'>content</div>
      </RenderPoll>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(
      screen.queryByText('Uploading letter template')
    ).not.toBeInTheDocument();
  });

  describe('isRenderAlreadyStale', () => {
    it('returns false when render status is not PENDING', () => {
      expect(isRenderAlreadyStale(renderedRender, RENDER_TIMEOUT_MS)).toBe(
        false
      );
    });

    it('returns false when render is PENDING and requestedAt is within timeout', () => {
      expect(isRenderAlreadyStale(pendingRender, RENDER_TIMEOUT_MS)).toBe(
        false
      );
    });

    it('returns true when render is PENDING and requestedAt exceeds timeout', () => {
      expect(isRenderAlreadyStale(staleRender, RENDER_TIMEOUT_MS)).toBe(true);
    });
  });
});
