/**
 * @jest-environment node
 */
import ViewSubmittedEmailTemplatePage from '@app/view-submitted-email-template/[templateId]/page';
import { ViewEmailTemplate } from '@molecules/ViewEmailTemplate/ViewEmailTemplate';
import {
  SubmittedEmailTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('ViewSubmittedEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const state: SubmittedEmailTemplate = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    };

    getTemplateMock.mockResolvedValueOnce(state);

    const page = await ViewSubmittedEmailTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(<ViewEmailTemplate initialState={state} />);
  });

  it('should redirect to invalid-template when no templateId is found', async () => {
    await ViewSubmittedEmailTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.SMS,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.EMAIL,
      name: undefined as unknown as string,
      subject: 'template-subject-line',
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: undefined as unknown as string,
      message: 'template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: 'template-subject-line',
      message: undefined as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: 'template-subject-line',
      message: null as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, subjectLine is $subject, message is $message, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        version: 1,
        ...value,
      });

      await ViewSubmittedEmailTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});