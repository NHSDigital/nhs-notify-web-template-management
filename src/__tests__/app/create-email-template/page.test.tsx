import CreateEmailTemplatePage from '@app/create-email-template/[sessionId]/page';
import { getSession } from '@utils/form-actions';
import { Session, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/CreateEmailTemplate/CreateEmailTemplate');

const getSessionMock = jest.mocked(getSession);
const redirectMock = jest.mocked(redirect);

const initialState: Session = {
  id: 'session-id',
  templateType: TemplateType.EMAIL,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

describe('CreateEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-session when no session is found', async () => {
    getSessionMock.mockResolvedValueOnce(undefined);

    await CreateEmailTemplatePage({ params: { sessionId: 'session-id' } });

    expect(getSessionMock).toHaveBeenCalledWith('session-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  it('should redirect to invalid-session when sessions template type is not EMAIL', async () => {
    getSessionMock.mockResolvedValueOnce({
      ...initialState,
      templateType: TemplateType.NHS_APP,
    });

    await CreateEmailTemplatePage({ params: { sessionId: 'session-id' } });

    expect(getSessionMock).toHaveBeenCalledWith('session-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  it('should render CreateEmailTemplatePage component when session is found', async () => {
    getSessionMock.mockResolvedValueOnce(initialState);

    const page = await CreateEmailTemplatePage({
      params: { sessionId: 'session-id' },
    });

    expect(getSessionMock).toHaveBeenCalledWith('session-id');

    expect(page).toMatchSnapshot();
  });
});
