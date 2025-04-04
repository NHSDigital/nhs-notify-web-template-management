/**
 * @jest-environment node
 */
import LetterTemplateSubmittedPage, {
  generateMetadata,
} from '@app/letter-template-submitted/[templateId]/page';
import content from '@content/content';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { LETTER_TEMPLATE } from '@testhelpers';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

const { pageTitle } = content.components.templateSubmitted;

jest.mock('@molecules/TemplateSubmitted/TemplateSubmitted');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('LetterTemplateSubmittedPage', () => {
  beforeEach(jest.resetAllMocks);

  test('should load page', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await LetterTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle.LETTER,
    });
    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(
      <TemplateSubmitted
        templateId={LETTER_TEMPLATE.id}
        templateName={LETTER_TEMPLATE.name}
      />
    );
  });

  test('should handle invalid template', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await LetterTemplateSubmittedPage({
      params: Promise.resolve({
        templateId: 'invalid-template',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});
