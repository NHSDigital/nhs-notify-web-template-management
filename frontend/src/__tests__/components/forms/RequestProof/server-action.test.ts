/**
 * @jest-environment node
 */
import { requestProof } from '@forms/RequestProof/server-action';
import { getMockFormData } from '@testhelpers';
import { redirect } from 'next/navigation';
import { getTemplate, requestTemplateProof } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');
jest.mock('@utils/amplify-utils');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);
const requestTemplateProofMock = jest.mocked(requestTemplateProof);

const mockLetterTemplate = {
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  id: '1',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      currentVersion: 'a',
      virusScanStatus: 'PASSED',
      fileName: 'a.pdf',
    },
  },
} satisfies TemplateDto;

describe('requestProof', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect when templateId from form is invalid', async () => {
    const formData = getMockFormData({});

    await requestProof('preview-letter-template', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  it('should redirect when template is not found in the DB', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({ templateId: '1' });

    await requestProof('preview-letter-template', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when validating template', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
    } as unknown as TemplateDto);

    const formData = getMockFormData({ templateId: '1' });

    await requestProof('preview-letter-template', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when failing to save template', async () => {
    getTemplateMock.mockResolvedValueOnce(mockLetterTemplate);

    requestTemplateProofMock.mockImplementationOnce(() => {
      throw new Error('failed to save template');
    });

    const formData = getMockFormData({
      templateId: '1',
    });

    await expect(
      requestProof('preview-letter-template', formData)
    ).rejects.toThrow('failed to save template');
  });

  it('should redirect when successfully submitted', async () => {
    getTemplateMock.mockResolvedValueOnce(mockLetterTemplate);

    const formData = getMockFormData({
      templateId: '1',
    });

    await requestProof('preview-letter-template', formData);

    expect(requestTemplateProofMock).toHaveBeenCalledWith('1');

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-letter-template/1',
      'push'
    );
  });
});
