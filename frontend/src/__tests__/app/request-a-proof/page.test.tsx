import RequestADigitalProofPage, {
  generateMetadata,
} from '@app/request-a-proof/[templateId]/page';
import { render, screen } from '@testing-library/react';
import pageContent from '@content/content';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const { pageTitle, backLink } =
  pageContent.components.howToRequestADigitalProof;

describe('RequestADigitalProofPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('matches snapshot', async () => {
    getTemplateMock.mockResolvedValueOnce(NHS_APP_TEMPLATE);

    const page = render(
      await RequestADigitalProofPage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      })
    );

    expect(page.asFragment()).toMatchSnapshot();
  });

  it('should return metadata', async () => {
    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });
  });

  test.each([
    [NHS_APP_TEMPLATE, 'nhs-app'],
    [SMS_TEMPLATE, 'text-message'],
    [EMAIL_TEMPLATE, 'email'],
  ])(
    'should render page for %s template type with expected back link',
    async (template, channelSlug) => {
      getTemplateMock.mockResolvedValueOnce(template);

      render(
        await RequestADigitalProofPage({
          params: Promise.resolve({
            templateId: 'template-id',
          }),
        })
      );

      expect(getTemplateMock).toHaveBeenCalledWith('template-id');

      const backLinkElement = screen.getByRole('link', { name: backLink.text });

      expect(backLinkElement).toHaveAttribute(
        'href',
        `/preview-${channelSlug}-template/template-id`
      );
    }
  );

  it('should redirect to message templates when no template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await RequestADigitalProofPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/message-templates');
  });

  it('should redirect to message templates when template type is LETTER', async () => {
    getTemplateMock.mockResolvedValueOnce(PDF_LETTER_TEMPLATE);

    await RequestADigitalProofPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/message-templates');
  });
});
