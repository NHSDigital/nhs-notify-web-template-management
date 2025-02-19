/**
 * @jest-environment node
 */
import PreviewNhsAppTemplatePage from '@app/preview-nhs-app-template/[templateId]/page';
import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate';
import {
  NHSAppTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO: TemplateDTO = {
      id: 'template-id',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    const nhsAppTemplate: NHSAppTemplate = {
      ...templateDTO,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(
      <ReviewNHSAppTemplate initialState={nhsAppTemplate} />
    );
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      message: 'template-message',
    },
    {
      templateType: TemplateType.SMS,
      name: 'template-name',
      message: 'template-message',
    },
    {
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: undefined as unknown as string,
    },
    {
      templateType: TemplateType.NHS_APP,
      name: undefined as unknown as string,
      message: 'template-message',
    },
    {
      templateType: TemplateType.NHS_APP,
      name: null as unknown as string,
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $nhsAppTemplateName and message is $nhsAppTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        ...value,
        createdAt: '2025-01-13T10:19:25.579Z',
        updatedAt: '2025-01-13T10:19:25.579Z',
      });

      await PreviewNhsAppTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
