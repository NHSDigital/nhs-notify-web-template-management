import { render, screen } from '@testing-library/react';
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
} from '@app/preview-approved-letter-template/[templateId]/page';
import content from '@content/content';
import { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

const mockTemplate: AuthoringLetterTemplate = {
  ...AUTHORING_LETTER_TEMPLATE,
  templateStatus: 'PROOF_APPROVED',
  files: {
    ...AUTHORING_LETTER_TEMPLATE.files,
    shortFormRender: {
      currentVersion: 'version-id',
      fileName: 'short-render.pdf',
      status: 'RENDERED',
      pageCount: 2,
    },
    longFormRender: {
      currentVersion: 'version-id',
      fileName: 'long-render.pdf',
      status: 'RENDERED',
      pageCount: 2,
    },
  },
  campaignId: 'campaign-id',
};

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@utils/csrf-utils');

const { approvedPageTitle } = content.pages.previewLetterTemplate;

const NOW = new Date('2025-06-15T12:00:00.000Z');

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers({ now: NOW });
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
});

afterEach(() => {
  jest.useRealTimers();
});

test('metadata', async () => {
  expect(await generateMetadata()).toEqual({
    title: approvedPageTitle,
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

it('redirects to invalid template page when template is PDF letter', async () => {
  jest.mocked(getTemplate).mockResolvedValue(PDF_LETTER_TEMPLATE);

  await Page({
    params: Promise.resolve({ templateId: PDF_LETTER_TEMPLATE.id }),
  });

  expect(redirect).toHaveBeenCalledWith(
    '/invalid-template',
    RedirectType.replace
  );
});

describe('authoring letter template is invalid', () => {
  it('redirects to invalid template page when name is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...mockTemplate,
      name: undefined as unknown as string,
    });

    await Page({
      params: Promise.resolve({ templateId: mockTemplate.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when language is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...mockTemplate,
      language: undefined as unknown as 'en',
    });

    await Page({
      params: Promise.resolve({ templateId: mockTemplate.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });

  it('redirects to invalid template page when letterType is missing', async () => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...mockTemplate,
      letterType: undefined as unknown as 'x0',
    });

    await Page({
      params: Promise.resolve({ templateId: mockTemplate.id }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });
});

describe('valid authoring letter template', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(mockTemplate);
    jest.mocked(getLetterVariantById).mockResolvedValue(
      makeLetterVariant({
        id: mockTemplate.letterVariantId,
        name: 'Example Letter Variant',
      })
    );
  });

  it('renders the page without redirecting', async () => {
    const page = await Page({
      params: Promise.resolve({ templateId: mockTemplate.id }),
    });

    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
    expect(getLetterVariantById).toHaveBeenCalledWith(
      mockTemplate.letterVariantId
    );
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(
      await Page({
        params: Promise.resolve({ templateId: mockTemplate.id }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the back link with correct href', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: mockTemplate.id }),
      })
    );

    const backLink = screen.getByTestId('back-link-top');
    expect(backLink).toHaveAttribute('href', '/message-templates');
  });

  it('displays the letter renderer when initialRender file is RENDERED', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: mockTemplate.id }),
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
