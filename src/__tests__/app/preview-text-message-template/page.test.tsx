import PreviewSMSTemplatePage from '@app/preview-text-message-template/[sessionId]/page';
import { TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { getSession } from '@utils/form-actions';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => ({
    models: {
      SessionStorage: {
        update: () => ({ data: {} }),
      },
    },
  }),
}));
jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewSMSTemplate');

const redirectMock = jest.mocked(redirect);
const getSessionMock = jest.mocked(getSession);

describe('PreviewSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

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

  it('should render ReviewSMSTemplate with session data', async () => {
    getSessionMock.mockResolvedValueOnce({
      id: 'session-id',
      templateType: TemplateType.SMS,
      smsTemplateName: 'template-name',
      smsTemplateMessage: 'template-message',
      nhsAppTemplateMessage: '',
      nhsAppTemplateName: '',
    });

    const page = await PreviewSMSTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(page).toMatchSnapshot();
  });
});
