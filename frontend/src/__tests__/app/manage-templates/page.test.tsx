import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ManageTemplatesPage from '@app/manage-templates/page';
import content from '@content/content';
import { getTemplates } from '@utils/form-actions';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';

const manageTemplatesContent = content.pages.manageTemplates;

const mockTemplates: TemplateDTO[] = [
  {
    id: '1',
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'Template 1',
    message: 'Message',
    createdAt: '2025-01-13T10:19:25.579Z',
    updatedAt: '2025-01-13T10:19:25.579Z',
  },
];

jest.mock('@utils/form-actions');

describe('ManageTemplatesPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
});
