/**
 * @jest-environment node
 */
import EmailTemplateSubmittedPage, {
  generateMetadata,
} from '@app/email-template-submitted/[templateId]/page';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-backend-client';

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
      templateType: 'EMAIL',
      templateStatus: 'SUBMITTED',
      name: 'template-name',
      message: 'example',
      subject: 'subject',
      createdAt: 'today',
      updatedAt: 'today',
    } satisfies TemplateDto;

    getTemplateMock.mockResolvedValueOnce(template);

    const page = await EmailTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
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
    generateMetadata();
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EmailTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'invalid-template',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
