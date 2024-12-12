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

jest.mock('@forms/NhsAppTemplateForm/NhsAppTemplateForm');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('EditNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('page loads', async () => {
    const state: NHSAppTemplate = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'name',
      message: 'message',
    };

    getTemplateMock.mockResolvedValueOnce(state);

    const page = await EditNhsAppTemplatePage({
      params: { templateId: 'template-id' },
    });

    expect(page).toEqual(<NhsAppTemplateForm initialState={state} />);
  });

  test('should render invalid template, when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditNhsAppTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  const invalidTemplateTypes: TemplateType[] = [
    TemplateType.EMAIL,
    TemplateType.SMS,
    TemplateType.LETTER,
  ];

  test.each(invalidTemplateTypes)(
    'should render invalid template, when template type is %p',
    async (templateType) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        version: 1,
        templateType,
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        name: 'name',
        message: 'message',
      });

      await EditNhsAppTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
