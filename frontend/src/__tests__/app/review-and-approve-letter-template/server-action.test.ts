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

describe('reviewAndApproveLetterTemplateAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call approveTemplate and redirect on valid form data', async () => {
    approveTemplateMock.mockResolvedValueOnce({
      id: 'template-123',
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
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '1');

    await reviewAndApproveLetterTemplateAction({}, formData);

    expect(approveTemplateMock).toHaveBeenCalledWith('template-123', 1);
    expect(redirectMock).toHaveBeenCalledWith(
      '/letter-template-approved/template-123'
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
    formData.append('templateId', 'template-123');

    const result = await reviewAndApproveLetterTemplateAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(approveTemplateMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is invalid', async () => {
    const formData = new FormData();
    formData.append('templateId', 'template-123');
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
});
