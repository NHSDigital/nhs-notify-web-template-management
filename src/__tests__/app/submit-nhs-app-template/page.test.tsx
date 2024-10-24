import SubmitNhsAppTemplatePage from '@app/submit-nhs-app-template/[sessionId]/page';
import { redirect } from 'next/navigation';
import { getSession } from '@utils/form-actions';
import { TemplateType } from '@utils/types';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SubmitTemplate/SubmitTemplate');

const getSessionMock = jest.mocked(getSession);
const redirectMock = jest.mocked(redirect);

describe('SubmitNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    getSessionMock.mockResolvedValue({
      id: 'session-id',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    });

    const page = await SubmitNhsAppTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(page).toMatchSnapshot();
  });

  test('should handle invalid session', async () => {
    getSessionMock.mockResolvedValue(undefined);

    await SubmitNhsAppTemplatePage({
      params: {
        sessionId: 'invalid-session',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.LETTER,
      nhsAppTemplateName: 'valid-name',
      nhsAppTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.EMAIL,
      nhsAppTemplateName: 'valid-name',
      nhsAppTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.SMS,
      nhsAppTemplateName: 'valid-name',
      nhsAppTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: 'name-1',
      // Note: We have todo this casting because nhsAppTemplateMessage on Session type is required
      nhsAppTemplateMessage: undefined as unknown as string,
    },
    {
      templateType: TemplateType.NHS_APP,
      // Note: We have todo this casting because nhsAppTemplateName on Session type is required
      nhsAppTemplateName: undefined as unknown as string,
      nhsAppTemplateMessage: 'message-1',
    },
    {
      templateType: TemplateType.NHS_APP,
      // Note: We have todo this casting because Session type does not have a null typing
      nhsAppTemplateName: null as unknown as string,
      nhsAppTemplateMessage: null as unknown as string,
    },
  ])(
    'should redirect to invalid-session when session template is $templateType and name is $nhsAppTemplateName and message is $nhsAppTemplateMessage',
    async (value) => {
      getSessionMock.mockResolvedValueOnce({
        id: 'session-id',
        ...value,
      });

      await SubmitNhsAppTemplatePage({
        params: {
          sessionId: 'session-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
    }
  );
});
