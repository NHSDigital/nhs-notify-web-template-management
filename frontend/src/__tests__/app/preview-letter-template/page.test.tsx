import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import { getTemplate, getLetterVariantById } from '@utils/form-actions';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import {
  AUTHORING_LETTER_TEMPLATE,
  EMAIL_TEMPLATE,
  makeLetterVariant,
  NHS_APP_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import Page, {
  generateMetadata,
} from '@app/preview-letter-template/[templateId]/page';
import { submitAuthoringLetterAction } from '@app/preview-letter-template/[templateId]/server-action';
import content from '@content/content';
import { RENDER_TIMEOUT_MS } from '@molecules/PollLetterRender/PollLetterRender';
import { ValidationErrorDetail } from 'nhs-notify-web-template-management-types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@app/preview-letter-template/[templateId]/server-action');
jest.mock('@utils/csrf-utils');

const { pageTitle } = content.pages.previewLetterTemplate;

const NOW = new Date('2025-06-15T12:00:00.000Z');

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers({ now: NOW });
  jest.mocked(submitAuthoringLetterAction).mockResolvedValue({});
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
});

afterEach(() => {
  jest.useRealTimers();
});

test('metadata', async () => {
  expect(await generateMetadata()).toEqual({
    title: pageTitle,
  });
});

describe('template does not exist', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(undefined);
  });

  it('redirects to invalid template page', async () => {
    await Page({ params: Promise.resolve({ templateId: 'template-123' }) });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });
});

describe('template is not a letter', () => {
  it('redirects to invalid template page when template is an email', async () => {
    jest.mocked(getTemplate).mockResolvedValue(EMAIL_TEMPLATE);

    await Page({ params: Promise.resolve({ templateId: EMAIL_TEMPLATE.id }) });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when template is an SMS', async () => {
    jest.mocked(getTemplate).mockResolvedValue(SMS_TEMPLATE);

    await Page({ params: Promise.resolve({ templateId: SMS_TEMPLATE.id }) });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when template is an NHS App message', async () => {
    jest.mocked(getTemplate).mockResolvedValue(NHS_APP_TEMPLATE);

    await Page({
      params: Promise.resolve({ templateId: NHS_APP_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });
});

describe('PDF letter template is invalid', () => {
  it('redirects to invalid template page when name is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...PDF_LETTER_TEMPLATE,
      name: undefined as unknown as string,
    });

    await Page({
      params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when language is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...PDF_LETTER_TEMPLATE,
      language: undefined as unknown as 'en',
    });

    await Page({
      params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when letterType is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...PDF_LETTER_TEMPLATE,
      letterType: undefined as unknown as 'x0',
    });

    await Page({
      params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when pdfTemplate fileName is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...PDF_LETTER_TEMPLATE,
      files: {
        pdfTemplate: {
          fileName: undefined as unknown as string,
          currentVersion: 'uuid',
          virusScanStatus: 'PASSED',
        },
      },
    });

    await Page({
      params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when files is wrong data type', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...PDF_LETTER_TEMPLATE,
      files: [] as unknown as (typeof PDF_LETTER_TEMPLATE)['files'],
    });

    await Page({
      params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });
});

describe('authoring letter template is invalid', () => {
  it('redirects to invalid template page when name is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      name: undefined as unknown as string,
    });

    await Page({
      params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when language is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      language: undefined as unknown as 'en',
    });

    await Page({
      params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when letterType is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      letterType: undefined as unknown as 'x0',
    });

    await Page({
      params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });
});

describe('valid PDF letter template', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(PDF_LETTER_TEMPLATE);
  });

  it('renders the page without redirecting', async () => {
    const page = await Page({
      params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(
      await Page({
        params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('valid authoring letter template', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(AUTHORING_LETTER_TEMPLATE);
    jest.mocked(getLetterVariantById).mockResolvedValue(
      makeLetterVariant({
        id: AUTHORING_LETTER_TEMPLATE.letterVariantId,
        name: 'Example Letter Variant',
      })
    );
  });

  it('renders the page without redirecting', async () => {
    const page = await Page({
      params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('fetches the letter variant', async () => {
    await Page({
      params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
    });

    expect(getLetterVariantById).toHaveBeenCalledWith(
      AUTHORING_LETTER_TEMPLATE.letterVariantId
    );
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('submits the form with correct data', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    await user.click(screen.getByRole('button', { name: 'Approve template' }));

    expect(submitAuthoringLetterAction).toHaveBeenCalledTimes(1);

    const callArgs = jest.mocked(submitAuthoringLetterAction).mock.calls[0];
    const formData = callArgs[1] as FormData;

    expect(formData.get('templateId')).toBe(AUTHORING_LETTER_TEMPLATE.id);
    expect(formData.get('lockNumber')).toBe(
      String(AUTHORING_LETTER_TEMPLATE.lockNumber)
    );
  });

  it('displays the back link with correct href', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    const backLink = screen.getByTestId('back-link-top');
    expect(backLink).toHaveAttribute('href', '/message-templates');
  });

  it('displays the letter renderer when initialRender file is RENDERED', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(
      screen.getByRole('heading', { name: 'Letter preview' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Short examples' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Long examples' })
    ).toBeInTheDocument();
  });
});

describe('authoring letter template with no letter variant set', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      letterVariantId: undefined,
    });
  });

  it('does not fetch the letter variant', async () => {
    await Page({
      params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
    });

    expect(getLetterVariantById).not.toHaveBeenCalled();
  });
});

describe('authoring letter initial render states', () => {
  it('displays the loading spinner and hides page content when initialRender is freshly PENDING', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'PENDING_VALIDATION',
      files: {
        ...AUTHORING_LETTER_TEMPLATE.files,
        initialRender: {
          status: 'PENDING',
          requestedAt: NOW.toISOString(),
        },
      },
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(
      screen.getByRole('heading', { name: 'Uploading letter template' })
    ).toBeInTheDocument();

    expect(screen.queryByTestId('preview-template-id')).not.toBeInTheDocument();
  });

  it('shows page content and hides spinner and renderer when initialRender is PENDING, but render request is stale', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'PENDING_VALIDATION',
      files: {
        ...AUTHORING_LETTER_TEMPLATE.files,
        initialRender: {
          status: 'PENDING',
          requestedAt: new Date(
            NOW.getTime() - RENDER_TIMEOUT_MS - 5000
          ).toISOString(),
        },
      },
    });

    const { asFragment } = render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(
      screen.queryByRole('heading', { name: 'Uploading letter template' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('heading', { name: 'Letter preview' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('tab', { name: 'Short examples' })
    ).not.toBeInTheDocument();

    expect(screen.getByTestId('preview-template-id')).toHaveTextContent(
      AUTHORING_LETTER_TEMPLATE.id
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('shows page content without letter renderer when initialRender is FAILED', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      files: {
        ...AUTHORING_LETTER_TEMPLATE.files,
        initialRender: {
          status: 'FAILED',
        },
      },
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(
      screen.queryByRole('heading', { name: 'Uploading letter template' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('heading', { name: 'Letter preview' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('tab', { name: 'Short examples' })
    ).not.toBeInTheDocument();

    expect(screen.getByTestId('preview-template-id')).toHaveTextContent(
      AUTHORING_LETTER_TEMPLATE.id
    );
  });
});

describe('when authoring letter template status is submitted', () => {
  it('redirects to preview approved letter template page', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(redirect).toHaveBeenCalledWith(
      `/preview-approved-letter-template/${AUTHORING_LETTER_TEMPLATE.id}`,
      RedirectType.replace
    );
  });
});

describe('authoring letter template with VALIDATION_FAILED status', () => {
  const cases: {
    name: string;
    validationError?: ValidationErrorDetail;
    expectedErrorMessageLines: string[];
  }[] = [
    {
      name: 'VIRUS_SCAN_FAILED',
      validationError: { name: 'VIRUS_SCAN_FAILED' },
      expectedErrorMessageLines: [
        'Your file may contain a virus and we could not open it',
        'Upload a different letter template file',
      ],
    },
    {
      name: 'MISSING_ADDRESS_LINES',
      validationError: { name: 'MISSING_ADDRESS_LINES' },
      expectedErrorMessageLines: [
        'Your template is missing address personalisation fields',
        'You must include all fields from {d.address_line_1} to {d.address_line_7}. Use the blank letter template file to set up your template as it includes the correct fields. Upload it as a different letter template file',
      ],
    },
    {
      name: 'UNEXPECTED_ADDRESS_LINES',
      validationError: { name: 'UNEXPECTED_ADDRESS_LINES' },
      expectedErrorMessageLines: [
        'Your template has address personalisation fields we do not recognise',
        'You must only use {d.address_line_1} to {d.address_line_7}. Use the blank letter template file to set up your template as it has the correct fields. Upload this as a different letter template file',
      ],
    },
    {
      name: 'INVALID_MARKERS',
      validationError: {
        name: 'INVALID_MARKERS',
        issues: [
          '{c.compliment}',
          '{no.d}',
          '{d.underscores_to_test_markdown_escapes}',
        ],
      },
      expectedErrorMessageLines: [
        'You used the following personalisation fields with incorrect formatting:',
        '{c.compliment}',
        '{no.d}',
        '{d.underscores_to_test_markdown_escapes}',
        'Personalisation fields must start with d. and be inside single curly brackets. For example: {d.fullName}',
        'They can only contain',
        'letters (a to z, A to Z)',
        'numbers (1 to 9)',
        'dashes',
        'underscores',
        'Update your letter template file and upload it again',
      ],
    },
    {
      name: 'undefined',
      validationError: undefined,
      expectedErrorMessageLines: [
        'We could not open your file. This may be a technical problem or an issue with your file',
        'Upload a different letter template file',
      ],
    },
  ];

  describe.each(cases)(
    '$name',
    ({ validationError, expectedErrorMessageLines }) => {
      beforeEach(() => {
        jest.mocked(getTemplate).mockResolvedValue({
          ...AUTHORING_LETTER_TEMPLATE,
          templateStatus: 'VALIDATION_FAILED',
          validationErrors: validationError && [validationError],
        });
      });

      it('displays error summary with correct error messages when validationErrors are present', async () => {
        render(
          await Page({
            params: Promise.resolve({
              templateId: AUTHORING_LETTER_TEMPLATE.id,
            }),
          })
        );

        expect(redirect).not.toHaveBeenCalled();

        const errorSummary = screen.getByRole('alert', {
          name: 'There is a problem',
        });

        for (const errorMessage of expectedErrorMessageLines) {
          expect(
            within(errorSummary).getByText(errorMessage)
          ).toBeInTheDocument();
        }
      });

      it('display "upload different template" button instead of submit button when validation has failed', async () => {
        render(
          await Page({
            params: Promise.resolve({
              templateId: AUTHORING_LETTER_TEMPLATE.id,
            }),
          })
        );

        expect(
          screen.queryByRole('button', { name: 'Submit template' })
        ).not.toBeInTheDocument();

        expect(
          screen.getByRole('button', {
            name: 'Upload a different letter template file',
          })
        ).toHaveAttribute('href', '/templates/choose-a-template-type');
      });

      it('matches snapshot', async () => {
        const { asFragment } = render(
          await Page({
            params: Promise.resolve({
              templateId: AUTHORING_LETTER_TEMPLATE.id,
            }),
          })
        );

        expect(asFragment()).toMatchSnapshot();
      });
    }
  );
});
