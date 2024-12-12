/**
 * @jest-environment node
 */
import ViewSubmittedNHSAppTemplatePage from '@app/view-submitted-nhs-app-template/[templateId]/page';
import { ViewNHSAppTemplate } from '@molecules/ViewNHSAppTemplate/ViewNHSAppTemplate';
import {
  SubmittedNHSAppTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('ViewSubmittedNHSAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const state: SubmittedNHSAppTemplate = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'template-name',
      message: 'template-message',
    };

    getTemplateMock.mockResolvedValueOnce(state);

    const page = await ViewSubmittedNHSAppTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(<ViewNHSAppTemplate initialState={state} />);
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await ViewSubmittedNHSAppTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.LETTER,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: undefined as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.NHS_APP,
      name: undefined as unknown as string,
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.NHS_APP,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.NHS_APP,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, message is $message, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        version: 1,
        ...value,
      });

      await ViewSubmittedNHSAppTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
