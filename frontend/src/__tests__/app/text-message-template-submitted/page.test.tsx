/**
 * @jest-environment node
 */
import SmsTemplateSubmittedPage, {
  generateMetadata,
} from '@app/text-message-template-submitted/[templateId]/page';
import { NHSNotifyContainer } from '@layouts/container/container';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-web-template-management-types';
import content from '@content/content';

const { pageTitle } = content.components.templateSubmitted;

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
      templateType: 'SMS',
      templateStatus: 'SUBMITTED',
      name: 'template-name',
      message: 'example',
      lockNumber: 1,
    } satisfies Partial<TemplateDto>;

    getTemplateMock.mockResolvedValueOnce({
      ...template,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await SmsTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle.SMS,
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

    await SmsTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'invalid-template',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
