import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { fetchClient } from '@utils/server-features';
import Page, {
  metadata,
} from '@app/upload-other-language-letter-template/page';
import { uploadOtherLanguageLetterTemplate } from '@app/upload-other-language-letter-template/server-action';

jest.mock('next/navigation');
jest.mock('@utils/csrf-utils');
jest.mock('@utils/server-features');
jest.mock('@app/upload-other-language-letter-template/server-action');

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
  jest.mocked(uploadOtherLanguageLetterTemplate).mockResolvedValue({});
});

test('metadata', () => {
  expect(metadata).toEqual({
    title: 'Upload an other language letter template - NHS Notify',
  });
});

describe('client has no campaign ids', () => {
  beforeEach(() => {
    jest.mocked(fetchClient).mockResolvedValue({
      campaignIds: [],
      features: {},
    });
  });

  it('redirects to campaign id required page', async () => {
    await Page();

    expect(redirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });
});

describe('client has one campaign id', () => {
  beforeEach(() => {
    jest.mocked(fetchClient).mockResolvedValue({
      campaignIds: ['Campaign 1'],
      features: {},
    });
  });

  it('matches snapshot on initial render', async () => {
    expect(render(await Page()).asFragment()).toMatchSnapshot();
  });

  it('submits the form with correct data', async () => {
    const user = userEvent.setup();

    render(await Page());

    await user.click(screen.getByLabelText('Template name'));
    await user.keyboard('A new template');

    await user.selectOptions(screen.getByLabelText('Template language'), 'sk');

    const file = new File(['hello'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    await user.upload(screen.getByLabelText('Template file'), file);

    await user.click(
      screen.getByRole('button', { name: 'Upload letter template file' })
    );

    expect(uploadOtherLanguageLetterTemplate).toHaveBeenCalledTimes(1);

    const callArgs = jest.mocked(uploadOtherLanguageLetterTemplate).mock
      .calls[0];
    const formData = callArgs[1] as FormData;

    expect(formData.get('name')).toBe('A new template');
    expect(formData.get('campaignId')).toBe('Campaign 1');
    expect(formData.get('file')).toBeInstanceOf(File);
    expect(formData.get('language')).toBe('sk');

    expect(
      screen.queryByRole('alert', { name: 'There is a problem' })
    ).not.toBeInTheDocument();
  });

  it('renders errors when blank form is submitted and error state is returned', async () => {
    jest.mocked(uploadOtherLanguageLetterTemplate).mockResolvedValue({
      errorState: {
        fieldErrors: {
          name: ['Enter a template name'],
          file: ['Choose a template file'],
          language: ['Choose a language'],
        },
      },
    });

    const user = userEvent.setup();

    const page = render(await Page());

    await user.click(
      screen.getByRole('button', { name: 'Upload letter template file' })
    );

    expect(
      screen.queryByRole('alert', { name: 'There is a problem' })
    ).toBeInTheDocument();

    expect(page.asFragment()).toMatchSnapshot();
  });

  it('renders the rtl template link if an rtl language is selected', async () => {
    const user = userEvent.setup();

    const page = render(await Page());

    expect(
      page.queryByRole('link', {
        name: 'other language (right-aligned) letter template file',
      })
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Template language'), 'sk');

    expect(
      page.queryByRole('link', {
        name: 'other language (right-aligned) letter template file',
      })
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Template language'), 'ar');

    expect(
      page.getByRole('link', {
        name: 'other language (right-aligned) letter template file',
      })
    ).toBeInTheDocument();

    expect(page.asFragment()).toMatchSnapshot();

    await user.selectOptions(screen.getByLabelText('Template language'), 'sk');

    expect(
      page.queryByRole('link', {
        name: 'other language (right-aligned) letter template file',
      })
    ).not.toBeInTheDocument();
  });
});

describe('client has multiple campaign ids', () => {
  beforeEach(() => {
    jest.mocked(fetchClient).mockResolvedValue({
      campaignIds: ['Campaign 1', 'Campaign 2'],
      features: {},
    });
  });

  it('matches snapshot on initial render', async () => {
    expect(render(await Page()).asFragment()).toMatchSnapshot();
  });

  it('submits the form with correct data', async () => {
    const user = userEvent.setup();

    render(await Page());

    await user.click(screen.getByLabelText('Template name'));
    await user.keyboard('A new template');

    await user.selectOptions(screen.getByLabelText('Campaign'), 'Campaign 2');

    await user.selectOptions(screen.getByLabelText('Template language'), 'sk');

    const file = new File(['hello'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    await user.upload(screen.getByLabelText('Template file'), file);

    await user.click(
      screen.getByRole('button', { name: 'Upload letter template file' })
    );

    expect(uploadOtherLanguageLetterTemplate).toHaveBeenCalledTimes(1);

    const callArgs = jest.mocked(uploadOtherLanguageLetterTemplate).mock
      .calls[0];
    const formData = callArgs[1] as FormData;

    expect(formData.get('name')).toBe('A new template');
    expect(formData.get('campaignId')).toBe('Campaign 2');
    expect(formData.get('file')).toBeInstanceOf(File);
    expect(formData.get('language')).toBe('sk');

    expect(
      screen.queryByRole('alert', { name: 'There is a problem' })
    ).not.toBeInTheDocument();
  });

  it('renders errors when blank form is submitted and error state is returned', async () => {
    jest.mocked(uploadOtherLanguageLetterTemplate).mockResolvedValue({
      errorState: {
        fieldErrors: {
          name: ['Enter a template name'],
          campaignId: ['Choose a campaign'],
          language: ['Choose a language'],
          file: ['Choose a template file'],
        },
      },
    });

    const user = userEvent.setup();

    const page = render(await Page());

    await user.click(
      screen.getByRole('button', { name: 'Upload letter template file' })
    );

    expect(uploadOtherLanguageLetterTemplate).toHaveBeenCalledTimes(1);

    expect(
      screen.queryByRole('alert', { name: 'There is a problem' })
    ).toBeInTheDocument();

    expect(page.asFragment()).toMatchSnapshot();
  });
});
