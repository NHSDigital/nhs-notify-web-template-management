import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PreviewAuthoringLetterTemplate,
  isRenderAlreadyStale,
} from '@organisms/PreviewAuthoringLetterTemplate/PreviewAuthoringLetterTemplate';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { RENDER_TIMEOUT_MS, useTemplatePoll } from '@hooks/use-template-poll';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import type {
  AuthoringLetterTemplate,
  FormState,
} from 'nhs-notify-web-template-management-utils';

jest.mock('@hooks/use-template-poll');
jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));
jest.mock('@utils/csrf-utils');

const mockUseTemplatePoll = jest.mocked(useTemplatePoll);

const mockServerAction = jest.fn().mockResolvedValue({
  fields: {},
} satisfies FormState);

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <NHSNotifyFormProvider serverAction={mockServerAction}>
      {ui}
    </NHSNotifyFormProvider>
  );
}

const NOW = new Date('2025-06-15T12:00:00.000Z');

const renderedTemplate: AuthoringLetterTemplate = {
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

const pendingTemplate: AuthoringLetterTemplate = {
  ...renderedTemplate,
  files: {
    docxTemplate: {
      currentVersion: 'v1',
      fileName: 'template.docx',
      virusScanStatus: 'PASSED',
    },
    initialRender: {
      status: 'PENDING',
      requestedAt: NOW.toISOString(),
    },
  },
};

// Shared stale fixture: PENDING with requestedAt exceeding RENDER_TIMEOUT_MS
const staleTemplate: AuthoringLetterTemplate = {
  ...renderedTemplate,
  files: {
    docxTemplate: {
      currentVersion: 'v1',
      fileName: 'template.docx',
      virusScanStatus: 'PASSED',
    },
    initialRender: {
      status: 'PENDING',
      requestedAt: new Date(
        NOW.getTime() - RENDER_TIMEOUT_MS - 5000
      ).toISOString(),
    },
  },
};

describe('PreviewAuthoringLetterTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: NOW });
    mockUseTemplatePoll.mockReturnValue({
      isPolling: false,
      isTimedOut: false,
    });
    jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('when initialRender is RENDERED', () => {
    it('renders page content with back link, details, and renderer', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={renderedTemplate} />
      );

      expect(screen.getByTestId('back-link-top')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Letter preview' })
      ).toBeInTheDocument();
    });

    it('passes the template as initialTemplate to useTemplatePoll', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={renderedTemplate} />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.objectContaining({ initialTemplate: renderedTemplate })
      );
    });

    it('renders submit button when templateStatus is NOT_YET_SUBMITTED', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={renderedTemplate} />
      );

      const button = screen.getByTestId('preview-letter-template-cta');
      expect(button).toHaveTextContent('Submit template');
    });

    it('does not render submit button when templateStatus is SUBMITTED', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate
          template={{ ...renderedTemplate, templateStatus: 'SUBMITTED' }}
        />
      );

      expect(
        screen.queryByTestId('preview-letter-template-cta')
      ).not.toBeInTheDocument();
    });

    it('does not render submit button when templateStatus is VALIDATION_FAILED', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate
          template={{ ...renderedTemplate, templateStatus: 'VALIDATION_FAILED' }}
        />
      );

      expect(
        screen.queryByTestId('preview-letter-template-cta')
      ).not.toBeInTheDocument();
    });

    it('does not pass onError to useTemplatePoll', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={renderedTemplate} />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.not.objectContaining({ onError: expect.anything() })
      );
    });

    it('displays the back link with correct href', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={renderedTemplate} />
      );

      const backLink = screen.getByTestId('back-link-top');
      expect(backLink).toHaveAttribute('href', '/message-templates');
    });

    it('submits the form with correct templateId and lockNumber', async () => {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
      });

      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={renderedTemplate} />
      );

      await user.click(screen.getByRole('button', { name: 'Submit template' }));

      expect(mockServerAction).toHaveBeenCalledTimes(1);

      const formData = mockServerAction.mock.calls[0][1] as FormData;
      expect(formData.get('templateId')).toBe(renderedTemplate.id);
      expect(formData.get('lockNumber')).toBe(String(renderedTemplate.lockNumber));
    });
  });

  describe('when initialRender is PENDING with fresh requestedAt', () => {
    it('passes the template as initialTemplate to useTemplatePoll', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={pendingTemplate} />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.objectContaining({ initialTemplate: pendingTemplate })
      );
    });

    it('shows loading spinner when isPolling is true', () => {
      mockUseTemplatePoll.mockReturnValue({
        isPolling: true,
        isTimedOut: false,
      });

      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={pendingTemplate} />
      );

      expect(screen.getByText('Uploading letter template')).toBeInTheDocument();
      expect(screen.queryByTestId('back-link-top')).not.toBeInTheDocument();
    });

    it('renders page content after polling completes (isPolling becomes false)', () => {
      mockUseTemplatePoll.mockReturnValue({
        isPolling: false,
        isTimedOut: false,
      });

      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={pendingTemplate} />
      );

      expect(screen.getByTestId('back-link-top')).toBeInTheDocument();
    });

    it('renders page content (not spinner) when polling has timed out', () => {
      // isTimedOut: true means isPolling is also false — the hook sets both.
      // The component renders the page as-is with whatever template state it has.
      mockUseTemplatePoll.mockReturnValue({
        isPolling: false,
        isTimedOut: true,
      });

      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={pendingTemplate} />
      );

      expect(
        screen.queryByText('Uploading letter template')
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('back-link-top')).toBeInTheDocument();
    });
  });

  describe('when initialRender is PENDING with stale requestedAt', () => {
    it('passes the stale template as initialTemplate to useTemplatePoll', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={staleTemplate} />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.objectContaining({ initialTemplate: staleTemplate })
      );
    });

    it('renders page content immediately without polling', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={staleTemplate} />
      );

      expect(screen.getByTestId('back-link-top')).toBeInTheDocument();
      expect(
        screen.queryByText('Uploading letter template')
      ).not.toBeInTheDocument();
    });
  });

  describe('when initialRender is FAILED', () => {
    const failedTemplate: AuthoringLetterTemplate = {
      ...renderedTemplate,
      files: {
        docxTemplate: {
          currentVersion: 'v1',
          fileName: 'template.docx',
          virusScanStatus: 'PASSED',
        },
        initialRender: { status: 'FAILED' },
      },
    };

    it('does not render the letter renderer', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={failedTemplate} />
      );

      expect(
        screen.queryByRole('heading', { name: 'Letter preview' })
      ).not.toBeInTheDocument();
    });

    it('renders back link and template details', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={failedTemplate} />
      );

      expect(screen.getByTestId('back-link-top')).toBeInTheDocument();
      expect(screen.getByTestId('preview-template-id')).toBeInTheDocument();
    });

    it('passes the template as initialTemplate to useTemplatePoll', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={failedTemplate} />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.objectContaining({ initialTemplate: failedTemplate })
      );
    });
  });

  describe('shouldPoll callback', () => {
    it('returns true for a PENDING authoring letter template', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={pendingTemplate} />
      );

      const { shouldPoll } = mockUseTemplatePoll.mock.calls[0][0];

      expect(shouldPoll(pendingTemplate)).toBe(true);
    });

    it('returns false when initialRender is RENDERED', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={pendingTemplate} />
      );

      const { shouldPoll } = mockUseTemplatePoll.mock.calls[0][0];

      expect(shouldPoll(renderedTemplate)).toBe(false);
    });

    it('returns false for a PENDING template with stale requestedAt', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={pendingTemplate} />
      );

      const { shouldPoll } = mockUseTemplatePoll.mock.calls[0][0];

      expect(shouldPoll(staleTemplate)).toBe(false);
    });
  });

  describe('onUpdate callback', () => {
    it('updates template state causing re-render with new data', () => {
      mockUseTemplatePoll.mockReturnValue({
        isPolling: false,
        isTimedOut: false,
      });

      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={pendingTemplate} />
      );

      const { onUpdate } = mockUseTemplatePoll.mock.calls[0][0];

      // Simulate polling returning a fully rendered template
      const updatedTemplate: AuthoringLetterTemplate = {
        ...renderedTemplate,
        name: 'Updated Template Name',
      };

      // Invoke the onUpdate callback — this calls setLatestTemplate
      act(() => {
        onUpdate(updatedTemplate);
      });

      expect(
        screen.getByRole('heading', { name: 'Updated Template Name' })
      ).toBeInTheDocument();
    });
  });

  describe('isRenderAlreadyStale', () => {
    it('returns false when initialRender status is not PENDING', () => {
      expect(isRenderAlreadyStale(renderedTemplate, RENDER_TIMEOUT_MS)).toBe(
        false
      );
    });

    it('returns false when initialRender is PENDING and requestedAt is within timeout', () => {
      expect(isRenderAlreadyStale(pendingTemplate, RENDER_TIMEOUT_MS)).toBe(
        false
      );
    });

    it('returns true when initialRender is PENDING and requestedAt exceeds timeout', () => {
      expect(isRenderAlreadyStale(staleTemplate, RENDER_TIMEOUT_MS)).toBe(true);
    });
  });

  describe('layout structure', () => {
    it('constrains back link and details in nhsuk-width-container', () => {
      const { container } = renderWithProvider(
        <PreviewAuthoringLetterTemplate template={renderedTemplate} />
      );

      const widthContainers = container.querySelectorAll(
        '.nhsuk-width-container'
      );

      expect(widthContainers.length).toBeGreaterThanOrEqual(2);
    });

    it('renders bottom back link', () => {
      renderWithProvider(
        <PreviewAuthoringLetterTemplate template={renderedTemplate} />
      );

      const links = screen.getAllByText('Back to all templates');
      expect(links.length).toBeGreaterThanOrEqual(2);
    });
  });
});
