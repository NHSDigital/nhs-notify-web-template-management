/**
 * @jest-environment node
 */
import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import { redirect } from 'next/navigation';
import { getTemplate, saveTemplate } from '@utils/form-actions';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');
jest.mock('@utils/amplify-utils');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);
const saveTemplateMock = jest.mocked(saveTemplate);

const mockNhsAppTemplate = {
  templateType: 'NHS_APP',
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  message: 'body',
  id: '1',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
} satisfies TemplateDTO;

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
    } as unknown as TemplateDTO);

    const formData = getMockFormData({ templateId: '1' });

    await submitTemplate('submit-route', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when failing to save template', async () => {
    getTemplateMock.mockResolvedValueOnce(mockNhsAppTemplate);

    saveTemplateMock.mockImplementationOnce(() => {
      throw new Error('failed to save template');
    });

    const formData = getMockFormData({
      templateId: '1',
    });

    await expect(submitTemplate('submit-route', formData)).rejects.toThrow(
      'failed to save template'
    );
  });

  it('should redirect when successfully submitted', async () => {
    getTemplateMock.mockResolvedValueOnce(mockNhsAppTemplate);

    const formData = getMockFormData({
      templateId: '1',
    });

    await submitTemplate('submit-route', formData);

    expect(saveTemplateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: '2025-01-13T10:19:25.579Z',
        id: '1',
        message: 'body',
        name: 'name',
        templateStatus: 'SUBMITTED',
        templateType: 'NHS_APP',
        updatedAt: '2025-01-13T10:19:25.579Z',
      })
    );
    expect(redirectMock).toHaveBeenCalledWith('/submit-route/1', 'push');
  });
});
