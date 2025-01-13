import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ManageTemplatesPage from '@app/manage-templates/page';
import content from '@content/content';
import { getTemplates } from '@utils/form-actions';
import {
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { TemplateDTO } from 'nhs-notify-backend-client';

const manageTemplatesContent = content.pages.manageTemplates;

const mockTemplates: TemplateDTO[] = [
  {
    id: '1',
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'Template 1',
    message: 'Message',
    subject: 'Subject Line',
    createdAt: 'today',
    updatedAt: 'today',
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
    expect(screen.getByTestId('link-button')).toBeInTheDocument();
    expect(screen.getByTestId('link-button')).toHaveAttribute(
      'href',
      manageTemplatesContent.createTemplateButton.url
    );
    expect(screen.getByTestId('link-button')).toHaveTextContent(
      manageTemplatesContent.createTemplateButton.text
    );

    expect(screen.getByTestId('no-templates-available')).toBeInTheDocument();
  });
  test('renders the page with templates', async () => {
    jest.mocked(getTemplates).mockResolvedValue(mockTemplates);
    render(await ManageTemplatesPage());

    expect(screen.getByTestId('page-content-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('page-heading')).toBeInTheDocument();
    expect(screen.getByTestId('link-button')).toBeInTheDocument();
    expect(screen.getByTestId('link-button')).toHaveAttribute(
      'href',
      manageTemplatesContent.createTemplateButton.url
    );
    expect(screen.getByTestId('link-button')).toHaveTextContent(
      manageTemplatesContent.createTemplateButton.text
    );

    expect(screen.getByTestId('manage-template-table')).toBeInTheDocument();
  });
});
