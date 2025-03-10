import { getMockFormData } from '@testhelpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { LetterTemplateWithFiles } from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/LetterTemplateForm/server-action';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const saveTemplateMock = jest.mocked(saveTemplate);
const createTemplateMock = jest.mocked(createTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: LetterTemplateWithFiles = {
  id: 'template-id',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  letterType: 'x0',
  language: 'en',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
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
          letterTemplateSubjectLine: ['Choose a letter type'],
          letterTemplateMessage: ['Choose a language'],
        },
      },
    });
  });

  test('should save the template and redirect', async () => {
    saveTemplateMock.mockResolvedValue({
      ...initialState,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    });

    await processFormActions(
      initialState,
      getMockFormData({
        letterTemplateName: 'template-name',
        letterTemplateSubjectLine: 'template-subject-line',
        letterTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).toHaveBeenCalledWith({
      ...initialState,
      name: 'template-name',
      subject: 'template-subject-line',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-letter-template/template-id?from=edit',
      'push'
    );
  });

  test('should create the template and redirect', async () => {
    const { id: _1, templateStatus: _2, ...createState } = initialState; // eslint-disable-line sonarjs/no-unused-vars

    createTemplateMock.mockResolvedValue({
      ...createState,
      id: 'new-template-id',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      letterType: 'q1',
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

    await processFormActions(
      createState,
      getMockFormData({
        letterTemplateName: 'template-name',
        letterTemplateLetterType: 'q1',
        letterTemplateLanguage: 'ar',
        letterTemplatePdf: new File([], 'template.pdf'),
        letterTemplateCsv: new File([], 'sample.csv'),
      })
    );

    expect(createTemplateMock).toHaveBeenCalledWith({
      ...createState,
      name: 'template-name',
      letterType: 'q1',
      language: 'ar',
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
        },
        testDataCsv: {
          fileName: 'sample.csv',
        },
      },
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-letter-template/new-template-id?from=edit',
      'push'
    );
  });
});
