import { render, screen, act } from '@testing-library/react';
import {
  PreviewAuthoringLetterTemplate,
  isRenderAlreadyStale,
} from '@organisms/PreviewAuthoringLetterTemplate/PreviewAuthoringLetterTemplate';
import { useTemplatePoll, DEFAULT_TIMEOUT_MS } from '@hooks/use-template-poll';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';

jest.mock('@hooks/use-template-poll');
jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));
jest.mock('@atoms/NHSNotifyForm', () => ({
  ErrorSummary: () => <div data-testid='mock-error-summary' />,
  Form: ({
    children,
    formId,
  }: {
    children: React.ReactNode;
    formId: string;
  }) => (
    <form data-testid={formId}>
      {children}
    </form>
  ),
  FormGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ErrorMessage: () => null,
  Input: (props: Record<string, unknown>) => (
    <input data-testid={`mock-input-${props.name}`} />
  ),
  Select: ({ children }: { children: React.ReactNode }) => (
    <select>{children}</select>
  ),
}));

const mockUseTemplatePoll = jest.mocked(useTemplatePoll);

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
      requestedAt: new Date().toISOString(),
    },
  },
};

const defaultProps = {
  backLinkText: 'Back to all templates',
  backLinkHref: '/message-templates',
  submitText: 'Submit template',
  loadingText: 'Loading letter preview',
};

describe('PreviewAuthoringLetterTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTemplatePoll.mockReturnValue({ isPolling: false, isTimedOut: false });
  });

  describe('when initialRender is RENDERED', () => {
    it('renders page content with back link, details, and renderer', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={renderedTemplate}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId('back-link-top')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Letter preview' })
      ).toBeInTheDocument();
    });

    it('passes enabled=false to useTemplatePoll', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={renderedTemplate}
          {...defaultProps}
        />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });

    it('renders submit button when templateStatus is NOT_YET_SUBMITTED', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={renderedTemplate}
          {...defaultProps}
        />
      );

      const button = screen.getByTestId('preview-letter-template-cta');
      expect(button).toHaveTextContent('Submit template');
    });

    it('does not render submit button when templateStatus is SUBMITTED', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={{ ...renderedTemplate, templateStatus: 'SUBMITTED' }}
          {...defaultProps}
        />
      );

      expect(
        screen.queryByTestId('preview-letter-template-cta')
      ).not.toBeInTheDocument();
    });
  });

  describe('when initialRender is PENDING with fresh requestedAt', () => {
    it('passes enabled=true to useTemplatePoll', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={pendingTemplate}
          {...defaultProps}
        />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      );
    });

    it('shows loading spinner when isPolling is true', () => {
      mockUseTemplatePoll.mockReturnValue({
        isPolling: true,
        isTimedOut: false,
      });

      render(
        <PreviewAuthoringLetterTemplate
          template={pendingTemplate}
          {...defaultProps}
        />
      );

      expect(screen.getByText('Loading letter preview')).toBeInTheDocument();
      expect(screen.queryByTestId('back-link-top')).not.toBeInTheDocument();
    });

    it('renders page content after polling completes (isPolling becomes false)', () => {
      mockUseTemplatePoll.mockReturnValue({
        isPolling: false,
        isTimedOut: false,
      });

      render(
        <PreviewAuthoringLetterTemplate
          template={pendingTemplate}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId('back-link-top')).toBeInTheDocument();
    });
  });

  describe('when initialRender is PENDING with stale requestedAt', () => {
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
            Date.now() - DEFAULT_TIMEOUT_MS - 5000
          ).toISOString(),
        },
      },
    };

    it('passes enabled=false to useTemplatePoll when requestedAt is stale', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={staleTemplate}
          {...defaultProps}
        />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });

    it('renders page content immediately without polling', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={staleTemplate}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId('back-link-top')).toBeInTheDocument();
      expect(
        screen.queryByText('Loading letter preview')
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
      render(
        <PreviewAuthoringLetterTemplate
          template={failedTemplate}
          {...defaultProps}
        />
      );

      expect(
        screen.queryByRole('heading', { name: 'Letter preview' })
      ).not.toBeInTheDocument();
    });

    it('passes enabled=false to useTemplatePoll', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={failedTemplate}
          {...defaultProps}
        />
      );

      expect(mockUseTemplatePoll).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });
  });

  describe('shouldPoll callback', () => {
    it('returns true for a PENDING authoring letter template', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={pendingTemplate}
          {...defaultProps}
        />
      );

      const { shouldPoll } = mockUseTemplatePoll.mock.calls[0][0];

      const pendingDto = {
        templateType: 'LETTER',
        letterVersion: 'AUTHORING',
        files: {
          initialRender: { status: 'PENDING', requestedAt: new Date().toISOString() },
        },
      } as unknown as TemplateDto;

      expect(shouldPoll(pendingDto)).toBe(true);
    });

    it('returns false when initialRender is RENDERED', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={pendingTemplate}
          {...defaultProps}
        />
      );

      const { shouldPoll } = mockUseTemplatePoll.mock.calls[0][0];

      const renderedDto = {
        templateType: 'LETTER',
        letterVersion: 'AUTHORING',
        files: {
          initialRender: { status: 'RENDERED', fileName: 'r.pdf', currentVersion: 'v1', pageCount: 1 },
        },
      } as unknown as TemplateDto;

      expect(shouldPoll(renderedDto)).toBe(false);
    });

    it('returns false for a non-LETTER template type', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={pendingTemplate}
          {...defaultProps}
        />
      );

      const { shouldPoll } = mockUseTemplatePoll.mock.calls[0][0];

      const emailDto = {
        templateType: 'EMAIL',
        letterVersion: 'AUTHORING',
        files: {
          initialRender: { status: 'PENDING', requestedAt: new Date().toISOString() },
        },
      } as unknown as TemplateDto;

      expect(shouldPoll(emailDto)).toBe(false);
    });

    it('returns false for a non-AUTHORING letter version', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={pendingTemplate}
          {...defaultProps}
        />
      );

      const { shouldPoll } = mockUseTemplatePoll.mock.calls[0][0];

      const pdfDto = {
        templateType: 'LETTER',
        letterVersion: 'PDF',
        files: {
          initialRender: { status: 'PENDING', requestedAt: new Date().toISOString() },
        },
      } as unknown as TemplateDto;

      expect(shouldPoll(pdfDto)).toBe(false);
    });
  });

  describe('onUpdate callback', () => {
    it('updates template state causing re-render with new data', () => {
      mockUseTemplatePoll.mockReturnValue({
        isPolling: false,
        isTimedOut: false,
      });

      render(
        <PreviewAuthoringLetterTemplate
          template={pendingTemplate}
          {...defaultProps}
        />
      );

      const { onUpdate } = mockUseTemplatePoll.mock.calls[0][0];

      // Simulate polling returning a fully rendered template
      const updatedTemplate: TemplateDto = {
        ...renderedTemplate,
        name: 'Updated Template Name',
      } as unknown as TemplateDto;

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
      expect(isRenderAlreadyStale(renderedTemplate)).toBe(false);
    });

    it('returns false when initialRender is PENDING and requestedAt is within timeout', () => {
      expect(isRenderAlreadyStale(pendingTemplate)).toBe(false);
    });

    it('returns true when initialRender is PENDING and requestedAt exceeds timeout', () => {
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
              Date.now() - DEFAULT_TIMEOUT_MS - 5000
            ).toISOString(),
          },
        },
      };

      expect(isRenderAlreadyStale(staleTemplate)).toBe(true);
    });
  });

  describe('layout structure', () => {
    it('constrains back link and details in nhsuk-width-container', () => {
      const { container } = render(
        <PreviewAuthoringLetterTemplate
          template={renderedTemplate}
          {...defaultProps}
        />
      );

      const widthContainers = container.querySelectorAll(
        '.nhsuk-width-container'
      );

      expect(widthContainers.length).toBeGreaterThanOrEqual(2);
    });

    it('renders bottom back link', () => {
      render(
        <PreviewAuthoringLetterTemplate
          template={renderedTemplate}
          {...defaultProps}
        />
      );

      const links = screen.getAllByText('Back to all templates');
      expect(links.length).toBeGreaterThanOrEqual(2);
    });
  });
});
