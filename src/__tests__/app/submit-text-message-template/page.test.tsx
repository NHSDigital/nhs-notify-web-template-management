import SubmitSmsTemplatePage from '@app/submit-text-message-template/[sessionId]/page';
import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { redirect } from 'next/navigation';
import { getSession } from '@utils/form-actions';
import { TemplateType } from '@utils/types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitTemplate');

const getSessionMock = jest.mocked(getSession);
const redirectMock = jest.mocked(redirect);

describe('SubmitSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    const state = {
      id: 'session-id',
      templateType: TemplateType.SMS,
      smsTemplateName: 'template-name',
      smsTemplateMessage: 'template-message',
      nhsAppTemplateMessage: '',
      nhsAppTemplateName: '',
    };

    getSessionMock.mockResolvedValue(state);

    const page = await SubmitSmsTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(page).toEqual(
      <SubmitTemplate
        templateName={state.smsTemplateName}
        sessionId={state.id}
        goBackPath='preview-text-message-template'
        submitPath='text-message-template-submitted'
      />
    );
  });

  test('should handle invalid session', async () => {
    getSessionMock.mockResolvedValue(undefined);

    await SubmitSmsTemplatePage({
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
      templateType: TemplateType.EMAIL,
      smsTemplateName: 'valid-name',
      smsTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.NHS_APP,
      smsTemplateName: 'valid-name',
      smsTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.SMS,
      smsTemplateName: 'name-1',
      smsTemplateMessage: undefined,
    },
    {
      templateType: TemplateType.SMS,
      smsTemplateName: undefined,
      smsTemplateMessage: 'message-1',
    },
    {
      templateType: TemplateType.SMS,
      // Note: We have need this casting because Session type does not have a null typing
      smsTemplateName: null as unknown as string,
      smsTemplateMessage: null as unknown as string,
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

      await SubmitSmsTemplatePage({
        params: {
          sessionId: 'session-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
    }
  );
});
