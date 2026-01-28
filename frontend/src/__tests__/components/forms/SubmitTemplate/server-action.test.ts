/**
 * @jest-environment node
 */
import { submitTemplate } from '@forms/SubmitTemplate/server-action';
import { getMockFormData } from '@testhelpers/helpers';
import { redirect } from 'next/navigation';
import { getTemplate, setTemplateToSubmitted } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';

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

    await submitTemplate({ channel: 'NHS_APP' }, formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  it('should redirect when lockNumber from form is invalid', async () => {
    const formData = getMockFormData({
      templateId: '7bc9fac0-ad5e-4559-b614-ad10a59295aa',
      lockNumber: 'not a number',
    });

    await submitTemplate({ channel: 'NHS_APP' }, formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  it('should redirect when template is not found in the DB', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    const formData = getMockFormData({
      templateId: '7bc9fac0-ad5e-4559-b614-ad10a59295aa',
      lockNumber: '2',
    });

    await submitTemplate({ channel: 'EMAIL' }, formData);

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

    await submitTemplate({ channel: 'EMAIL' }, formData);

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

    await expect(submitTemplate({ channel: 'SMS' }, formData)).rejects.toThrow(
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

    await submitTemplate({ channel: 'SMS' }, formData);

    expect(setTemplateToSubmittedMock).toHaveBeenCalledWith(templateId, 2);

    expect(redirectMock).toHaveBeenCalledWith(
      `/text-message-template-submitted/${templateId}`,
      'push'
    );
  });

  it('when channel is LETTER and routing is enabled, should redirect to message-templates', async () => {
    const templateId = '0C63C6B0-C2C7-4D74-A81B-291C1A7BF994';

    const template: LetterTemplate = {
      createdAt: '2025-01-13T10:19:25.579Z',
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: 'saoj867b789',
          virusScanStatus: 'PASSED',
        },
        proofs: {
          proofid: {
            fileName: 'proof1.png',
            virusScanStatus: 'PASSED',
            supplier: 'MBA',
          },
        },
      },
      id: templateId,
      language: 'en',
      letterType: 'x0',
      name: 'template-name',
      templateStatus: 'NOT_YET_SUBMITTED',
      templateType: 'LETTER',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
    };

    getTemplateMock.mockResolvedValueOnce(template);

    const formData = getMockFormData({
      templateId,
      lockNumber: '2',
    });

    await submitTemplate({ channel: 'LETTER', routingEnabled: true }, formData);

    expect(setTemplateToSubmittedMock).toHaveBeenCalledWith(templateId, 2);

    expect(redirectMock).toHaveBeenCalledWith(`/message-templates`, 'push');
  });
});
