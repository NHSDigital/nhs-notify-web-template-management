import SmsTemplateSubmittedPage from '@app/text-message-template-submitted/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@molecules/TemplateSubmitted/TemplateSubmitted');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('TextMessageTemplateSubmittedPage', () => {

  beforeEach(jest.resetAllMocks);

  test('SmsTemplateSubmitted', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
      name: 'template-name',
      type: 'SMS',
      version: 1,
      fields: {
        content: 'example',
        subjectLine: null,
      }
    });

    const page = await SmsTemplateSubmittedPage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toMatchSnapshot();
  });

  test('SmsTemplateSubmitted - should handle invalid template', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await SmsTemplateSubmittedPage({
      params: {
        templateId: 'invalid-template',
      },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
