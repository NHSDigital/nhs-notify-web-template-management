/**
 * @jest-environment node
 */
import SmsTemplateSubmittedPage from '@app/text-message-template-submitted/[templateId]/page';
import {
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@molecules/TemplateSubmitted/TemplateSubmitted');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('TextMessageTemplateSubmittedPage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const template = {
      id: 'template-id',
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.SUBMITTED,
      version: 1,
      name: 'template-name',
      message: 'example',
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
        templateName={template.name}
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