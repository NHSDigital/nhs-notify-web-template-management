/**
 * @jest-environment node
 */
import SubmitEmailTemplatePage from '@app/submit-email-template/[templateId]/page';
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

describe('SubmitEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'template-id',
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    };

    getTemplateMock.mockResolvedValue({
      ...state,
      createdAt: 'today',
      updatedAt: 'today',
    });

    const page = await SubmitEmailTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(
      <SubmitTemplate
        templateName={state.name}
        templateId={state.id}
        goBackPath='preview-email-template'
        submitPath='email-template-submitted'
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValue(undefined);

    await SubmitEmailTemplatePage({
      params: {
        templateId: 'invalid-template',
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
    },
    {
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    },
    {
      templateType: TemplateType.EMAIL,
      name: undefined as unknown as string,
      subject: 'template-subject-line',
      message: 'template-message',
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: undefined as unknown as string,
      message: 'template-message',
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: 'template-subject-line',
      message: undefined as unknown as string,
    },
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      subject: 'template-subject-line',
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $smsTemplateName and message is $smsTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        ...value,
        createdAt: 'today',
        updatedAt: 'today',
      });

      await SubmitEmailTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
