import SubmitEmailTemplatePage from '@app/submit-email-template/[sessionId]/page';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { redirect } from 'next/navigation';
import { getSession } from '@utils/form-actions';
import { TemplateType } from '@utils/types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitTemplate');

const getSessionMock = jest.mocked(getSession);
const redirectMock = jest.mocked(redirect);

describe('SubmitEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'session-id',
      templateType: TemplateType.EMAIL,
      emailTemplateName: 'template-name',
      emailTemplateSubjectLine: 'template-subject-line',
      emailTemplateMessage: 'template-message',
      nhsAppTemplateMessage: '',
      nhsAppTemplateName: '',
    };

    getSessionMock.mockResolvedValue(state);

    const page = await SubmitEmailTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(page).toEqual(
    <SubmitTemplate
      templateName={state.emailTemplateName}
      sessionId={state.id}
      goBackPath='preview-email-template'
      submitPath='email-template-submitted'/>
    );
  });

  test('should handle invalid session', async () => {
    getSessionMock.mockResolvedValue(undefined);

    await SubmitEmailTemplatePage({
      params: {
        sessionId: 'invalid-session',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.LETTER,
      smsTemplateName: 'valid-name',
      smsTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.SMS,
      smsTemplateName: 'valid-name',
      smsTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.NHS_APP,
      smsTemplateName: 'valid-name',
      smsTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.EMAIL,
      emailTemplateName: 'name-1',
      emailTemplateSubjectLine: undefined,
      emailTemplateMessage: 'message-1',
    },
    {
      templateType: TemplateType.EMAIL,
      emailTemplateName: 'name-1',
      emailTemplateSubjectLine: 'subject-1',
      emailTemplateMessage: undefined,
    },
    {
      templateType: TemplateType.EMAIL,
      emailTemplateName: undefined,
      emailTemplateSubjectLine: 'subject-1',
      emailTemplateMessage: 'message-1',
    },
  ])(
    'should redirect to invalid-session when session template is $templateType and name is $smsTemplateName and message is $smsTemplateMessage',
    async (value) => {
      getSessionMock.mockResolvedValueOnce({
        id: 'session-id',
        nhsAppTemplateMessage: '',
        nhsAppTemplateName: '',
        ...value,
      });

      await SubmitEmailTemplatePage({
        params: {
          sessionId: 'session-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
    }
  );
});
