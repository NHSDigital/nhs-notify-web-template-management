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
import { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import Page, {
  generateMetadata,
} from '@app/review-and-approve-letter-template/[templateId]/page';
import { reviewAndApproveLetterTemplateAction } from '@app/review-and-approve-letter-template/[templateId]/server-action';
import content from '@content/content';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@app/review-and-approve-letter-template/[templateId]/server-action');
jest.mock('@utils/csrf-utils');

const { pageTitle } = content.pages.reviewAndApproveLetterTemplate;

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(reviewAndApproveLetterTemplateAction).mockResolvedValue({});
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
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });
});

describe('template is not a letter', () => {
  it('redirects to invalid template page when template is an email', async () => {
    jest.mocked(getTemplate).mockResolvedValue(EMAIL_TEMPLATE);

    await Page({
      params: Promise.resolve({ templateId: EMAIL_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when template is an SMS', async () => {
    jest.mocked(getTemplate).mockResolvedValue(SMS_TEMPLATE);

    await Page({
      params: Promise.resolve({ templateId: SMS_TEMPLATE.id }),
    });

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

describe('template is a PDF letter (not AUTHORING)', () => {
  it('redirects to invalid template page when letterVersion is PDF', async () => {
    jest.mocked(getTemplate).mockResolvedValue(PDF_LETTER_TEMPLATE);

    await Page({
      params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
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

  it('renders hidden templateId and lockNumber inputs', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    const form = screen.getByTestId('preview-letter-template-cta');
    expect(form).toBeInTheDocument();
  });

  it('submits the form with correct data', async () => {
    const user = userEvent.setup();

    render(
      await Page({
        params: Promise.resolve({ templateId: AUTHORING_LETTER_TEMPLATE.id }),
      })
    );

    await user.click(screen.getByTestId('preview-letter-template-cta'));

    expect(reviewAndApproveLetterTemplateAction).toHaveBeenCalledTimes(1);

    const callArgs = jest.mocked(reviewAndApproveLetterTemplateAction).mock
      .calls[0];
    const formData = callArgs[1] as FormData;

    expect(formData.get('templateId')).toBe(AUTHORING_LETTER_TEMPLATE.id);
    expect(formData.get('lockNumber')).toBe(
      String(AUTHORING_LETTER_TEMPLATE.lockNumber)
    );
  });
});

describe('rendered PDF previews', () => {
  const templateWithRenderedFiles: AuthoringLetterTemplate = {
    ...AUTHORING_LETTER_TEMPLATE,
    clientId: 'client-123',
    files: {
      ...AUTHORING_LETTER_TEMPLATE.files,
      shortFormRender: {
        fileName: 'short-form.pdf',
        currentVersion: 'v1',
        status: 'RENDERED',
        pageCount: 1,
      },
      longFormRender: {
        fileName: 'long-form.pdf',
        currentVersion: 'v2',
        status: 'RENDERED',
        pageCount: 3,
      },
    },
  };

  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(templateWithRenderedFiles);
  });

  it('renders iframes with PDF URLs when renders are available', async () => {
    render(
      await Page({
        params: Promise.resolve({
          templateId: templateWithRenderedFiles.id,
        }),
      })
    );

    const iframes = document.querySelectorAll('iframe');
    expect(iframes).toHaveLength(2);

    const shortIframe = iframes[0];
    const longIframe = iframes[1];

    expect(shortIframe).toHaveAttribute(
      'src',
      `/templates/files/client-123/renders/${templateWithRenderedFiles.id}/short-form.pdf`
    );
    expect(longIframe).toHaveAttribute(
      'src',
      `/templates/files/client-123/renders/${templateWithRenderedFiles.id}/long-form.pdf`
    );
  });
});
