import { getMockFormData } from '@testhelpers/helpers';
import { uploadLetterTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/LetterTemplateForm/server-action';
import { UploadLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const uploadLetterTemplateMock = jest.mocked(uploadLetterTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: UploadLetterTemplate = {
  templateType: 'LETTER',
  name: 'name',
  letterType: 'x0',
  language: 'en',
  campaignId: 'campaign-id',
};

describe('UploadLetterTemplate server actions', () => {
  beforeEach(jest.resetAllMocks);

  it('upload-letter-template - should return response when no template name, letter type, language or pdf file', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'upload-letter-template' })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          letterTemplateName: ['Enter a template name'],
          letterTemplateCampaignId: ['Choose a campaign ID'],
          letterTemplateLetterType: ['Choose a letter type'],
          letterTemplateLanguage: ['Choose a language'],
          letterTemplatePdf: ['Select a letter template PDF'],
          letterTemplateCsv: ['Select a valid test data .csv file'],
        },
      },
    });
  });

  test('should create the template and redirect', async () => {
    uploadLetterTemplateMock.mockResolvedValue({
      ...initialState,
      id: 'new-template-id',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'x1',
      letterVersion: 'PDF_PROOFING',
      language: 'ar',
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: 'pdf-version',
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: 'sample.csv',
          currentVersion: 'csv-version',
          virusScanStatus: 'PASSED',
        },
      },
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
    });

    const letterTemplatePdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const letterTemplateCsv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    await processFormActions(
      initialState,
      getMockFormData({
        letterTemplateName: 'template-name',
        letterTemplateCampaignId: 'campaign-id',
        letterTemplateLetterType: 'x1',
        letterTemplateLanguage: 'ar',
        letterTemplatePdf,
        letterTemplateCsv,
      })
    );

    expect(uploadLetterTemplateMock).toHaveBeenCalledWith(
      {
        ...initialState,
        name: 'template-name',
        campaignId: 'campaign-id',
        letterType: 'x1',
        language: 'ar',
      },
      letterTemplatePdf,
      letterTemplateCsv
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-letter-template/new-template-id?from=edit',
      'push'
    );
  });

  test('should throw error on editing existing template', async () => {
    uploadLetterTemplateMock.mockResolvedValue({
      ...initialState,
      id: 'new-template-id',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'x1',
      letterVersion: 'PDF_PROOFING',
      language: 'ar',
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: 'pdf-version',
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: 'sample.csv',
          currentVersion: 'csv-version',
          virusScanStatus: 'PASSED',
        },
      },
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
    });

    const letterTemplatePdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const letterTemplateCsv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    const invalidTemplate = {
      ...initialState,
      id: 'existing-id',
    } as UploadLetterTemplate;

    await expect(
      processFormActions(
        invalidTemplate,
        getMockFormData({
          letterTemplateName: 'template-name',
          letterTemplateCampaignId: 'campaign-id',
          letterTemplateLetterType: 'x1',
          letterTemplateLanguage: 'ar',
          letterTemplatePdf,
          letterTemplateCsv,
        })
      )
    ).rejects.toThrow('Update is not available for letter templates');
  });
});
