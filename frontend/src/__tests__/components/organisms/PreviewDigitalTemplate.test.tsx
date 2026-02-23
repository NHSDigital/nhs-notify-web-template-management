import { render, screen } from '@testing-library/react';
import { PreviewDigitalTemplate } from '@organisms/PreviewDigitalTemplate';
import {
  DigitalTemplate,
  FormState,
} from 'nhs-notify-web-template-management-utils';
import { useFeatureFlags } from '@providers/client-config-provider';
import {
  NHS_APP_TEMPLATE,
  EMAIL_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';

jest.mock('@providers/client-config-provider');

beforeEach(() => {
  jest.mocked(useFeatureFlags).mockReset();
});

const defaultForm = {
  formId: 'preview-form',
  radiosId: 'preview-example',
  action: '',
  state: {},
  pageHeading: 'Example heading',
  options: [
    { id: 'test-edit', text: 'Edit template' },
    { id: 'test-submit', text: 'Submit template' },
  ],
  buttonText: 'Continue',
};

const createTemplate = <T extends DigitalTemplate['templateType']>(
  type: T,
  overrides: Partial<Extract<DigitalTemplate, { templateType: T }>> = {}
): Extract<DigitalTemplate, { templateType: T }> => {
  const baseTemplates: Record<
    DigitalTemplate['templateType'],
    DigitalTemplate
  > = {
    NHS_APP: NHS_APP_TEMPLATE,
    EMAIL: EMAIL_TEMPLATE,
    SMS: SMS_TEMPLATE,
  };

  const baseTemplate = baseTemplates[type] as Extract<
    DigitalTemplate,
    { templateType: T }
  >;

  return {
    ...baseTemplate,
    ...overrides,
  } as Extract<DigitalTemplate, { templateType: T }>;
};

const getEditPath = (template: DigitalTemplate): string => {
  const pathMap: Record<DigitalTemplate['templateType'], string> = {
    NHS_APP: `/edit-nhs-app-template/${template.id}`,
    EMAIL: `/edit-email-template/${template.id}`,
    SMS: `/edit-sms-template/${template.id}`,
  };
  return pathMap[template.templateType];
};

const renderPreviewTemplate = <T extends DigitalTemplate['templateType']>(
  type: T,
  templateOverrides: Partial<
    Extract<DigitalTemplate, { templateType: T }>
  > = {},
  additionalProps: Partial<
    React.ComponentProps<typeof PreviewDigitalTemplate>
  > = {}
) => {
  const template = createTemplate(type, templateOverrides);
  const editPath = additionalProps.editPath || getEditPath(template);

  return render(
    <PreviewDigitalTemplate
      sectionHeading='Template saved'
      template={template}
      editPath={editPath}
      previewDetailsComponent={<>Preview</>}
      form={defaultForm}
      {...additionalProps}
    />
  );
};

describe('PreviewDigitalTemplate', () => {
  describe('Routing disabled with letter authoring enabled', () => {
    beforeEach(() => {
      jest
        .mocked(useFeatureFlags)
        .mockReturnValue({ routing: false, letterAuthoring: true });
    });

    it('matches snapshot', () => {
      const container = renderPreviewTemplate('NHS_APP', {
        name: 'Example NHS APP template',
      });

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches error snapshot', () => {
      const state: FormState = {
        errorState: {
          formErrors: [],
          fieldErrors: {
            exampleError: ['Example error'],
          },
        },
      };
      const container = renderPreviewTemplate(
        'NHS_APP',
        { name: 'Example NHS APP template' },
        {
          form: {
            ...defaultForm,
            state,
          },
        }
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('renders component correctly', () => {
      renderPreviewTemplate('EMAIL', {
        name: 'Example template - routing disabled',
      });

      expect(
        screen.getByTestId('preview-example-form__legend')
      ).toHaveTextContent('Example heading');

      expect(screen.getByTestId('submit-button')).toBeVisible();

      expect(
        screen.queryByTestId('edit-template-button')
      ).not.toBeInTheDocument();

      expect(
        screen.queryByTestId('test-message-banner')
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: 'Send a test message' })
      ).not.toBeInTheDocument();
    });
  });

  describe('Routing enabled with letter authoring enabled', () => {
    beforeEach(() => {
      jest
        .mocked(useFeatureFlags)
        .mockReturnValue({ routing: true, letterAuthoring: true });
    });

    it('matches snapshot', () => {
      const container = renderPreviewTemplate('NHS_APP', {
        name: 'Example NHS APP template',
      });

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('renders component correctly', () => {
      renderPreviewTemplate('NHS_APP', { id: 'template-123' });

      const editButton = screen.getByTestId('edit-template-button');
      expect(editButton).toBeVisible();
      expect(editButton).toHaveAttribute(
        'href',
        '/edit-nhs-app-template/template-123'
      );

      expect(
        screen.queryByTestId('preview-example-form__legend')
      ).not.toBeInTheDocument();

      expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
    });

    it('displays section heading when provided', () => {
      renderPreviewTemplate(
        'NHS_APP',
        {},
        { sectionHeading: 'Template saved' }
      );

      const sectionHeading = screen.getByText('Template saved');
      expect(sectionHeading).toBeInTheDocument();
      expect(sectionHeading).toHaveClass(
        'notify-confirmation-panel',
        'nhsuk-heading-l'
      );
    });

    it('does not display section heading when undefined', () => {
      renderPreviewTemplate('NHS_APP', {}, { sectionHeading: undefined });

      expect(screen.queryByText('Template saved')).not.toBeInTheDocument();
      expect(
        document.querySelector('.notify-confirmation-panel')
      ).not.toBeInTheDocument();
    });
  });

  describe('Digital proofing', () => {
    describe('when digitalProofingNhsApp is enabled', () => {
      beforeEach(() => {
        jest
          .mocked(useFeatureFlags)
          .mockReturnValue({ routing: true, digitalProofingNhsApp: true });
      });

      it('displays banner for draft NHS_APP template with correct link', () => {
        renderPreviewTemplate('NHS_APP', {
          id: 'template-123',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        expect(screen.getByTestId('test-message-banner')).toBeVisible();
        expect(
          screen.getByRole('link', { name: 'Send a test NHS App message' })
        ).toHaveAttribute(
          'href',
          '/templates/send-test-nhs-app-message/template-123'
        );
      });

      it('displays "Send test message" button for draft NHS_APP template', () => {
        renderPreviewTemplate('NHS_APP', {
          id: 'template-123',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        const button = screen.getByRole('button', {
          name: 'Send a test message',
        });
        expect(button).toHaveTextContent('Send a test message');
        expect(button.closest('a')).toHaveAttribute(
          'href',
          '/send-test-nhs-app-message/template-123'
        );
      });

      it('matches snapshot', () => {
        const container = renderPreviewTemplate('NHS_APP', {
          id: 'template-123',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        expect(container.asFragment()).toMatchSnapshot();
      });

      it.each<[string]>([['EMAIL'], ['SMS']])(
        'does not display test message banner or button for draft %s template',
        (templateType) => {
          renderPreviewTemplate(templateType as 'EMAIL' | 'SMS', {
            id: 'template-123',
            templateStatus: 'NOT_YET_SUBMITTED',
          });

          expect(
            screen.queryByTestId('test-message-banner')
          ).not.toBeInTheDocument();
          expect(
            screen.queryByRole('button', { name: 'Send a test message' })
          ).not.toBeInTheDocument();
        }
      );

      it('does not display test message banner or button for submitted NHS_APP template', () => {
        renderPreviewTemplate('NHS_APP', {
          id: 'template-123',
          templateStatus: 'SUBMITTED',
        });

        expect(
          screen.queryByTestId('test-message-banner')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Send a test message' })
        ).not.toBeInTheDocument();
      });
    });

    describe('when digitalProofingEmail is enabled', () => {
      beforeEach(() => {
        jest
          .mocked(useFeatureFlags)
          .mockReturnValue({ routing: true, digitalProofingEmail: true });
      });

      it('displays banner for draft EMAIL template with correct link', () => {
        renderPreviewTemplate('EMAIL', {
          id: 'template-456',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        expect(screen.getByTestId('test-message-banner')).toBeVisible();
        expect(
          screen.getByRole('link', { name: 'Send a test email' })
        ).toHaveAttribute('href', '/templates/send-test-email/template-456');
      });

      it('displays "Send test message" button for draft EMAIL template', () => {
        renderPreviewTemplate('EMAIL', {
          id: 'template-456',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        const button = screen.getByRole('button', {
          name: 'Send a test message',
        });
        expect(button).toHaveTextContent('Send a test message');
        expect(button.closest('a')).toHaveAttribute(
          'href',
          '/send-test-email/template-456'
        );
      });

      it('matches snapshot', () => {
        const container = renderPreviewTemplate('EMAIL', {
          id: 'template-456',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        expect(container.asFragment()).toMatchSnapshot();
      });

      it.each<[string]>([['NHS_APP'], ['SMS']])(
        'does not display test message banner or button for draft %s template',
        (templateType) => {
          renderPreviewTemplate(templateType as 'NHS_APP' | 'SMS', {
            id: 'template-456',
            templateStatus: 'NOT_YET_SUBMITTED',
          });

          expect(
            screen.queryByTestId('test-message-banner')
          ).not.toBeInTheDocument();
          expect(
            screen.queryByRole('button', { name: 'Send a test message' })
          ).not.toBeInTheDocument();
        }
      );

      it('does not display test message banner or button for submitted EMAIL template', () => {
        renderPreviewTemplate('EMAIL', {
          id: 'template-456',
          templateStatus: 'SUBMITTED',
        });

        expect(
          screen.queryByTestId('test-message-banner')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Send a test message' })
        ).not.toBeInTheDocument();
      });
    });

    describe('when digitalProofingSms is enabled', () => {
      beforeEach(() => {
        jest
          .mocked(useFeatureFlags)
          .mockReturnValue({ routing: true, digitalProofingSms: true });
      });

      it('displays banner for draft SMS template with correct link', () => {
        renderPreviewTemplate('SMS', {
          id: 'template-789',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        expect(screen.getByTestId('test-message-banner')).toBeVisible();
        expect(
          screen.getByRole('link', { name: 'Send a test text message' })
        ).toHaveAttribute(
          'href',
          '/templates/send-test-text-message/template-789'
        );
      });

      it('displays "Send test message" button for draft SMS template', () => {
        renderPreviewTemplate('SMS', {
          id: 'template-789',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        const button = screen.getByRole('button', {
          name: 'Send a test message',
        });
        expect(button).toHaveTextContent('Send a test message');
        expect(button.closest('a')).toHaveAttribute(
          'href',
          '/send-test-text-message/template-789'
        );
      });

      it('matches snapshot', () => {
        const container = renderPreviewTemplate('SMS', {
          id: 'template-789',
          templateStatus: 'NOT_YET_SUBMITTED',
        });

        expect(container.asFragment()).toMatchSnapshot();
      });

      it.each<[string]>([['NHS_APP'], ['EMAIL']])(
        'does not display test message banner or button for draft %s template',
        (templateType) => {
          renderPreviewTemplate(templateType as 'NHS_APP' | 'EMAIL', {
            id: 'template-789',
            templateStatus: 'NOT_YET_SUBMITTED',
          });

          expect(
            screen.queryByTestId('test-message-banner')
          ).not.toBeInTheDocument();
          expect(
            screen.queryByRole('button', { name: 'Send a test message' })
          ).not.toBeInTheDocument();
        }
      );

      it('does not display test message banner or button for submitted SMS template', () => {
        renderPreviewTemplate('SMS', {
          id: 'template-789',
          templateStatus: 'SUBMITTED',
        });

        expect(
          screen.queryByTestId('test-message-banner')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Send a test message' })
        ).not.toBeInTheDocument();
      });
    });

    describe('when all digital proofing flags are disabled', () => {
      beforeEach(() => {
        jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });
      });

      it.each<[string]>([['NHS_APP'], ['EMAIL'], ['SMS']])(
        'does not display test message banner or button for draft %s template',
        (templateType) => {
          renderPreviewTemplate(templateType as 'NHS_APP' | 'EMAIL' | 'SMS', {
            id: 'template-000',
            templateStatus: 'NOT_YET_SUBMITTED',
          });

          expect(
            screen.queryByTestId('test-message-banner')
          ).not.toBeInTheDocument();
          expect(
            screen.queryByRole('button', { name: 'Send a test message' })
          ).not.toBeInTheDocument();
        }
      );
    });
  });
});
