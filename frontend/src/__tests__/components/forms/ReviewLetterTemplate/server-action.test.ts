import {
  $FormSchema,
  reviewLetterTemplateAction,
} from '@forms/ReviewLetterTemplate';
import { redirect } from 'next/navigation';
import {
  TemplateType,
  TemplateStatus,
  LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getMockFormData } from '@testhelpers';
import { Language, LetterType } from 'nhs-notify-backend-client';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const initialState: LetterTemplate = {
  id: 'template-id',
  templateType: TemplateType.LETTER,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'template-name',
  language: Language.ALBANIAN,
  letterType: LetterType.STANDARD,
  pdfTemplateInputFile: 'file.pdf',
  testPersonalisationInputFile: 'test-data.csv',
};

describe('reviewLetterTemplateAction server action', () => {
  beforeEach(jest.resetAllMocks);

  it('should return state when validation fails', async () => {
    const response = await reviewLetterTemplateAction(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          reviewLetterTemplateAction: ['Select an option'],
        },
      },
    });
  });

  it('should redirect to create-letter-template page when letter-edit is selected', async () => {
    await reviewLetterTemplateAction(
      initialState,
      getMockFormData({
        reviewLetterTemplateAction: 'letter-edit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-letter-template/template-id',
      'push'
    );
  });

  it('should redirect to submit-letter-template page when letter-submit is selected', async () => {
    await reviewLetterTemplateAction(
      initialState,
      getMockFormData({
        reviewLetterTemplateAction: 'letter-submit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-letter-template/template-id',
      'push'
    );
  });

  it('should throw error when review action is unknown', async () => {
    jest.spyOn($FormSchema, 'safeParse').mockReturnValue({
      success: true,
      data: {
        reviewLetterTemplateAction: 'unknown' as never,
      },
    });

    await expect(
      reviewLetterTemplateAction(
        initialState,
        getMockFormData({
          reviewLetterTemplateAction: 'unknown',
        })
      )
    ).rejects.toThrow('Unknown review letter template action.');
  });
});
