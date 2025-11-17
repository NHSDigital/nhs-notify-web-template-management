import { PreviewSubmittedTemplate } from '@molecules/PreviewSubmittedTemplate/PreviewSubmittedTemplate';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { render } from '@testing-library/react';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useSearchParams: jest.fn(),
}));

const useSearchParamsMock = jest.mocked(useSearchParams);

useSearchParamsMock.mockReturnValue(new ReadonlyURLSearchParams());

describe('PreviewSubmittedTemplate component', () => {
  it('should render app message', () => {
    const container = render(
      <PreviewSubmittedTemplate
        initialState={{
          id: 'template-id',
          name: 'Example template',
          message: 'app content',
          templateStatus: 'SUBMITTED',
          templateType: 'NHS_APP',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
        previewComponent={PreviewTemplateDetailsNhsApp}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should render email', () => {
    const container = render(
      <PreviewSubmittedTemplate
        initialState={{
          id: 'template-id',
          name: 'Example Email template',
          message: 'email content',
          subject: 'email subject',
          templateStatus: 'SUBMITTED',
          templateType: 'EMAIL',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
        previewComponent={PreviewTemplateDetailsEmail}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should render sms', () => {
    const container = render(
      <PreviewSubmittedTemplate
        initialState={{
          id: 'template-id',
          name: 'SMS template',
          message: 'SMS content',
          templateStatus: 'SUBMITTED',
          templateType: 'SMS',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
        previewComponent={PreviewTemplateDetailsSms}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should render letter', () => {
    const container = render(
      <PreviewSubmittedTemplate
        initialState={{
          id: 'template-id',
          clientId: 'client-id',
          name: 'Example letter',
          templateStatus: 'SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          language: 'en',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PASSED',
            },
            testDataCsv: {
              fileName: 'file.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: 'PASSED',
            },
            proofs: {
              'a.pdf': {
                fileName: 'a.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
              'b.pdf': {
                fileName: 'b.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
              'c.pdf': {
                fileName: 'c.pdf',
                virusScanStatus: 'FAILED',
                supplier: 'MBA',
              },
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
        previewComponent={PreviewTemplateDetailsLetter}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should provide back buttons based on source page', () => {
    useSearchParamsMock.mockReturnValueOnce(
      new ReadonlyURLSearchParams({
        sourcePage: '/source',
      })
    );

    const container = render(
      <PreviewSubmittedTemplate
        initialState={{
          id: 'template-id',
          name: 'Example template',
          message: 'app content',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'NHS_APP',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
        previewComponent={PreviewTemplateDetailsNhsApp}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should omit status when coming from message plans', () => {
    useSearchParamsMock.mockReturnValueOnce(
      new ReadonlyURLSearchParams({
        sourcePage:
          '/message-plans/choose-nhs-app-template/93b92d43-a8e0-4d90-8e75-924c8a0c8e0d',
      })
    );

    const container = render(
      <PreviewSubmittedTemplate
        initialState={{
          id: 'template-id',
          name: 'Example template',
          message: 'app content',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'NHS_APP',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
        previewComponent={PreviewTemplateDetailsNhsApp}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
