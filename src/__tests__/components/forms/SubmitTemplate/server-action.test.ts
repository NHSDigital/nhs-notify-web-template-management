import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { redirect } from 'next/navigation';
import { getTemplate, saveTemplate, sendEmail } from '@utils/form-actions';
import { Template } from '@utils/types';
import { TemplateType } from '@utils/enum';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');
jest.mock('@utils/logger');
jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => {},
}));

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);
const saveTemplateMock = jest.mocked(saveTemplate);
const sendEmailMock = jest.mocked(sendEmail);

const mockNhsAppTemplate = {
  templateType: TemplateType.NHS_APP,
  version: 1,
  NHS_APP: {
    name: 'name',
    message: 'body',
  },
  id: '1',
};

describe('submitTemplate', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect when templateId from form is invalid', async () => {
    const formData = getMockFormData({});

    await submitTemplate('submit-route', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  it('should redirect when template is not found in the DB', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({ templateId: '1' });

    await submitTemplate('submit-route', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when validating template', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
    } as unknown as Template);

    const formData = getMockFormData({ templateId: '1' });

    await submitTemplate('submit-route', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when failing to send email', async () => {
    getTemplateMock.mockResolvedValueOnce(mockNhsAppTemplate);

    saveTemplateMock.mockResolvedValueOnce(mockNhsAppTemplate);

    sendEmailMock.mockImplementationOnce(() => {
      throw new Error('failed to send email');
    });

    const formData = getMockFormData({
      templateId: '1',
    });

    await expect(submitTemplate('submit-route', formData)).rejects.toThrow(
      'failed to send email'
    );
  });

  it('should redirect when successfully sent email', async () => {
    getTemplateMock.mockResolvedValueOnce(mockNhsAppTemplate);

    const formData = getMockFormData({
      templateId: '1',
    });

    await submitTemplate('submit-route', formData);

    expect(sendEmailMock).toHaveBeenCalledWith(
      mockNhsAppTemplate.id,
      mockNhsAppTemplate.NHS_APP.name,
      mockNhsAppTemplate.NHS_APP.message,
      null
    );

    expect(redirectMock).toHaveBeenCalledWith('/submit-route/1', 'push');
  });

  it('should send an email with the subject line when template type is EMAIL', async () => {
    const mockEmailTemplate = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.EMAIL,
      EMAIL: {
        name: 'name',
        subject: 'subjectLine',
        message: 'body',
      },
    };

    getTemplateMock.mockResolvedValueOnce(mockEmailTemplate);

    const formData = getMockFormData({
      templateId: 'template-id',
    });

    await submitTemplate('submit-route', formData);

    expect(sendEmailMock).toHaveBeenCalledWith(
      mockEmailTemplate.id,
      mockEmailTemplate.EMAIL.name,
      mockEmailTemplate.EMAIL.message,
      mockEmailTemplate.EMAIL.subject
    );
  });
});
