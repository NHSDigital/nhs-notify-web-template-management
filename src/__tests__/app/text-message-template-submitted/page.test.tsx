import SmsTemplateSubmittedPage from '@app/text-message-template-submitted/[templateId]/page';
import { TemplateType } from '@utils/enum';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@molecules/TemplateSubmitted/TemplateSubmitted');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@utils/logger');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('TextMessageTemplateSubmittedPage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const template = {
      id: 'template-id',
      templateType: TemplateType.SMS,
      version: 1,
      SMS: {
        name: 'template-name',
        message: 'example',
      },
    };

    getTemplateMock.mockResolvedValueOnce(template);

    const page = await SmsTemplateSubmittedPage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(
      <TemplateSubmitted
        templateId={template.id}
        templateName={template.SMS.name}
      />
    );
  });

  test('should handle invalid template', async () => {
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
