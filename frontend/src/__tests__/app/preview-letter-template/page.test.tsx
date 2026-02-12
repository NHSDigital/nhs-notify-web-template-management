import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import {
  AUTHORING_LETTER_TEMPLATE,
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import Page, {
  generateMetadata,
} from '@app/preview-letter-template/[templateId]/page';
import { submitAuthoringLetterAction } from '@app/preview-letter-template/[templateId]/server-action';
import content from '@content/content';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@app/preview-letter-template/[templateId]/server-action');
jest.mock('@utils/csrf-utils');

const { pageTitle } = content.components.previewLetterTemplate;

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(submitAuthoringLetterAction).mockResolvedValue({});
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
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
  });

  it('renders the page without redirecting', async () => {
    const page = await Page({
      params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the submit form with templateId and lockNumber', async () => {
    const { container } = render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    const templateIdInput = container.querySelector('input[name="templateId"]');
    const lockNumberInput = container.querySelector('input[name="lockNumber"]');

    expect(templateIdInput).toHaveValue(AUTHORING_LETTER_TEMPLATE.id);
    expect(lockNumberInput).toHaveValue(
      String(AUTHORING_LETTER_TEMPLATE.lockNumber)
    );
  });

  it('submits the form with correct data', async () => {
    const user = userEvent.setup();

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    await user.click(screen.getByRole('button', { name: 'Submit template' }));

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
});

describe('authoring letter template does not show submit form when already submitted', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });
  });

  it('does not render the submit button', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(
      screen.queryByRole('button', { name: 'Submit template for review' })
    ).not.toBeInTheDocument();
  });
});

describe('authoring letter with validation errors', () => {
  it('renders page with VALIDATION_FAILED status and validation errors', async () => {
    const templateWithValidationErrors = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED' as const,
      validationErrors: ['VIRUS_SCAN_FAILED' as const],
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithValidationErrors);

    const page = await Page({
      params: Promise.resolve({ templateId: templateWithValidationErrors.id }),
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('renders page with VALIDATION_FAILED status and empty validationErrors', async () => {
    const templateWithEmptyErrors = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED' as const,
      validationErrors: [] as 'VIRUS_SCAN_FAILED'[],
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithEmptyErrors);

    const page = await Page({
      params: Promise.resolve({ templateId: templateWithEmptyErrors.id }),
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('renders page with VALIDATION_FAILED status and undefined validationErrors', async () => {
    const templateWithUndefinedErrors = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED' as const,
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithUndefinedErrors);

    const page = await Page({
      params: Promise.resolve({ templateId: templateWithUndefinedErrors.id }),
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('displays validation error message in error summary', async () => {
    const templateWithValidationErrors = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED' as const,
      validationErrors: ['VIRUS_SCAN_FAILED' as const],
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithValidationErrors);

    render(
      await Page({
        params: Promise.resolve({
          templateId: templateWithValidationErrors.id,
        }),
      })
    );

    expect(
      screen.getByRole('alert', { name: 'There is a problem' })
    ).toBeInTheDocument();
  });

  it('matches snapshot with validation errors', async () => {
    const templateWithValidationErrors = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED' as const,
      validationErrors: ['VIRUS_SCAN_FAILED' as const],
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithValidationErrors);

    const { asFragment } = render(
      await Page({
        params: Promise.resolve({
          templateId: templateWithValidationErrors.id,
        }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
