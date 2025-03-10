/**
 * @jest-environment node
 */
import EditLetterTemplatePage from '@app/edit-letter-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/LetterTemplateForm/LetterTemplateForm');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const template: LetterTemplate = {
  id: 'template-id',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: '',
    },
  },
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
};

describe('EditLetterTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-template when no template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template type is not LETTER', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...template,
      templateType: 'NHS_APP',
    });

    await EditLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateLetterTemplatePage component when template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(template);

    const letterTemplate = {
      ...template,
      subject: 'subject',
      templateType: 'LETTER' as const,
      templateStatus: 'NOT_YET_SUBMITTED' as const,
    };

    const page = await EditLetterTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(<LetterTemplateForm initialState={letterTemplate} />);
  });
});
