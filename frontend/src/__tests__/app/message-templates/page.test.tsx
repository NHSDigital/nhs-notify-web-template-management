import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MessageTemplatesPage, {
  generateMetadata,
} from '@app/message-templates/page';
import content from '@content/content';
import { getTemplates } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-web-template-management-types';

const messageTemplatesContent = content.pages.messageTemplates;

const mockTemplates: TemplateDto[] = [
  {
    id: '1',
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'Template 1',
    message: 'Message',
    createdAt: '2025-01-13T10:19:25.579Z',
    updatedAt: '2025-01-13T10:19:25.579Z',
    lockNumber: 1,
  },
];

jest.mock('@utils/form-actions');

describe('MessageTemplatesPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test('renders the page without templates', async () => {
    render(await MessageTemplatesPage());

    expect(await generateMetadata()).toEqual({
      title: messageTemplatesContent.pageTitle,
    });
    expect(screen.getByTestId('page-content-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('page-heading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'href',
      messageTemplatesContent.createTemplateButton.url
    );
    expect(screen.getByRole('button')).toHaveTextContent(
      messageTemplatesContent.createTemplateButton.text
    );

    expect(screen.getByTestId('no-templates-available')).toBeInTheDocument();
  });

  test('renders the page with templates', async () => {
    jest.mocked(getTemplates).mockResolvedValue(mockTemplates);
    render(await MessageTemplatesPage());

    expect(screen.getByTestId('page-content-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('page-heading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'href',
      messageTemplatesContent.createTemplateButton.url
    );
    expect(screen.getByRole('button')).toHaveTextContent(
      messageTemplatesContent.createTemplateButton.text
    );

    expect(screen.getByTestId('manage-template-table')).toBeInTheDocument();
  });
});
