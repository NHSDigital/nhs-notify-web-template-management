import { render, screen } from '@testing-library/react';
import { MessageTemplates } from '@molecules/MessageTemplates/MessageTemplates';
import { TemplateStatus, TemplateType } from '@utils/enum';
import content from '@content/content';

const manageTemplatesContent = content.pages.manageTemplates;

const messageTemplatesProps = {
  templateList: [
    {
      id: '1',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'Template 1',
      message: 'Message',
      subject: 'Subject Line',
      createdAt: '2021-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'Template 2',
      message: 'Message',
      subject: 'Subject Line',
      createdAt: '2021-02-01T00:00:00.000Z',
    },
  ],
};

describe('MessageTemplates component', () => {
  it('matches snapshot with not submitted status', () => {
    const container = render(<MessageTemplates {...messageTemplatesProps} />);

    expect(container.asFragment()).toMatchSnapshot();
  });
  it('matches snapshot with submitted status', () => {
    messageTemplatesProps.templateList[0].templateStatus =
      TemplateStatus.SUBMITTED;
    const container = render(<MessageTemplates {...messageTemplatesProps} />);

    expect(container.asFragment()).toMatchSnapshot();
  });
  it('renders component correctly', () => {
    render(<MessageTemplates {...messageTemplatesProps} />);

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
