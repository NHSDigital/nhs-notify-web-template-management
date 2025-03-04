import {
  $FormSchema,
  previewLetterTemplateAction,
} from '@forms/PreviewLetterTemplate';
import { redirect } from 'next/navigation';
import {
  TemplateType,
  TemplateStatus,
  LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getMockFormData } from '@testhelpers';
import {
  Language,
  LetterType,
  VirusScanStatus,
} from 'nhs-notify-backend-client';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const initialState: LetterTemplate = {
  id: 'template-id',
  templateType: TemplateType.LETTER,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'template-name',
  language: Language.SQ,
  letterType: LetterType.X0,
  files: {
    pdfTemplate: {
      fileName: 'file.pdf',
      currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
      virusScanStatus: VirusScanStatus.PENDING,
    },
    testDataCsv: {
      fileName: 'test-data.csv',
      currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
      virusScanStatus: VirusScanStatus.PENDING,
    },
  },
};

describe('previewLetterTemplateAction server action', () => {
  beforeEach(jest.resetAllMocks);

  it('should return state when validation fails', async () => {
    const response = await previewLetterTemplateAction(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          previewLetterTemplateAction: ['Select an option'],
        },
      },
    });
  });

  it('should redirect to create-letter-template page when letter-edit is selected', async () => {
    await previewLetterTemplateAction(
      initialState,
      getMockFormData({
        previewLetterTemplateAction: 'letter-edit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-letter-template/template-id',
      'push'
    );
  });

  it('should redirect to submit-letter-template page when letter-submit is selected', async () => {
    await previewLetterTemplateAction(
      initialState,
      getMockFormData({
        previewLetterTemplateAction: 'letter-submit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-letter-template/template-id',
      'push'
    );
  });

  it('should throw error when preview action is unknown', async () => {
    jest.spyOn($FormSchema, 'safeParse').mockReturnValue({
      success: true,
      data: {
        previewLetterTemplateAction: 'unknown' as never,
      },
    });

    await expect(
      previewLetterTemplateAction(
        initialState,
        getMockFormData({
          previewLetterTemplateAction: 'unknown',
        })
      )
    ).rejects.toThrow('Unknown preview letter template action.');
  });
});
