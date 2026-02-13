/**
 * @jest-environment node
 */
import EmailTemplateSubmittedPage, {
  generateMetadata,
} from '@app/email-template-submitted/[templateId]/page';
import { NHSNotifyContainer } from '@layouts/container/container';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-backend-client';
import content from '@content/content';

const { pageTitle } = content.components.templateSubmitted;

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
      lockNumber: 1,
    } satisfies TemplateDto;

    getTemplateMock.mockResolvedValueOnce(template);

    const page = await EmailTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(
      <NHSNotifyContainer>
        <TemplateSubmitted
          templateId={template.id}
          templateName={template.name}
        />
      </NHSNotifyContainer>
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EmailTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'invalid-template',
      }),
    });

    expect(await generateMetadata()).toEqual({ title: pageTitle.EMAIL });
    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
