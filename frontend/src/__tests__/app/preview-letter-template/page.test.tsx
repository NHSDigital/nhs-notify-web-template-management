import { render } from '@testing-library/react';
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
});

describe('authoring letter template with VALIDATION_FAILED status', () => {
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
