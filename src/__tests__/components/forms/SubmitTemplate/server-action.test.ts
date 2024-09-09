import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { redirect } from 'next/navigation';
import { getSession, saveTemplate } from '@utils/form-actions';
import { TemplateType } from '@utils/types';
import { templateFromSessionMapper, validateTemplate } from '@domain/templates';

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
const templateFromSessionMapperMock = jest.mocked(templateFromSessionMapper);
const validateTemplateMock = jest.mocked(validateTemplate);

describe('submitTemplate', () => {
  beforeEach(jest.clearAllMocks);

  it('should redirect when no session is found', async () => {
    getSessionMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({});

    await submitTemplate(formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  it('should throw an error when session template type is UNKNOWN', async () => {
    getSessionMock.mockResolvedValueOnce({
      templateType: 'UNKNOWN',
      nhsAppTemplateMessage: '',
      nhsAppTemplateName: '',
      id: '1',
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate(formData)).rejects.toThrow(
      'Unknown template type'
    );
  });

  it('should handle error when mapping from session to template', async () => {
    getSessionMock.mockResolvedValueOnce({
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateMessage: '',
      nhsAppTemplateName: '',
      id: '1',
    });

    templateFromSessionMapperMock.mockImplementationOnce(() => {
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

    templateFromSessionMapperMock.mockReturnValueOnce({
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
      fields: { body: 'body' },
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

    expect(templateFromSessionMapperMock).toHaveBeenCalledWith(
      TemplateType.NHS_APP,
      session
    );
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
      fields: { body: 'body' },
    };

    getSessionMock.mockResolvedValueOnce(session);

    templateFromSessionMapperMock.mockReturnValueOnce(template);

    validateTemplateMock.mockReturnValueOnce(template);

    saveTemplateMock.mockImplementationOnce(() => {
      throw new Error('failed saving to database');
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate(formData)).rejects.toThrow(
      'failed saving to database'
    );

    expect(templateFromSessionMapperMock).toHaveBeenCalledWith(
      TemplateType.NHS_APP,
      session
    );

    expect(validateTemplateMock).toHaveBeenCalledWith(
      TemplateType.NHS_APP,
      template
    );
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
      fields: { body: 'body' },
    };

    const templateEntity = {
      id: 'templateId-1',
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
      fields: { body: 'body' },
      createdAt: 'yesterday',
      updatedAt: 'today',
    };

    getSessionMock.mockResolvedValueOnce(session);

    templateFromSessionMapperMock.mockReturnValueOnce(template);

    validateTemplateMock.mockReturnValueOnce(template);

    saveTemplateMock.mockResolvedValueOnce(templateEntity);

    const formData = getMockFormData({
      sessionId: '1',
    });

    await submitTemplate(formData);

    expect(templateFromSessionMapperMock).toHaveBeenCalledWith(
      TemplateType.NHS_APP,
      session
    );

    expect(validateTemplateMock).toHaveBeenCalledWith(
      TemplateType.NHS_APP,
      template
    );

    expect(saveTemplateMock).toHaveBeenCalledWith(template);

    expect(redirectMock).toHaveBeenCalledWith(
      '/nhs-app-template-submitted/templateId-1',
      'replace'
    );
  });
});
