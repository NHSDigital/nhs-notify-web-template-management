import { render, screen } from '@testing-library/react';
import { ManageTemplates } from '@molecules/ManageTemplates/ManageTemplates';
import content from '@content/content';
import { TemplateDto } from 'nhs-notify-backend-client';

const manageTemplatesContent = content.pages.manageTemplates;

const manageTemplatesProps: {
  templateList: TemplateDto[];
} = {
  templateList: [
    {
      id: '1',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'Template 1',
      message: 'Message',
      createdAt: '2021-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      templateType: 'NHS_APP',
      templateStatus: 'SUBMITTED',
      name: 'Template 2',
      message: 'Message',
      createdAt: '2021-02-01T00:00:00.000Z',
      updatedAt: '2021-02-01T00:00:00.000Z',
    },
    {
      id: '3',
      templateType: 'LETTER',
      templateStatus: 'SUBMITTED',
      name: 'Template 3',
      createdAt: '2021-02-01T00:00:00.000Z',
      letterType: 'x0',
      language: 'fr',
      updatedAt: '2021-02-01T00:00:00.000Z',
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
        },
      },
    },
  ],
};

describe('ManageTemplates component', () => {
  it('matches snapshot with not submitted status', () => {
    const container = render(<ManageTemplates {...manageTemplatesProps} />);

    expect(container.asFragment()).toMatchSnapshot();
  });
  it('matches snapshot with submitted status', () => {
    manageTemplatesProps.templateList[0].templateStatus = 'SUBMITTED';
    const container = render(<ManageTemplates {...manageTemplatesProps} />);

    expect(container.asFragment()).toMatchSnapshot();
  });
  it('renders component correctly', () => {
    render(<ManageTemplates {...manageTemplatesProps} />);

    expect(screen.getByTestId('manage-template-table')).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-template-name')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-template-name')
    ).toHaveTextContent(manageTemplatesContent.tableHeadings.name);
    expect(
      screen.getByTestId('manage-template-table-header-template-type')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-template-type')
    ).toHaveTextContent(manageTemplatesContent.tableHeadings.type);
    expect(
      screen.getByTestId('manage-template-table-header-template-status')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-template-status')
    ).toHaveTextContent(manageTemplatesContent.tableHeadings.status);
    expect(
      screen.getByTestId('manage-template-table-header-template-date-created')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-template-date-created')
    ).toHaveTextContent(manageTemplatesContent.tableHeadings.dateCreated);
    expect(
      screen.getByTestId('manage-template-table-header-action')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-action')
    ).toHaveTextContent(manageTemplatesContent.tableHeadings.action.text);
  });
});
