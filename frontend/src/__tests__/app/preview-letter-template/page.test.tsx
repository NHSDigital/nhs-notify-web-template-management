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
import type { VersionedFileDetails } from 'nhs-notify-backend-client';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';

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

describe('authoring letter template without initial render in RENDERED status', () => {
  it('does not display the letter renderer when initialRender file is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      files: {
        docxTemplate: {
          currentVersion: 'version-id',
          fileName: 'template.docx',
          virusScanStatus: 'PASSED',
        },
      },
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(
      screen.queryByRole('heading', { name: 'Letter preview' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'Short examples' })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: AUTHORING_LETTER_TEMPLATE.name })
    ).toBeInTheDocument();
    expect(screen.getByTestId('preview-template-id')).toHaveTextContent(
      AUTHORING_LETTER_TEMPLATE.id
    );
  });

  test('does not display renderer when initialRender status is FAILED', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      files: {
        docxTemplate: {
          currentVersion: 'version-id',
          fileName: 'template.docx',
          virusScanStatus: 'PASSED',
        },
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
      screen.queryByRole('heading', { name: 'Letter preview' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'Short examples' })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: AUTHORING_LETTER_TEMPLATE.name })
    ).toBeInTheDocument();
    expect(screen.getByTestId('preview-template-id')).toHaveTextContent(
      AUTHORING_LETTER_TEMPLATE.id
    );
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
  it('renders page with VALIDATION_FAILED status and displays error summary with virus scan message', async () => {
    const templateWithValidationErrors: LetterTemplate = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: [{ name: 'VIRUS_SCAN_FAILED' }],
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithValidationErrors);

    render(
      await Page({
        params: Promise.resolve({
          templateId: templateWithValidationErrors.id,
        }),
      })
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(
      screen.getByRole('alert', { name: 'There is a problem' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('The file(s) you uploaded may contain a virus.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Create a new letter template to upload your file(s) again or upload different file(s).'
      )
    ).toBeInTheDocument();
  });

  it('matches snapshot with error and render', async () => {
    const templateWithValidationErrors: LetterTemplate = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: [{ name: 'VIRUS_SCAN_FAILED' }],
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

  it('matches snapshot with error and no render', async () => {
    const templateWithValidationErrors: LetterTemplate = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: [{ name: 'VIRUS_SCAN_FAILED' }],
      files: {
        docxTemplate: {
          currentVersion: 'version-id',
          fileName: 'template.docx',
          virusScanStatus: 'PASSED',
        } satisfies VersionedFileDetails,
      },
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

  it('renders page with VALIDATION_FAILED status and empty validationErrors without error summary', async () => {
    const templateWithEmptyErrors: LetterTemplate = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: [] as { name: 'VIRUS_SCAN_FAILED' }[],
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithEmptyErrors);

    render(
      await Page({
        params: Promise.resolve({ templateId: templateWithEmptyErrors.id }),
      })
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: AUTHORING_LETTER_TEMPLATE.name })
    ).toBeInTheDocument();
  });

  it('renders page with VALIDATION_FAILED status and undefined validationErrors without error summary', async () => {
    const templateWithUndefinedErrors: LetterTemplate = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithUndefinedErrors);

    render(
      await Page({
        params: Promise.resolve({ templateId: templateWithUndefinedErrors.id }),
      })
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: AUTHORING_LETTER_TEMPLATE.name })
    ).toBeInTheDocument();
  });

  it('does not display submit button when validation has failed', async () => {
    const templateWithValidationErrors: LetterTemplate = {
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: [{ name: 'VIRUS_SCAN_FAILED' }],
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
      screen.queryByRole('button', { name: 'Submit template' })
    ).not.toBeInTheDocument();
  });
});
