import { render, screen } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import {
  AUTHORING_LETTER_TEMPLATE,
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import Page, {
  generateMetadata,
} from '@app/letter-template-approved/[templateId]/page';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('LetterTemplateApprovedPage', () => {
  beforeEach(jest.resetAllMocks);

  test('should render page and match snapshot', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'PROOF_APPROVED',
    });

    const { asFragment } = render(
      await Page({
        params: Promise.resolve({ templateId: 'template-id' }),
      })
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('should generate page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Letter template approved - NHS Notify',
    });
  });

  test('should render page with expected links', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'PROOF_APPROVED',
    });

    render(
      await Page({
        params: Promise.resolve({ templateId: 'template-id' }),
      })
    );

    const messagePlansLink = screen.getByRole('link', {
      name: /message plans/i,
    });
    expect(messagePlansLink).toHaveAttribute(
      'href',
      '/templates/message-plans'
    );

    const templatesLink = screen.getByRole('link', { name: /templates/i });
    expect(templatesLink).toHaveAttribute(
      'href',
      '/templates/message-templates'
    );
  });

  test.each([
    { case: 'undefined', value: undefined },
    { case: 'EMAIL', value: EMAIL_TEMPLATE },
    { case: 'SMS', value: SMS_TEMPLATE },
    { case: 'NHS_APP', value: NHS_APP_TEMPLATE },
    { case: 'PDF LETTER', value: PDF_LETTER_TEMPLATE },
  ])(
    'should redirect to /invalid-template when template is $case',
    async ({ value }) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await Page({
        params: Promise.resolve({ templateId: 'template-id' }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );

  test('should redirect to /preview-letter-template when templateStatus is not PROOF_APPROVED', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...AUTHORING_LETTER_TEMPLATE,
      templateStatus: 'NOT_YET_SUBMITTED',
    });

    await Page({
      params: Promise.resolve({ templateId: 'template-id' }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-letter-template/template-id',
      'replace'
    );
  });
});
