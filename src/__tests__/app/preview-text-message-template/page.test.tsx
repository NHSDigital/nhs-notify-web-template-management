import PreviewSMSTemplatePage from '@app/preview-text-message-template/[sessionId]/page';
import { ReviewSMSTemplate } from '@forms/ReviewSMSTemplate';
import { TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { getSession } from '@utils/form-actions';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewSMSTemplate');

const redirectMock = jest.mocked(redirect);
const getSessionMock = jest.mocked(getSession);

describe('PreviewSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const state = {
      id: 'session-id',
      templateType: TemplateType.SMS,
      smsTemplateName: 'template-name',
      smsTemplateMessage: 'template-message',
      nhsAppTemplateMessage: '',
      nhsAppTemplateName: '',
    };

    getSessionMock.mockResolvedValueOnce(state);

    const page = await PreviewSMSTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(page).toEqual(<ReviewSMSTemplate initialState={state} />);
  });

  it('should redirect to invalid-session when no session is found', async () => {
    await PreviewSMSTemplatePage({
      params: {
        sessionId: 'session-id',
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

      await PreviewSMSTemplatePage({
        params: {
          sessionId: 'session-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
    }
  );
});
