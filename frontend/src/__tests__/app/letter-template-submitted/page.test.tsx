/**
 * @jest-environment node
 */
import LetterTemplateSubmittedPage, {
  generateMetadata,
} from '@app/letter-template-submitted/[templateId]/page';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { PDF_LETTER_TEMPLATE } from '@testhelpers/helpers';
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
      ...PDF_LETTER_TEMPLATE,
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
      <NHSNotifyContainer>
        <TemplateSubmitted
          templateId={PDF_LETTER_TEMPLATE.id}
          templateName={PDF_LETTER_TEMPLATE.name}
        />
      </NHSNotifyContainer>
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
