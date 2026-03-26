import GetReadyToApproveLetterTemplatePage, {
  generateMetadata,
} from '@app/get-ready-to-approve-letter-template/[templateId]/page';
import { render } from '@testing-library/react';
import pageContent from '@content/content';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  AUTHORING_LETTER_TEMPLATE,
  SMS_TEMPLATE,
  PDF_LETTER_TEMPLATE,
} from '@testhelpers/helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const {
  pageTitle,
  continue: continueLink,
  back,
} = pageContent.pages.getReadyToApproveLetterTemplate;

describe('GetReadyToApproveLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('matches snapshot', async () => {
    getTemplateMock.mockResolvedValueOnce(AUTHORING_LETTER_TEMPLATE);

    const page = render(
      await GetReadyToApproveLetterTemplatePage({
        params: Promise.resolve({
          templateId: AUTHORING_LETTER_TEMPLATE.id,
        }),
      })
    );

    const continueElement = page.getByRole('button', {
      name: continueLink.text,
    });

    expect(continueElement).toHaveAttribute(
      'href',
      `/templates/review-and-approve-letter-template/${AUTHORING_LETTER_TEMPLATE.id}`
    );

    const backLinkElement = page.getByRole('button', { name: back.text });

    expect(backLinkElement).toHaveAttribute(
      'href',
      `/templates/preview-letter-template/${AUTHORING_LETTER_TEMPLATE.id}`
    );

    expect(page.asFragment()).toMatchSnapshot();
  });

  it('should return metadata', async () => {
    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });
  });

  test.each([
    ['NHS_APP', NHS_APP_TEMPLATE],
    ['SMS', SMS_TEMPLATE],
    ['EMAIL', EMAIL_TEMPLATE],
  ])('should redirect user when templateType is %s', async (_, template) => {
    getTemplateMock.mockResolvedValueOnce(template);

    render(
      await GetReadyToApproveLetterTemplatePage({
        params: Promise.resolve({
          templateId: template.id,
        }),
      })
    );
    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid template page when letter template is not an authoring template', async () => {
    getTemplateMock.mockResolvedValueOnce(PDF_LETTER_TEMPLATE);

    await GetReadyToApproveLetterTemplatePage({
      params: Promise.resolve({
        templateId: PDF_LETTER_TEMPLATE.id,
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid template page when no template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await GetReadyToApproveLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
