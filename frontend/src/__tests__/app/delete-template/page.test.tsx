/**
 * @jest-environment node
 */
import DeleteTemplatePage from '@app/delete-template/[templateId]/page';
import { DeleteTemplate } from '@forms/DeleteTemplate/DeleteTemplate';
import {
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/DeleteTemplate/DeleteTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDTO;

    const emailTemplate: TemplateDTO = {
      ...templateDTO,
      subject: 'template-subject-line',
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await DeleteTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(<DeleteTemplate template={emailTemplate} />);
  });

  it('should redirect to invalid-template when no templateId is found', async () => {
    await DeleteTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test('should redirect to invalid-template when template is already submitted', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
      templateStatus: TemplateStatus.SUBMITTED,
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: 'template-message',
      createdAt: 'today',
      updatedAt: 'today',
    });

    await DeleteTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test('should redirect to manage-templates when template is already deleted', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
      templateStatus: TemplateStatus.DELETED,
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: 'template-message',
      createdAt: 'today',
      updatedAt: 'today',
    });

    await DeleteTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/manage-templates', 'push');
  });
});
