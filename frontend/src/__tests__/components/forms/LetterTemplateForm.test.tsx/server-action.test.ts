import { getMockFormData } from '@testhelpers';
import { createLetterTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/LetterTemplateForm/server-action';
import { CreateLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const createLetterTemplateMock = jest.mocked(createLetterTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: CreateLetterTemplate = {
  templateType: 'LETTER',
  name: 'name',
  letterType: 'x0',
  language: 'en',
};

describe('CreateLetterTemplate server actions', () => {
  beforeEach(jest.resetAllMocks);

  it('create-letter-template - should return response when no template name, letter type, language or pdf file', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'create-letter-template' })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          letterTemplateName: ['Enter a template name'],
          letterTemplateLetterType: ['Choose a letter type'],
          letterTemplateLanguage: ['Choose a language'],
          letterTemplatePdf: ['Select a letter template PDF'],
          letterTemplateCsv: ['Select a valid test data .csv file'],
        },
      },
    });
  });

  test('should create the template and redirect', async () => {
    createLetterTemplateMock.mockResolvedValue({
      ...initialState,
      id: 'new-template-id',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'x1',
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
        letterTemplateLetterType: 'x1',
        letterTemplateLanguage: 'ar',
        letterTemplatePdf,
        letterTemplateCsv,
      })
    );

    expect(createLetterTemplateMock).toHaveBeenCalledWith(
      {
        ...initialState,
        name: 'template-name',
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
    createLetterTemplateMock.mockResolvedValue({
      ...initialState,
      id: 'new-template-id',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'x1',
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
    });

    const letterTemplatePdf = new File(['file contents'], 'template.pdf', {
      type: 'application/pdf',
    });
    const letterTemplateCsv = new File(['file contents'], 'sample.csv', {
      type: 'text/csv',
    });

    await expect(
      processFormActions(
        { ...initialState, id: 'existing-id' },
        getMockFormData({
          letterTemplateName: 'template-name',
          letterTemplateLetterType: 'x1',
          letterTemplateLanguage: 'ar',
          letterTemplatePdf,
          letterTemplateCsv,
        })
      )
    ).rejects.toThrow('Update is not available for letter templates');
  });
});
