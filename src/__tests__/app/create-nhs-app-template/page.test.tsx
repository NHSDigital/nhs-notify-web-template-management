import { redirect } from 'next/navigation';
import { TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import CreateNhsAppTemplatePage from '@app/create-nhs-app-template/[sessionId]/page';

jest.mock('@forms/CreateNhsAppTemplate/CreateNhsAppTemplate');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getSessionMock = jest.mocked(getSession);
const redirectMock = jest.mocked(redirect);

describe('CreateNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('page loads', async () => {
    const state = {
      id: 'session-id',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    };

    getSessionMock.mockResolvedValueOnce(state);

    const page = await CreateNhsAppTemplatePage({
      params: { sessionId: 'session-id' },
    });

    expect(page).toEqual(<CreateNhsAppTemplate initialState={state} />);
  });

  test('should render invalid session, when session is not found', async () => {
    getSessionMock.mockResolvedValueOnce(undefined);

    await CreateNhsAppTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  test.each([
    TemplateType.EMAIL,
    TemplateType.SMS,
    TemplateType.LETTER,
    'UNKNOWN',
  ])(
    'should render invalid session, when session template type is %p',
    async (templateType) => {
      getSessionMock.mockResolvedValueOnce({
        id: 'session-id',
        templateType: templateType as TemplateType,
        nhsAppTemplateName: '',
        nhsAppTemplateMessage: '',
      });

      await CreateNhsAppTemplatePage({
        params: {
          sessionId: 'session-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
    }
  );
});
