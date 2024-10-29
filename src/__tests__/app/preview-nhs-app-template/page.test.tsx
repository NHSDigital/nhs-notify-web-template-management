import PreviewNhsAppTemplatePage from '@app/preview-nhs-app-template/[sessionId]/page';
import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate'
import { TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { getSession } from '@utils/form-actions';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate');

const redirectMock = jest.mocked(redirect);
const getSessionMock = jest.mocked(getSession);

describe('PreviewNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const state = {
      id: 'session-id',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    };

    getSessionMock.mockResolvedValueOnce(state);

    const page = await PreviewNhsAppTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(page).toEqual(<ReviewNHSAppTemplate initialState={state}/>);
  });

  it('should redirect to invalid-session when no session is found', async () => {
    await PreviewNhsAppTemplatePage({
      params: {
        sessionId: 'session-id',
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
      // Note: We have need this casting because nhsAppTemplateMessage on Session type is required
      nhsAppTemplateMessage: undefined as unknown as string,
    },
    {
      templateType: TemplateType.NHS_APP,
      // Note: We have need this casting because nhsAppTemplateName on Session type is required
      nhsAppTemplateName: undefined as unknown as string,
      nhsAppTemplateMessage: 'message-1',
    },
    {
      templateType: TemplateType.NHS_APP,
      // Note: We have need this casting because Session type does not have a null typing
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

      await PreviewNhsAppTemplatePage({
        params: {
          sessionId: 'session-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
    }
  );
});
