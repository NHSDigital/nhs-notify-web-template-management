import { render, screen } from '@testing-library/react';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import {
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import {
  Language,
  LetterType,
  VirusScanStatus,
} from 'nhs-notify-backend-client';

describe('PreviewTemplateDetails component', () => {
  it('matches not yet submitted snapshot', () => {
    const container = render(
      <PreviewTemplateDetails
        template={{
          id: 'template-id',
          name: 'Example template',
          message: 'app message message',
          templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
          templateType: TemplateType.NHS_APP,
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
          templateStatus: TemplateStatus.SUBMITTED,
          templateType: TemplateType.SMS,
          message: 'text message message',
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
          templateStatus: TemplateStatus.SUBMITTED,
          templateType: TemplateType.LETTER,
          letterType: LetterType.X0,
          language: Language.FR,
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: VirusScanStatus.PENDING,
            },
            testDataCsv: {
              fileName: 'file.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: VirusScanStatus.PENDING,
            },
          },
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

  it('renders letter template when testPersonalisationInputFile is not set', () => {
    const container = render(
      <PreviewTemplate.Letter
        template={{
          id: 'template-id',
          name: 'Example template',
          templateStatus: TemplateStatus.SUBMITTED,
          templateType: TemplateType.LETTER,
          letterType: LetterType.X0,
          language: Language.FR,
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: VirusScanStatus.PENDING,
            },
          },
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
          templateType: TemplateType.NHS_APP,
          templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
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
