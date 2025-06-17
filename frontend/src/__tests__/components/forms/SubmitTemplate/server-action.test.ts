/**
 * @jest-environment node
 */
import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { redirect } from 'next/navigation';
import { getTemplate, setTemplateToSubmitted } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');
jest.mock('@utils/amplify-utils');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);
const setTemplateToSubmittedMock = jest.mocked(setTemplateToSubmitted);

const mockNhsAppTemplate = {
  templateType: 'NHS_APP',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  clientId: 'client1',
  userId: 'user1',
  message: 'body',
  id: '1',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
} satisfies TemplateDto;

describe('submitTemplate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect when templateId from form is invalid', async () => {
    const formData = getMockFormData({});

    await submitTemplate('NHS_APP', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  it('should redirect when template is not found in the DB', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({ templateId: '1' });

    await submitTemplate('EMAIL', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when validating template', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
    } as unknown as TemplateDto);

    const formData = getMockFormData({ templateId: '1' });

    await submitTemplate('EMAIL', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when failing to save template', async () => {
    getTemplateMock.mockResolvedValueOnce(mockNhsAppTemplate);

    setTemplateToSubmittedMock.mockImplementationOnce(() => {
      throw new Error('failed to save template');
    });

    const formData = getMockFormData({
      templateId: '1',
    });

    await expect(submitTemplate('SMS', formData)).rejects.toThrow(
      'failed to save template'
    );
  });

  it('should redirect when successfully submitted', async () => {
    getTemplateMock.mockResolvedValueOnce(mockNhsAppTemplate);

    const formData = getMockFormData({
      templateId: '1',
    });

    await submitTemplate('SMS', formData);

    expect(setTemplateToSubmittedMock).toHaveBeenCalledWith('1');

    expect(redirectMock).toHaveBeenCalledWith(
      '/text-message-template-submitted/1',
      'push'
    );
  });
});
