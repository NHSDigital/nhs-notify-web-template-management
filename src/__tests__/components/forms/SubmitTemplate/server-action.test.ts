import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { redirect } from 'next/navigation';
import { getSession, saveTemplate } from '@utils/form-actions';
import { TemplateType } from '@utils/types';
import { createTemplateFromSession, validateTemplate } from '@domain/templates';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');
jest.mock('@domain/templates');
jest.mock('@utils/logger');
jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => {},
}));

const redirectMock = jest.mocked(redirect);
const getSessionMock = jest.mocked(getSession);
const saveTemplateMock = jest.mocked(saveTemplate);
const createTemplateFromSessionMock = jest.mocked(createTemplateFromSession);
const validateTemplateMock = jest.mocked(validateTemplate);

describe('submitTemplate', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect when sessionId from form is invalid', async () => {
    const formData = getMockFormData({});

    await submitTemplate(formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');

    expect(getSessionMock).not.toHaveBeenCalled();
  });

  it('should redirect when session is not found in the DB', async () => {
    getSessionMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({ sessionId: '1' });

    await submitTemplate(formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  it('should handle error when mapping from session to template', async () => {
    getSessionMock.mockResolvedValueOnce({
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateMessage: '',
      nhsAppTemplateName: '',
      id: '1',
    });

    createTemplateFromSessionMock.mockImplementationOnce(() => {
      throw new Error('unable to map session to template');
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate(formData)).rejects.toThrow(
      'unable to map session to template'
    );
  });

  it('should handle error when validating template', async () => {
    const session = {
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateMessage: 'body',
      nhsAppTemplateName: 'name',
      id: '1',
    };

    getSessionMock.mockResolvedValueOnce(session);

    createTemplateFromSessionMock.mockReturnValueOnce({
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
      fields: { content: 'body' },
    });

    validateTemplateMock.mockImplementationOnce(() => {
      throw new Error('unable to to validate template');
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate(formData)).rejects.toThrow(
      'unable to to validate template'
    );

    expect(createTemplateFromSessionMock).toHaveBeenCalledWith(session);
  });

  it('should handle error when saving template', async () => {
    const session = {
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateMessage: 'body',
      nhsAppTemplateName: 'name',
      id: '1',
    };

    const template = {
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
      fields: { content: 'body' },
    };

    getSessionMock.mockResolvedValueOnce(session);

    createTemplateFromSessionMock.mockReturnValueOnce(template);

    validateTemplateMock.mockReturnValueOnce({
      ...template,
      type: 'NHS_APP',
    });

    saveTemplateMock.mockImplementationOnce(() => {
      throw new Error('failed saving to database');
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate(formData)).rejects.toThrow(
      'failed saving to database'
    );

    expect(createTemplateFromSessionMock).toHaveBeenCalledWith(session);

    expect(validateTemplateMock).toHaveBeenCalledWith(template);
  });

  it('should redirect when successfully saved template', async () => {
    const session = {
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateMessage: 'body',
      nhsAppTemplateName: 'name',
      id: '1',
    };

    const template = {
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
      fields: { content: 'body' },
    };

    const templateEntity = {
      id: 'templateId-1',
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
      fields: { content: 'body' },
      createdAt: 'yesterday',
      updatedAt: 'today',
    };

    getSessionMock.mockResolvedValueOnce(session);

    createTemplateFromSessionMock.mockReturnValueOnce(template);

    validateTemplateMock.mockReturnValueOnce({
      ...template,
      type: 'NHS_APP',
    });

    saveTemplateMock.mockResolvedValueOnce(templateEntity);

    const formData = getMockFormData({
      sessionId: '1',
    });

    await submitTemplate(formData);

    expect(createTemplateFromSessionMock).toHaveBeenCalledWith(session);

    expect(validateTemplateMock).toHaveBeenCalledWith(template);

    expect(saveTemplateMock).toHaveBeenCalledWith(template);

    expect(redirectMock).toHaveBeenCalledWith(
      '/nhs-app-template-submitted/templateId-1',
      'push'
    );
  });
});
