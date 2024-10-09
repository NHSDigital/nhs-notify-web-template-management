import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { redirect } from 'next/navigation';
import {
  getSession,
  saveTemplate,
  sendEmail,
  deleteSession,
} from '@utils/form-actions';
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
const sendEmailMock = jest.mocked(sendEmail);
const deleteSessionMock = jest.mocked(deleteSession);

const mockNhsAppSession = {
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateMessage: 'body',
  nhsAppTemplateName: 'name',
  id: '1',
};

const mockNhsAppTemplate = {
  name: 'name',
  type: TemplateType.NHS_APP,
  version: 1,
  fields: { content: 'body' },
};

const mockNhsAppTemplateEntity = {
  id: 'templateId-1',
  name: 'name',
  type: TemplateType.NHS_APP,
  version: 1,
  fields: { content: 'body' },
  createdAt: 'yesterday',
  updatedAt: 'today',
};

describe('submitTemplate', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect when sessionId from form is invalid', async () => {
    const formData = getMockFormData({});

    await submitTemplate('submit-route', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');

    expect(getSessionMock).not.toHaveBeenCalled();
  });

  it('should redirect when session is not found in the DB', async () => {
    getSessionMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({ sessionId: '1' });

    await submitTemplate('submit-route', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-session', 'replace');
  });

  it('should handle error when mapping from session to template', async () => {
    getSessionMock.mockResolvedValueOnce(mockNhsAppSession);

    createTemplateFromSessionMock.mockImplementationOnce(() => {
      throw new Error('unable to map session to template');
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate('submit-route', formData)).rejects.toThrow(
      'unable to map session to template'
    );
  });

  it('should handle error when validating template', async () => {
    getSessionMock.mockResolvedValueOnce(mockNhsAppSession);

    createTemplateFromSessionMock.mockReturnValueOnce(mockNhsAppTemplate);

    validateTemplateMock.mockImplementationOnce(() => {
      throw new Error('unable to to validate template');
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate('submit-route', formData)).rejects.toThrow(
      'unable to to validate template'
    );

    expect(createTemplateFromSessionMock).toHaveBeenCalledWith(
      mockNhsAppSession
    );
  });

  it('should handle error when saving template', async () => {
    getSessionMock.mockResolvedValueOnce(mockNhsAppSession);

    createTemplateFromSessionMock.mockReturnValueOnce(mockNhsAppTemplate);

    validateTemplateMock.mockReturnValueOnce(mockNhsAppTemplate);

    saveTemplateMock.mockImplementationOnce(() => {
      throw new Error('failed saving to database');
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate('submit-route', formData)).rejects.toThrow(
      'failed saving to database'
    );

    expect(createTemplateFromSessionMock).toHaveBeenCalledWith(
      mockNhsAppSession
    );

    expect(validateTemplateMock).toHaveBeenCalledWith(mockNhsAppTemplate);
  });

  it('should handle error when failing to send email', async () => {
    getSessionMock.mockResolvedValueOnce(mockNhsAppSession);

    createTemplateFromSessionMock.mockReturnValueOnce(mockNhsAppTemplate);

    validateTemplateMock.mockReturnValueOnce(mockNhsAppTemplate);

    saveTemplateMock.mockResolvedValueOnce({
      ...mockNhsAppTemplate,
      id: '1',
    });

    sendEmailMock.mockImplementationOnce(() => {
      throw new Error('failed to send email');
    });

    const formData = getMockFormData({
      sessionId: '1',
    });

    await expect(submitTemplate('submit-route', formData)).rejects.toThrow(
      'failed to send email'
    );

    expect(createTemplateFromSessionMock).toHaveBeenCalledWith(
      mockNhsAppSession
    );

    expect(validateTemplateMock).toHaveBeenCalledWith(mockNhsAppTemplate);
  });

  it('should redirect when successfully saved template, sent email and deleted session', async () => {
    getSessionMock.mockResolvedValueOnce(mockNhsAppSession);

    createTemplateFromSessionMock.mockReturnValueOnce(mockNhsAppTemplate);

    validateTemplateMock.mockReturnValueOnce({
      ...mockNhsAppTemplate,
      type: 'NHS_APP',
    });

    saveTemplateMock.mockResolvedValueOnce(mockNhsAppTemplateEntity);

    const formData = getMockFormData({
      sessionId: '1',
    });

    await submitTemplate('submit-route', formData);

    expect(createTemplateFromSessionMock).toHaveBeenCalledWith(
      mockNhsAppSession
    );

    expect(validateTemplateMock).toHaveBeenCalledWith(mockNhsAppTemplate);

    expect(saveTemplateMock).toHaveBeenCalledWith(mockNhsAppTemplate);

    expect(sendEmailMock).toHaveBeenCalledWith(
      mockNhsAppTemplateEntity.id,
      mockNhsAppTemplateEntity.name,
      mockNhsAppTemplateEntity.fields.content,
      undefined
    );

    expect(deleteSessionMock).toHaveBeenCalledWith(mockNhsAppSession.id);

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-route/templateId-1',
      'push'
    );
  });

  it('should send an email with the subject line when template type is EMAIL', async () => {
    const mockEmailSession = {
      ...mockNhsAppSession,
      templateType: TemplateType.EMAIL,
      emailTemplateMessage: 'body',
      emailTemplateName: 'name',
      emailTemplateSubjectLine: 'subjectLine',
    };

    const mockEmailTemplate = {
      ...mockNhsAppTemplate,
      type: TemplateType.EMAIL,
      fields: {
        ...mockNhsAppTemplate.fields,
        subjectLine: 'subjectLine',
      },
    };

    const mockEmailTemplateEntity = {
      ...mockNhsAppTemplateEntity,
      type: TemplateType.EMAIL,
      fields: {
        ...mockNhsAppTemplateEntity.fields,
        subjectLine: 'subjectLine',
      },
    };

    getSessionMock.mockResolvedValueOnce(mockEmailSession);

    createTemplateFromSessionMock.mockReturnValueOnce(mockEmailTemplate);

    validateTemplateMock.mockReturnValueOnce({
      ...mockEmailTemplate,
      type: 'EMAIL',
    });

    saveTemplateMock.mockResolvedValueOnce(mockEmailTemplateEntity);

    const formData = getMockFormData({
      sessionId: '1',
    });

    await submitTemplate('submit-route', formData);

    expect(sendEmailMock).toHaveBeenCalledWith(
      mockEmailTemplateEntity.id,
      mockEmailTemplateEntity.name,
      mockEmailTemplateEntity.fields.content,
      mockEmailTemplateEntity.fields.subjectLine
    );
  });
});
