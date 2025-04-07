import { render, screen } from '@testing-library/react';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';

describe('PreviewTemplateDetails component', () => {
  it('matches not yet submitted snapshot', () => {
    const container = render(
      <PreviewTemplateDetails
        template={{
          id: 'template-id',
          name: 'Example template',
          message: 'app message message',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'NHS_APP',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
        }}
        templateTypeText='Channel template'
        contentPreview={[
          {
            heading: 'Heading',
            id: 'heading',
            value: 'Test value-1',
          },
        ]}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches submitted snapshot', () => {
    const container = render(
      <PreviewTemplateDetails
        template={{
          id: 'template-id',
          name: 'Example template',
          templateStatus: 'SUBMITTED',
          templateType: 'SMS',
          message: 'text message message',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
        }}
        templateTypeText='Channel template'
        contentPreview={[
          {
            heading: 'Heading',
            id: 'heading',
            value: 'Test value-1',
          },
        ]}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders without content preview', () => {
    const container = render(
      <PreviewTemplateDetails
        template={{
          id: 'template-id',
          name: 'Example template',
          templateStatus: 'SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          language: 'fr',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PENDING',
            },
            testDataCsv: {
              fileName: 'file.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: 'PENDING',
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
        }}
        additionalMetaFields={[
          {
            title: 'Meta',
            id: 'meta',
            content: <p>metadata</p>,
          },
        ]}
        templateTypeText='Channel template'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders letter template when testDataCsv is not present', () => {
    const container = render(
      <PreviewTemplateDetails.Letter
        template={{
          id: 'template-id',
          name: 'Example template',
          templateStatus: 'SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          language: 'fr',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PENDING',
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders letter template when testPersonalisationInputFile is set', () => {
    const container = render(
      <PreviewTemplateDetails.Letter
        template={{
          id: 'template-id',
          name: 'Example template',
          templateStatus: 'SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          language: 'fr',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PENDING',
            },
            testDataCsv: {
              fileName: 'file.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: 'PENDING',
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewTemplateDetails
        template={{
          id: 'template-id',
          name: 'Example template',
          message: 'app message message',
          templateType: 'NHS_APP',
          templateStatus: 'NOT_YET_SUBMITTED',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
        }}
        templateTypeText='Channel template'
        contentPreview={[
          {
            heading: 'Subject',
            id: 'subject',
            value: 'Subject value',
          },
          {
            heading: 'Heading',
            id: 'heading',
            value: 'Heading value',
          },
          {
            heading: 'Body text',
            id: 'body-text',
            value: 'Body text value',
          },
          {
            heading: 'Message',
            id: 'message',
            value: 'Message value',
          },
        ]}
      />
    );

    expect(screen.getByTestId('preview-message__heading')).toHaveTextContent(
      'Example template'
    );
    expect(screen.getByTestId('preview__heading-0')).toHaveTextContent(
      'Subject'
    );
    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Subject value'
    );
    expect(screen.getByTestId('preview__heading-1')).toHaveTextContent(
      'Heading'
    );
    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'Heading value'
    );
    expect(screen.getByTestId('preview__heading-2')).toHaveTextContent(
      'Body text'
    );
    expect(screen.getByTestId('preview__content-2')).toHaveTextContent(
      'Body text value'
    );
    expect(screen.getByTestId('preview__heading-3')).toHaveTextContent(
      'Message'
    );
    expect(screen.getByTestId('preview__content-3')).toHaveTextContent(
      'Message value'
    );
  });
});
