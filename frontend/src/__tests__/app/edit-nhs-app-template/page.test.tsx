/**
 * @jest-environment node
 */
import { redirect } from 'next/navigation';
import {
  TemplateType,
  TemplateStatus,
  NHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import EditNhsAppTemplatePage from '@app/edit-nhs-app-template/[templateId]/page';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@forms/NhsAppTemplateForm/NhsAppTemplateForm');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('EditNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('page loads', async () => {
    const templateDTO: TemplateDTO = {
      id: 'template-id',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    const nhsAppTemplate: NHSAppTemplate = {
      ...templateDTO,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await EditNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(<NhsAppTemplateForm initialState={nhsAppTemplate} />);
  });

  test('should render invalid template, when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  const invalidTemplateTypes: TemplateType[] = [
    TemplateType.EMAIL,
    TemplateType.SMS,
  ];

  test.each(invalidTemplateTypes)(
    'should render invalid template, when template type is %p',
    async (templateType) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        templateType,
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        name: 'name',
        message: 'message',
        createdAt: 'today',
        updatedAt: 'today',
      });

      await EditNhsAppTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
