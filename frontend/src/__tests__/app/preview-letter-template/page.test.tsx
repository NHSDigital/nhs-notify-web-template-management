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
import { RENDER_TIMEOUT_MS } from '@molecules/PollLetterRender/PollLetterRender';

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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

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

describe('authoring letter initial render states', () => {
  it('displays the loading spinner and hides page content when initialRender is freshly PENDING', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
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

  it('shows page content without letter renderer when initialRender is FAILED', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
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

describe('authoring letter template does not show submit form when already submitted', () => {
  it('does not render the submit button when templateStatus is SUBMITTED', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(
      screen.queryByRole('button', { name: 'Submit template' })
    ).not.toBeInTheDocument();
  });
});

describe('authoring letter template with VALIDATION_FAILED status', () => {
  it('displays error summary with correct error messages when validationErrors are present', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: [{ name: 'VIRUS_SCAN_FAILED' }],
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
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

  it('does not display submit button when validation has failed', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: [{ name: 'VIRUS_SCAN_FAILED' }],
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(
      screen.queryByRole('button', { name: 'Submit template' })
    ).not.toBeInTheDocument();
  });

  it('does not display error summary when validationErrors is undefined', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: undefined,
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: AUTHORING_LETTER_TEMPLATE.name })
    ).toBeInTheDocument();
  });

  it('matches snapshot when validationErrors are present', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: [{ name: 'MISSING_ADDRESS_LINES' }],
    });

    const { asFragment } = render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when validationErrors is undefined', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'VALIDATION_FAILED',
      validationErrors: undefined,
    });

    const { asFragment } = render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
