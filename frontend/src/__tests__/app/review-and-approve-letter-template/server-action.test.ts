/**
 * @jest-environment node
 */
import { reviewAndApproveLetterTemplateAction } from '@app/review-and-approve-letter-template/[templateId]/server-action';
import { redirect } from 'next/navigation';
import { approveTemplate } from '@utils/form-actions';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');

const redirectMock = jest.mocked(redirect);
const approveTemplateMock = jest.mocked(approveTemplate);

const validTemplateId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('reviewAndApproveLetterTemplateAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call approveTemplate and redirect on valid form data', async () => {
    approveTemplateMock.mockResolvedValueOnce({
      id: validTemplateId,
      clientId: 'client',
      name: 'name',
      templateStatus: 'PROOF_APPROVED',
      templateType: 'LETTER',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      lockNumber: 2,
      language: 'en',
      letterType: 'x0',
      letterVersion: 'AUTHORING',
      files: {
        docxTemplate: {
          fileName: 'template.docx',
          currentVersion: 'v1',
          virusScanStatus: 'PASSED',
        },
        initialRender: {
          status: 'RENDERED',
          fileName: 'render.pdf',
          currentVersion: 'v1',
          pageCount: 2,
        },
      },
    });

    const formData = new FormData();
    formData.append('templateId', validTemplateId);
    formData.append('lockNumber', '1');

    await reviewAndApproveLetterTemplateAction({}, formData);

    expect(approveTemplateMock).toHaveBeenCalledWith(validTemplateId, 1);
    expect(redirectMock).toHaveBeenCalledWith(
      `/letter-template-approved/${validTemplateId}`
    );
  });

  it('should return error state when templateId is missing', async () => {
    const formData = new FormData();
    formData.append('lockNumber', '1');

    const result = await reviewAndApproveLetterTemplateAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(approveTemplateMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is missing', async () => {
    const formData = new FormData();
    formData.append('templateId', validTemplateId);

    const result = await reviewAndApproveLetterTemplateAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(approveTemplateMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is invalid', async () => {
    const formData = new FormData();
    formData.append('templateId', validTemplateId);
    formData.append('lockNumber', 'not-a-number');

    const result = await reviewAndApproveLetterTemplateAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(approveTemplateMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when templateId is empty', async () => {
    const formData = new FormData();
    formData.append('templateId', '');
    formData.append('lockNumber', '1');

    const result = await reviewAndApproveLetterTemplateAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(approveTemplateMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when templateId is not a valid UUID', async () => {
    const formData = new FormData();
    formData.append('templateId', 'not-a-uuid');
    formData.append('lockNumber', '1');

    const result = await reviewAndApproveLetterTemplateAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(approveTemplateMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
