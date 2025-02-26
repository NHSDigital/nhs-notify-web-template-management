import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ManageTemplatesPage from '@app/manage-templates/page';
import content from '@content/content';
import { getTemplates } from '@utils/form-actions';
import {
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { Language, LetterType, TemplateDTO } from 'nhs-notify-backend-client';

const manageTemplatesContent = content.pages.manageTemplates;

const mockTemplates: TemplateDTO[] = [
  {
    id: '1',
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'Template 1',
    message: 'Message',
    subject: 'Subject Line',
    createdAt: '2025-01-13T10:19:25.579Z',
    updatedAt: '2025-01-13T10:19:25.579Z',
  },
];

jest.mock('@utils/form-actions');

const OLD_ENV = { ...process.env };

describe('ManageTemplatesPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_LETTERS = 'true';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('renders the page without templates', async () => {
    render(await ManageTemplatesPage());

    expect(screen.getByTestId('page-content-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('page-heading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'href',
      manageTemplatesContent.createTemplateButton.url
    );
    expect(screen.getByRole('button')).toHaveTextContent(
      manageTemplatesContent.createTemplateButton.text
    );

    expect(screen.getByTestId('no-templates-available')).toBeInTheDocument();
  });

  test('renders the page with templates', async () => {
    jest.mocked(getTemplates).mockResolvedValue(mockTemplates);
    render(await ManageTemplatesPage());

    expect(screen.getByTestId('page-content-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('page-heading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'href',
      manageTemplatesContent.createTemplateButton.url
    );
    expect(screen.getByRole('button')).toHaveTextContent(
      manageTemplatesContent.createTemplateButton.text
    );

    expect(screen.getByTestId('manage-template-table')).toBeInTheDocument();
  });

  test('letters are hidden when feature flag is not enabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_LETTERS = 'false';

    jest.mocked(getTemplates).mockResolvedValue([
      {
        id: '1',
        templateType: TemplateType.LETTER,
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        name: 'Template 1',
        createdAt: '2025-01-13T10:19:25.579Z',
        updatedAt: '2025-01-13T10:19:25.579Z',
        letterType: LetterType.BSL,
        language: Language.FRENCH,
        pdfTemplateInputFile: 'file.pdf',
        testPersonalisationInputFile: 'file.csv',
      },
    ]);
    render(await ManageTemplatesPage());

    expect(screen.getByTestId('no-templates-available')).toBeInTheDocument();
  });
});
