/**
 * @jest-environment node
 */
import NhsAppTemplateSubmittedPage from '@app/nhs-app-template-submitted/[templateId]/page';
import {
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@molecules/TemplateSubmitted/TemplateSubmitted');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('NhsAppTemplateSubmittedPage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const template = {
      id: 'template-id',
      templateType: 'NHS_APP',
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'template-name',
      message: 'example',
    } satisfies Partial<TemplateDTO>;

    getTemplateMock.mockResolvedValueOnce({
      ...template,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await NhsAppTemplateSubmittedPage({
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
    getTemplateMock.mockResolvedValueOnce(undefined);

    await NhsAppTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'invalid-template',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
