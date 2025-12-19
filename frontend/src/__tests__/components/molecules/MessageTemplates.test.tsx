import { render, screen } from '@testing-library/react';
import { MessageTemplates } from '@molecules/MessageTemplates/MessageTemplates';
import content from '@content/content';
import { TemplateDto } from 'nhs-notify-backend-client';
import { useFeatureFlags } from '@providers/client-config-provider';

jest.mock('@providers/client-config-provider');

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(useFeatureFlags).mockReturnValue({ routing: false });
});

const messageTemplatesContent = content.pages.messageTemplates;

const messageTemplatesProps: {
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
      lockNumber: 1,
    },
    {
      id: '2',
      templateType: 'NHS_APP',
      templateStatus: 'SUBMITTED',
      name: 'Template 2',
      message: 'Message',
      createdAt: '2021-01-01T00:00:00.000Z',
      updatedAt: '2021-03-01T00:00:00.000Z',
      lockNumber: 1,
    },
    {
      id: '3',
      templateType: 'LETTER',
      templateStatus: 'SUBMITTED',
      name: 'Template 3',
      createdAt: '2021-02-01T00:00:00.000Z',
      letterType: 'x0',
      language: 'en',
      updatedAt: '2021-02-01T00:00:00.000Z',
      lockNumber: 1,
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: '8BAC',
          virusScanStatus: 'PASSED',
        },
      },
    },
    {
      id: '4',
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'Template 4',
      createdAt: '2021-02-01T00:00:00.000Z',
      letterType: 'x0',
      language: 'fr',
      updatedAt: '2021-02-01T00:00:00.000Z',
      lockNumber: 1,
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: '8BAC',
          virusScanStatus: 'PASSED',
        },
      },
    },
  ],
};

describe('MessageTemplates component', () => {
  it('matches snapshot with not submitted status', () => {
    const container = render(<MessageTemplates {...messageTemplatesProps} />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot with routing flag enabled', () => {
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });

    const container = render(<MessageTemplates {...messageTemplatesProps} />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot with pending proof request status', () => {
    messageTemplatesProps.templateList[0].templateStatus =
      'PENDING_PROOF_REQUEST';
    const container = render(<MessageTemplates {...messageTemplatesProps} />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot with waiting for proof status', () => {
    messageTemplatesProps.templateList[0].templateStatus = 'WAITING_FOR_PROOF';
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
    ).toHaveTextContent(messageTemplatesContent.tableHeadings.name);
    expect(
      screen.getByTestId('manage-template-table-header-template-type')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-template-type')
    ).toHaveTextContent(messageTemplatesContent.tableHeadings.type);
    expect(
      screen.getByTestId('manage-template-table-header-template-status')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-template-status')
    ).toHaveTextContent(messageTemplatesContent.tableHeadings.status);
    expect(
      screen.getByTestId('manage-template-table-header-template-date-created')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-template-date-created')
    ).toHaveTextContent(messageTemplatesContent.tableHeadings.lastEdited);
    expect(
      screen.getByTestId('manage-template-table-header-action')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('manage-template-table-header-action')
    ).toHaveTextContent(messageTemplatesContent.tableHeadings.action.text);
  });
});
