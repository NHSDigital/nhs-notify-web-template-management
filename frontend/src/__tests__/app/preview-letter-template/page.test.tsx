/**
 * @jest-environment node
 */
import PreviewLetterTemplatePage from '@app/preview-letter-template/[templateId]/page';
import { ReviewLetterTemplate } from '@forms/ReviewLetterTemplate/ReviewLetterTemplate';
import {
  type LetterTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { Language, LetterType, TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewLetterTemplate/ReviewLetterTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

const templateDTO = {
  id: 'template-id',
  templateType: TemplateType.LETTER,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'template-name',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  letterType: LetterType.STANDARD,
  language: Language.EN,
  pdfTemplateInputFile: 'template.pdf',
  testPersonalisationInputFile: 'test-data.csv',
} satisfies TemplateDTO;

const letterTemplate: LetterTemplate = {
  ...templateDTO,
  templateType: TemplateType.LETTER,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
};

describe('PreviewLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should load page', async () => {
    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(
      <ReviewLetterTemplate initialState={letterTemplate} />
    );
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      description: 'an email',
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      message: 'template-message',
    },
    {
      description: 'an SMS',
      templateType: TemplateType.SMS,
      name: 'template-name',
      message: 'template-message',
    },
    {
      description: 'an app message',
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: 'template-message',
    },
    {
      description: 'a letter lacking language',
      language: undefined as unknown as Language,
    },
    {
      description: 'a letter lacking a name',
      name: undefined as unknown as string,
    },
    {
      description: 'a letter lacking letterType',
      letterType: undefined as unknown as LetterType,
    },
    {
      description: 'a letter lacking pdfTemplateInputFile',
      pdfTemplateInputFile: undefined as unknown as string,
    },
    {
      description:
        'a letter where testPersonalisationInputFile is the wrong data type',
      testPersonalisationInputFile: 9 as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $description',
    async ({ description: _, ...value }) => {
      getTemplateMock.mockResolvedValueOnce({
        ...templateDTO,
        ...value,
      });

      await PreviewLetterTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
