import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { fetchClient } from '@utils/server-features';
import { getTemplate } from '@utils/form-actions';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { editTemplateName } from '@app/edit-template-name/[templateId]/server-action';
import Page, { metadata } from '@app/edit-template-name/[templateId]/page';

jest.mock('next/navigation');
jest.mock('@utils/server-features');
jest.mock('@utils/form-actions');
jest.mock('@app/edit-template-name/[templateId]/server-action');
jest.mock('@utils/csrf-utils');

const mockTemplate: AuthoringLetterTemplate = {
  id: 'template-123',
  name: 'Original Template Name',
  templateType: 'LETTER',
  letterVersion: 'AUTHORING',
  templateStatus: 'NOT_YET_SUBMITTED',
  lockNumber: 5,
  language: 'en',
  letterType: 'x0',
  sidesCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  clientId: 'client-123',
  files: {},
  systemPersonalisation: [],
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(editTemplateName).mockResolvedValue({});
  jest.mocked(fetchClient).mockResolvedValue({
    campaignIds: ['Campaign 1'],
    features: {
      letterAuthoring: true,
    },
  });
  jest.mocked(getTemplate).mockResolvedValue(mockTemplate);
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
});

test('metadata', () => {
  expect(metadata).toEqual({
    title: 'Edit template name - NHS Notify',
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
    await Page({ params: Promise.resolve({ templateId: 'template-123' }) });

    expect(redirect).toHaveBeenCalledWith(
      '/message-templates',
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
    await Page({ params: Promise.resolve({ templateId: 'template-123' }) });

    expect(redirect).toHaveBeenCalledWith(
      '/preview-letter-template/template-123',
      RedirectType.replace
    );
  });
});

describe('client has letter authoring feature flag disabled', () => {
  beforeEach(() => {
    jest.mocked(fetchClient).mockResolvedValue({
      campaignIds: ['Campaign 1'],
      features: {
        letterAuthoring: false,
      },
    });
  });

  it('redirects to message templates page', async () => {
    await Page({ params: Promise.resolve({ templateId: 'template-123' }) });

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
    await Page({ params: Promise.resolve({ templateId: 'template-123' }) });

    expect(redirect).toHaveBeenCalledWith(
      '/preview-submitted-letter-template/template-123',
      RedirectType.replace
    );
  });
});

describe('valid template', () => {
  it('matches snapshot on initial render', async () => {
    expect(
      render(
        await Page({ params: Promise.resolve({ templateId: 'template-123' }) })
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('submits the form with correct data', async () => {
    const user = userEvent.setup();

    render(
      await Page({ params: Promise.resolve({ templateId: 'template-123' }) })
    );

    const nameInput = screen.getByLabelText('Edit template name');

    expect(nameInput).toHaveValue('Original Template Name');

    await user.clear(nameInput);
    await user.click(nameInput);
    await user.keyboard('Updated Template Name');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(editTemplateName).toHaveBeenCalledTimes(1);

    const callArgs = jest.mocked(editTemplateName).mock.calls[0];
    const formData = callArgs[1] as FormData;

    expect(formData.get('name')).toBe('Updated Template Name');
    expect(formData.get('templateId')).toBe('template-123');
    expect(formData.get('lockNumber')).toBe('5');

    expect(
      screen.queryByRole('alert', { name: 'There is a problem' })
    ).not.toBeInTheDocument();
  });

  it('renders errors when blank form is submitted and error state is returned', async () => {
    jest.mocked(editTemplateName).mockResolvedValue({
      errorState: {
        fieldErrors: {
          name: ['Enter a template name'],
        },
      },
    });

    const user = userEvent.setup();

    const page = render(
      await Page({ params: Promise.resolve({ templateId: 'template-123' }) })
    );

    const nameInput = screen.getByLabelText('Edit template name');
    await user.clear(nameInput);

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(editTemplateName).toHaveBeenCalledTimes(1);

    expect(
      await screen.findByRole('alert', { name: 'There is a problem' })
    ).toBeInTheDocument();

    expect(page.asFragment()).toMatchSnapshot();
  });

  it('displays the cancel link with correct href', async () => {
    render(
      await Page({ params: Promise.resolve({ templateId: 'template-123' }) })
    );

    const cancelLink = screen.getByRole('link', { name: 'Go back' });
    expect(cancelLink).toHaveAttribute(
      'href',
      '/preview-letter-template/template-123'
    );
  });
});
