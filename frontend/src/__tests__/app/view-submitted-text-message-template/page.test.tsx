import ViewSubmittedSMSTemplatePage from '@app/view-submitted-text-message-template/[templateId]/page';
import { ViewSMSTemplate } from '@molecules/ViewSMSTemplate/ViewSMSTemplate';
import {
  SubmittedSMSTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('ViewSubmittedSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const state: SubmittedSMSTemplate = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'template-name',
      message: 'template-message',
    };

    getTemplateMock.mockResolvedValueOnce(state);

    const page = await ViewSubmittedSMSTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(<ViewSMSTemplate initialState={state} />);
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await ViewSubmittedSMSTemplatePage({
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
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
      name: 'template-name',
      message: undefined as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
      name: undefined as unknown as string,
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.SMS,
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

      await ViewSubmittedSMSTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
