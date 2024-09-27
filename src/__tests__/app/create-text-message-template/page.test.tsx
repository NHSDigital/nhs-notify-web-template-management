import CreateSmsTemplatePage from '@app/create-text-message-template/[sessionId]/page';
import { getSession } from '@utils/form-actions';
import { Session, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { CreateSmsTemplate } from '@forms/CreateSmsTemplate/CreateSmsTemplate';

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
jest.mock('@forms/CreateSmsTemplate/CreateSmsTemplate');

const getSessionMock = jest.mocked(getSession);
const redirectMock = jest.mocked(redirect);
const CreateSmsTemplateMock = jest.mocked(CreateSmsTemplate);

const initialState: Session = {
  id: 'session-id',
  templateType: TemplateType.SMS,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

describe('CreateSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-session when no session is found', async () => {
    getSessionMock.mockResolvedValueOnce();

    await CreateSmsTemplatePage({ params: { sessionId: 'session-id' } });

    expect(getSessionMock).toHaveBeenCalledWith('session-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  it('should redirect to invalid-session when sessions template type is not SMS', async () => {
    getSessionMock.mockResolvedValueOnce({
      ...initialState,
      templateType: TemplateType.NHS_APP,
    });

    await CreateSmsTemplatePage({ params: { sessionId: 'session-id' } });

    expect(getSessionMock).toHaveBeenCalledWith('session-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  it('should render CreateSmsTemplate component when session is found', async () => {
    getSessionMock.mockResolvedValueOnce(initialState);
    CreateSmsTemplateMock.mockImplementationOnce(() => <p>rendered</p>);

    const page = await CreateSmsTemplatePage({
      params: { sessionId: 'session-id' },
    });

    expect(getSessionMock).toHaveBeenCalledWith('session-id');

    expect(page).toMatchSnapshot();
  });
});
