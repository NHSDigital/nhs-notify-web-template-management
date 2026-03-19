import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import {
  AUTHORING_LETTER_TEMPLATE,
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  SMS_TEMPLATE,
  makeLetterVariant,
} from '@testhelpers/helpers';
import { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import Page, {
  generateMetadata,
} from '@app/review-and-approve-letter-template/[templateId]/page';
import { reviewAndApproveLetterTemplateAction } from '@app/review-and-approve-letter-template/[templateId]/server-action';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@app/review-and-approve-letter-template/[templateId]/server-action');
jest.mock('@utils/csrf-utils');

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

const defaultSearchParams = Promise.resolve({
  lockNumber: String(templateWithRenderedFiles.lockNumber),
});

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(reviewAndApproveLetterTemplateAction).mockResolvedValue({});
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
  jest.mocked(getLetterVariantById).mockResolvedValue(makeLetterVariant());
});

test('metadata', async () => {
  expect(await generateMetadata()).toEqual({
    title: 'Review and approve letter template - NHS Notify',
  });
});

describe('template does not exist', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(undefined);
  });

  it('redirects to invalid template page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: defaultSearchParams,
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
      searchParams: defaultSearchParams,
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
      searchParams: defaultSearchParams,
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
      searchParams: defaultSearchParams,
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
      searchParams: defaultSearchParams,
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });
});

describe('lockNumber validation', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(templateWithRenderedFiles);
  });

  it('redirects to preview page when lockNumber is missing from searchParams', async () => {
    await Page({
      params: Promise.resolve({
        templateId: templateWithRenderedFiles.id,
      }),
      searchParams: Promise.resolve({}),
    });

    expect(redirect).toHaveBeenCalledWith(
      `/preview-letter-template/${templateWithRenderedFiles.id}`,
      RedirectType.replace
    );
  });

  it('redirects to preview page when lockNumber does not match template', async () => {
    await Page({
      params: Promise.resolve({
        templateId: templateWithRenderedFiles.id,
      }),
      searchParams: Promise.resolve({ lockNumber: '999' }),
    });

    expect(redirect).toHaveBeenCalledWith(
      `/preview-letter-template/${templateWithRenderedFiles.id}`,
      RedirectType.replace
    );
  });

  it('redirects to preview page when lockNumber is not a valid number', async () => {
    await Page({
      params: Promise.resolve({
        templateId: templateWithRenderedFiles.id,
      }),
      searchParams: Promise.resolve({ lockNumber: 'abc' }),
    });

    expect(redirect).toHaveBeenCalledWith(
      `/preview-letter-template/${templateWithRenderedFiles.id}`,
      RedirectType.replace
    );
  });

  it('redirects to preview page when template has no letterVariantId', async () => {
    const templateWithoutVariant: AuthoringLetterTemplate = {
      ...templateWithRenderedFiles,
      letterVariantId: undefined,
    };

    jest.mocked(getTemplate).mockResolvedValue(templateWithoutVariant);

    await Page({
      params: Promise.resolve({
        templateId: templateWithoutVariant.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: String(templateWithoutVariant.lockNumber),
      }),
    });

    expect(redirect).toHaveBeenCalledWith(
      `/preview-letter-template/${templateWithoutVariant.id}`,
      RedirectType.replace
    );
  });

  it('redirects to preview page when template is missing an expected render', async () => {
    const templateNoLongFormRender: AuthoringLetterTemplate = {
      ...templateWithRenderedFiles,
      files: { ...templateWithRenderedFiles.files, longFormRender: undefined },
    };

    jest.mocked(getTemplate).mockResolvedValue(templateNoLongFormRender);

    await Page({
      params: Promise.resolve({
        templateId: templateNoLongFormRender.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: String(templateNoLongFormRender.lockNumber),
      }),
    });

    expect(redirect).toHaveBeenCalledWith(
      `/preview-letter-template/${templateNoLongFormRender.id}`,
      RedirectType.replace
    );
  });

  it('redirects to preview page when a render is not in expected RENDERED status', async () => {
    const templatePendingRender: AuthoringLetterTemplate = {
      ...templateWithRenderedFiles,
      files: {
        ...templateWithRenderedFiles.files,
        shortFormRender: {
          status: 'PENDING',
          requestedAt: '2026-03-18T08:08:04.547Z',
        },
      },
    };

    jest.mocked(getTemplate).mockResolvedValue(templatePendingRender);

    await Page({
      params: Promise.resolve({
        templateId: templatePendingRender.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: String(templatePendingRender.lockNumber),
      }),
    });

    expect(redirect).toHaveBeenCalledWith(
      `/preview-letter-template/${templatePendingRender.id}`,
      RedirectType.replace
    );
  });
});

describe('valid authoring letter template', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(templateWithRenderedFiles);
  });

  it('renders the page without redirecting', async () => {
    const page = await Page({
      params: Promise.resolve({ templateId: templateWithRenderedFiles.id }),
      searchParams: defaultSearchParams,
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('calls getLetterVariantById with the template letterVariantId', async () => {
    await Page({
      params: Promise.resolve({ templateId: templateWithRenderedFiles.id }),
      searchParams: defaultSearchParams,
    });

    expect(getLetterVariantById).toHaveBeenCalledWith(
      templateWithRenderedFiles.letterVariantId
    );
  });

  it('renders the heading and caption', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: templateWithRenderedFiles.id }),
        searchParams: defaultSearchParams,
      })
    );

    expect(screen.getByTestId('preview-message__heading')).toHaveTextContent(
      `Review and approve 'authoring letter template name'`
    );
    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
  });

  it('renders hidden templateId and lockNumber inputs', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: templateWithRenderedFiles.id }),
        searchParams: defaultSearchParams,
      })
    );

    const form = screen.getByRole('button', {
      name: 'Approve letter template',
    });
    expect(form).toBeInTheDocument();
  });

  it('submits the form with correct data', async () => {
    const user = userEvent.setup();

    render(
      await Page({
        params: Promise.resolve({ templateId: templateWithRenderedFiles.id }),
        searchParams: defaultSearchParams,
      })
    );

    await user.click(
      screen.getByRole('button', { name: 'Approve letter template' })
    );

    expect(reviewAndApproveLetterTemplateAction).toHaveBeenCalledTimes(1);

    const formData = jest.mocked(reviewAndApproveLetterTemplateAction).mock
      .calls[0][1] as FormData;

    expect(formData.get('templateId')).toBe(templateWithRenderedFiles.id);

    expect(formData.get('lockNumber')).toBe(
      String(templateWithRenderedFiles.lockNumber)
    );
  });

  it('renders iframes with PDF URLs when renders are available', async () => {
    render(
      await Page({
        params: Promise.resolve({
          templateId: templateWithRenderedFiles.id,
        }),
        searchParams: Promise.resolve({
          lockNumber: String(templateWithRenderedFiles.lockNumber),
        }),
      })
    );

    const iframes = document.querySelectorAll('iframe');
    expect(iframes).toHaveLength(2);

    const [shortIframe, longIframe] = iframes;

    expect(shortIframe).toHaveAttribute(
      'src',
      `/templates/files/client-123/renders/${templateWithRenderedFiles.id}/short-form.pdf`
    );

    expect(longIframe).toHaveAttribute(
      'src',
      `/templates/files/client-123/renders/${templateWithRenderedFiles.id}/long-form.pdf`
    );
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(
      await Page({
        params: Promise.resolve({
          templateId: templateWithRenderedFiles.id,
        }),
        searchParams: Promise.resolve({
          lockNumber: String(templateWithRenderedFiles.lockNumber),
        }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
