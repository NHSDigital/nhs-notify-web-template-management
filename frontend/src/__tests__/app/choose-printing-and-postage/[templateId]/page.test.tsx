import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import { LetterVariant, TemplateDto } from 'nhs-notify-backend-client';
import { fetchClient } from '@utils/server-features';
import { getLetterVariantsForTemplate, getTemplate } from '@utils/form-actions';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { choosePrintingAndPostage } from '@app/choose-printing-and-postage/[templateId]/server-action';
import Page, {
  metadata,
} from '@app/choose-printing-and-postage/[templateId]/page';

jest.mock('next/navigation');
jest.mock('@utils/server-features');
jest.mock('@utils/form-actions');
jest.mock('@app/choose-printing-and-postage/[templateId]/server-action');
jest.mock('@utils/csrf-utils');

const mockTemplate: TemplateDto = {
  id: 'template-123',
  name: 'Test Letter Template',
  templateType: 'LETTER',
  letterVersion: 'AUTHORING',
  templateStatus: 'NOT_YET_SUBMITTED',
  lockNumber: 5,
  language: 'en',
  letterType: 'x0',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  clientId: 'client-123',
  letterVariantId: 'variant-1',
  files: {
    initialRender: {
      pageCount: 2,
      currentVersion: 'version',
      fileName: 'name.pdf',
      status: 'RENDERED',
    },
  },
};

const mockVariants: LetterVariant[] = [
  {
    id: 'variant-1',
    name: 'First Class Option',
    bothSides: true,
    dispatchTime: 'standard',
    envelopeSize: 'C4',
    maxSheets: 4,
    postage: 'first class',
    printColour: 'colour',
    sheetSize: 'A4',
    status: 'PROD',
    type: 'STANDARD',
  },
  {
    id: 'variant-2',
    name: 'Economy Option',
    bothSides: false,
    dispatchTime: 'standard',
    envelopeSize: 'C5',
    maxSheets: 2,
    postage: 'economy',
    printColour: 'black',
    sheetSize: 'A4',
    status: 'PROD',
    type: 'STANDARD',
  },
];

const validSearchParams = Promise.resolve({ lockNumber: '7' });

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(choosePrintingAndPostage).mockResolvedValue({
    errorState: {
      formErrors: [],
      fieldErrors: {},
    },
    fields: {},
  });
  jest.mocked(fetchClient).mockResolvedValue({
    features: {
      letterAuthoring: true,
    },
  });
  jest.mocked(getTemplate).mockResolvedValue(mockTemplate);
  jest.mocked(getLetterVariantsForTemplate).mockResolvedValue(mockVariants);
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
});

test('metadata', () => {
  expect(metadata).toEqual({
    title: 'Choose a printing and postage option - NHS Notify',
  });
});

describe('template does not exist', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue(undefined);
  });

  it('redirects to invalid template page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: validSearchParams,
    });

    expect(redirect).toHaveBeenCalledWith(
      '/invalid-template',
      RedirectType.replace
    );
  });
});

describe('template is not a letter', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue({
      id: 'template-123',
      name: 'Email Template',
      templateType: 'EMAIL',
      templateStatus: 'NOT_YET_SUBMITTED',
      lockNumber: 5,
      message: 'Test message',
      subject: 'Test subject',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      clientId: 'client-123',
    });
  });

  it('redirects to message templates page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: validSearchParams,
    });

    expect(redirect).toHaveBeenCalledWith(
      '/templates/message-templates',
      RedirectType.replace
    );
  });
});

describe('letter version is not AUTHORING', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue({
      id: 'template-123',
      name: 'PDF Letter Template',
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      lockNumber: 5,
      language: 'en',
      letterType: 'x0',
      letterVersion: 'PDF',
      files: {
        pdfTemplate: {
          fileName: 'test.pdf',
          currentVersion: 'v1',
          virusScanStatus: 'PASSED',
        },
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      clientId: 'client-123',
    });
  });

  it('redirects to preview letter template page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: validSearchParams,
    });

    expect(redirect).toHaveBeenCalledWith(
      '/preview-letter-template/template-123',
      RedirectType.replace
    );
  });
});

describe('client has letter authoring feature flag disabled', () => {
  beforeEach(() => {
    jest.mocked(fetchClient).mockResolvedValue({
      features: {
        letterAuthoring: false,
      },
    });
  });

  it('redirects to message templates page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: validSearchParams,
    });

    expect(redirect).toHaveBeenCalledWith(
      '/message-templates',
      RedirectType.replace
    );
  });
});

describe('template has been submitted', () => {
  beforeEach(() => {
    jest.mocked(getTemplate).mockResolvedValue({
      ...mockTemplate,
      templateStatus: 'SUBMITTED',
    });
  });

  it('redirects to preview submitted letter template page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: validSearchParams,
    });

    expect(redirect).toHaveBeenCalledWith(
      '/preview-submitted-letter-template/template-123',
      RedirectType.replace
    );
  });
});

describe('lockNumber search parameter validation fails', () => {
  it('redirects to preview letter template page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: Promise.resolve({ lockNumber: 'invalid-lock-number' }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/preview-letter-template/template-123',
      RedirectType.replace
    );
  });
});

describe('variants is undefined', () => {
  beforeEach(() => {
    jest.mocked(getLetterVariantsForTemplate).mockResolvedValue(undefined);
  });

  it('redirects to preview letter template page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: validSearchParams,
    });

    expect(redirect).toHaveBeenCalledWith(
      '/preview-letter-template/template-123',
      RedirectType.replace
    );
  });
});

describe('variants is empty array', () => {
  beforeEach(() => {
    jest.mocked(getLetterVariantsForTemplate).mockResolvedValue([]);
  });

  it('redirects to preview letter template page', async () => {
    await Page({
      params: Promise.resolve({ templateId: 'template-123' }),
      searchParams: validSearchParams,
    });

    expect(redirect).toHaveBeenCalledWith(
      '/preview-letter-template/template-123',
      RedirectType.replace
    );
  });
});

describe('valid template', () => {
  it('matches snapshot on initial render', async () => {
    expect(
      render(
        await Page({
          params: Promise.resolve({ templateId: 'template-123' }),
          searchParams: validSearchParams,
        })
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('submits the form with correct data', async () => {
    const user = userEvent.setup();

    render(
      await Page({
        params: Promise.resolve({ templateId: 'template-123' }),
        searchParams: validSearchParams,
      })
    );

    const variantRadio = screen.getByRole('radio', { name: 'Economy Option' });
    await user.click(variantRadio);

    await user.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(choosePrintingAndPostage).toHaveBeenCalledTimes(1);

    const callArgs = jest.mocked(choosePrintingAndPostage).mock.calls[0];
    const formData = callArgs[1] as FormData;

    expect(formData.get('letterVariantId')).toBe('variant-2');
    expect(formData.get('templateId')).toBe('template-123');
    expect(formData.get('lockNumber')).toBe('7');

    expect(
      screen.queryByRole('alert', { name: 'There is a problem' })
    ).not.toBeInTheDocument();
  });

  it('renders errors when no variant is selected and error state is returned', async () => {
    jest.mocked(choosePrintingAndPostage).mockResolvedValue({
      errorState: {
        formErrors: [],
        fieldErrors: {
          letterVariantId: ['Choose a printing and postage option'],
        },
      },
      fields: {},
    });

    const user = userEvent.setup();

    const page = render(
      await Page({
        params: Promise.resolve({ templateId: 'template-123' }),
        searchParams: validSearchParams,
      })
    );

    await user.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(choosePrintingAndPostage).toHaveBeenCalledTimes(1);

    expect(
      await screen.findByRole('alert', { name: 'There is a problem' })
    ).toBeInTheDocument();

    expect(page.asFragment()).toMatchSnapshot();
  });

  it('displays the back link with correct href', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: 'template-123' }),
        searchParams: validSearchParams,
      })
    );

    const backLink = screen.getByRole('link', { name: 'Go back' });
    expect(backLink).toHaveAttribute(
      'href',
      '/preview-letter-template/template-123'
    );
  });

  it('displays variant details correctly', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: 'template-123' }),
        searchParams: validSearchParams,
      })
    );

    expect(
      screen.getByRole('radio', { name: 'First Class Option' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Economy Option' })
    ).toBeInTheDocument();

    for (const [index, variant] of mockVariants.entries()) {
      expect(screen.getAllByText(/Sheet size/)[index]).toHaveTextContent(
        variant.sheetSize
      );
      expect(
        screen.getAllByText(/Maximum number of sheets/)[index]
      ).toHaveTextContent(String(variant.maxSheets));
      expect(
        screen.getAllByText(/Print on both sides/)[index]
      ).toHaveTextContent(variant.bothSides ? 'yes' : 'no');
      expect(screen.getAllByText(/Print colour/)[index]).toHaveTextContent(
        variant.printColour
      );
      expect(screen.getAllByText(/Envelope size/)[index]).toHaveTextContent(
        variant.envelopeSize
      );
      expect(screen.getAllByText(/Dispatch time/)[index]).toHaveTextContent(
        variant.dispatchTime
      );
      expect(screen.getAllByText(/Postage/)[index]).toHaveTextContent(
        variant.postage
      );
    }
  });

  it('pre-selects the current letterVariantId from template', async () => {
    render(
      await Page({
        params: Promise.resolve({ templateId: 'template-123' }),
        searchParams: validSearchParams,
      })
    );

    const standardOptionRadio = screen.getByRole('radio', {
      name: 'First Class Option',
    });
    expect(standardOptionRadio).toBeChecked();
  });
});
