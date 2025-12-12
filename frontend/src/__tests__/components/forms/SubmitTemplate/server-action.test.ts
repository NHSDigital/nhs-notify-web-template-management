/**
 * @jest-environment node
 */
import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { getMockFormData } from '@testhelpers/helpers';
import { redirect } from 'next/navigation';
import { getTemplate, setTemplateToSubmitted } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');
jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-web-template-management-utils/logger');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);
const setTemplateToSubmittedMock = jest.mocked(setTemplateToSubmitted);

const mockNhsAppTemplate = (id: string) =>
  ({
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'name',
    message: 'body',
    id,
    createdAt: '2025-01-13T10:19:25.579Z',
    updatedAt: '2025-01-13T10:19:25.579Z',
    lockNumber: 1,
  }) satisfies TemplateDto;

describe('submitTemplate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect when templateId from form is invalid', async () => {
    const formData = getMockFormData({
      templateId: 'non-uuid',
      lockNumber: '2',
    });

    await submitTemplate('NHS_APP', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  it('should redirect when lockNumber from form is invalid', async () => {
    const formData = getMockFormData({
      templateId: '7bc9fac0-ad5e-4559-b614-ad10a59295aa',
      lockNumber: 'not a number',
    });

    await submitTemplate('NHS_APP', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  it('should redirect when template is not found in the DB', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({
      templateId: '7bc9fac0-ad5e-4559-b614-ad10a59295aa',
      lockNumber: '2',
    });

    await submitTemplate('EMAIL', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when validating template', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
    } as unknown as TemplateDto);

    const formData = getMockFormData({
      templateId: 'ff32550d-6832-4837-ada0-b6dd5c09e7b8',
      lockNumber: '2',
    });

    await submitTemplate('EMAIL', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when failing to save template', async () => {
    const templateId = '32b5005c-bfbb-4435-ae59-b4d54b225eb4';

    getTemplateMock.mockResolvedValueOnce(mockNhsAppTemplate(templateId));

    setTemplateToSubmittedMock.mockImplementationOnce(() => {
      throw new Error('failed to save template');
    });

    const formData = getMockFormData({
      templateId,
      lockNumber: '2',
    });

    await expect(submitTemplate('SMS', formData)).rejects.toThrow(
      'failed to save template'
    );
  });

  it('should redirect when successfully submitted', async () => {
    const templateId = '7bc9fac0-ad5e-4559-b614-ad10a59295aa';

    const template = mockNhsAppTemplate(templateId);

    getTemplateMock.mockResolvedValueOnce(template);

    const formData = getMockFormData({
      templateId,
      lockNumber: '2',
    });

    await submitTemplate('SMS', formData);

    expect(setTemplateToSubmittedMock).toHaveBeenCalledWith(templateId, 2);

    expect(redirectMock).toHaveBeenCalledWith(
      `/text-message-template-submitted/${templateId}`,
      'push'
    );
  });
});
