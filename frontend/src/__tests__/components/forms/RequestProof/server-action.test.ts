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

const mockLetterTemplate = (id: string) =>
  ({
    templateType: 'LETTER',
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'name',
    id,
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
  }) satisfies TemplateDto;

describe('requestProof', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect when templateId from form is invalid', async () => {
    const formData = getMockFormData({ templateId: 'not-uuid' });

    await requestProof('LETTER', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  it('should redirect when template is not found in the DB', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({
      templateId: '2abc25f0-7e59-4d53-b20c-7547ef983789',
    });

    await requestProof('LETTER', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when validating template', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
    } as unknown as TemplateDto);

    const formData = getMockFormData({
      templateId: '992fe769-f8b3-43a9-84f1-6e10d0480bb6',
    });

    await requestProof('LETTER', formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should handle error when failing to save template', async () => {
    const templateId = '14216f4b-d01b-401c-8351-1356809174d9';

    getTemplateMock.mockResolvedValueOnce(mockLetterTemplate(templateId));

    requestTemplateProofMock.mockImplementationOnce(() => {
      throw new Error('failed to save template');
    });

    const formData = getMockFormData({
      templateId: '14216f4b-d01b-401c-8351-1356809174d9',
    });

    await expect(requestProof('LETTER', formData)).rejects.toThrow(
      'failed to save template'
    );
  });

  it('should redirect when successfully submitted', async () => {
    const templateId = '465eecc3-2ab8-4291-a898-ee6edcb03d33';

    getTemplateMock.mockResolvedValueOnce(mockLetterTemplate(templateId));

    const formData = getMockFormData({
      templateId,
    });

    await requestProof('LETTER', formData);

    expect(requestTemplateProofMock).toHaveBeenCalledWith(templateId);

    expect(redirectMock).toHaveBeenCalledWith(
      `/preview-letter-template/${templateId}`,
      'push'
    );
  });
});
