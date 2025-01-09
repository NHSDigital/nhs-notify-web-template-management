/**
 * @jest-environment node
 */
import EmailTemplateSubmittedPage from '@app/email-template-submitted/[templateId]/page';
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

describe('EmailTemplateSubmittedPage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const template = {
      id: 'template-id',
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'template-name',
      message: 'example',
      subject: 'subject',
    };

    getTemplateMock.mockResolvedValueOnce(template);

    const page = await EmailTemplateSubmittedPage({
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

    await EmailTemplateSubmittedPage({
      params: {
        templateId: 'invalid-template',
      },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
