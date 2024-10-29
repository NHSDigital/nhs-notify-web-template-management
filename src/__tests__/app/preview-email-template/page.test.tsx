import PreviewEmailTemplatePage from '@app/preview-email-template/[sessionId]/page';
import { ReviewEmailTemplate } from '@forms/ReviewEmailTemplate';
import { TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { getSession } from '@utils/form-actions';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewEmailTemplate');

const redirectMock = jest.mocked(redirect);
const getSessionMock = jest.mocked(getSession);

describe('PreviewEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const state = {
      id: 'session-id',
      templateType: TemplateType.EMAIL,
      emailTemplateName: 'template-name',
      emailTemplateSubjectLine: 'template-subject-line',
      emailTemplateMessage: 'template-message',
      nhsAppTemplateMessage: '',
      nhsAppTemplateName: '',
    };

    getSessionMock.mockResolvedValueOnce(state);

    const page = await PreviewEmailTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(page).toEqual(<ReviewEmailTemplate initialState={state}/>);
  });

  it('should redirect to invalid-session when no session is found', async () => {
    await PreviewEmailTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.LETTER,
      emailTemplateName: 'valid-name',
      emailTemplateSubjectLine: 'valid-subject-line',
      emailTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.SMS,
      emailTemplateName: 'valid-name',
      emailTemplateSubjectLine: 'valid-subject-line',
      emailTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.NHS_APP,
      emailTemplateName: 'valid-name',
      emailTemplateSubjectLine: 'valid-subject-line',
      emailTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.EMAIL,
      emailTemplateName: undefined,
      emailTemplateSubjectLine: 'valid-subject-line',
      emailTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.EMAIL,
      emailTemplateName: 'valid-name',
      emailTemplateSubjectLine: undefined,
      emailTemplateMessage: 'valid-message',
    },
    {
      templateType: TemplateType.EMAIL,
      emailTemplateName: 'valid-name',
      emailTemplateSubjectLine: 'valid-subject-line',
      emailTemplateMessage: undefined,
    },
    {
      templateType: TemplateType.EMAIL,
      emailTemplateName: 'valid-name',
      emailTemplateSubjectLine: 'valid-subject-line',
      emailTemplateMessage: null as unknown as string,
    },
  ])(
    'should redirect to invalid-session when session template is $templateType and name is $emailTemplateName and subjectLine is $$emailTemplateSubjectLine and message is $emailTemplateMessage',
    async (value) => {
      getSessionMock.mockResolvedValueOnce({
        id: 'session-id',
        nhsAppTemplateMessage: '',
        nhsAppTemplateName: '',
        ...value,
      });

      await PreviewEmailTemplatePage({
        params: {
          sessionId: 'session-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
    }
  );
});
