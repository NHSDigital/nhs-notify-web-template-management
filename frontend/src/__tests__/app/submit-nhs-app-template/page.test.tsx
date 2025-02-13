/**
 * @jest-environment node
 */
import SubmitNhsAppTemplatePage from '@app/submit-nhs-app-template/[templateId]/page';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import {
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitTemplate');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('SubmitNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'template-name',
      message: 'template-message',
    };

    getTemplateMock.mockResolvedValue({
      ...state,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await SubmitNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });
    expect(page).toEqual(
      <SubmitTemplate
        templateName={state.name}
        templateId={state.id}
        goBackPath='preview-nhs-app-template'
        submitPath='nhs-app-template-submitted'
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitNhsAppTemplatePage({
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
        createdAt: 'today',
        updatedAt: 'today',
      });

      await SubmitNhsAppTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
