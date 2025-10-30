import { render } from '@testing-library/react';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { ViewLetterTemplate } from '@molecules/ViewLetterTemplate/ViewLetterTemplate';

describe('ViewLetterTemplate component', () => {
  it('matches submitted snapshot', () => {
    const container = render(
      <ViewLetterTemplate
        initialState={
          {
            templateType: 'LETTER',
            id: 'template-id',
            clientId: 'client-id',
            name: 'Example template',
            templateStatus: 'SUBMITTED',
            createdAt: '2025-03-28T12:30:54.684Z',
            updatedAt: '2025-03-28T12:31:54.684Z',
            lockNumber: 1,
            letterType: 'x0',
            language: 'en',
            files: {
              pdfTemplate: {
                fileName: 'file.pdf',
                currentVersion: 'a',
                virusScanStatus: 'PASSED',
              },
              proofs: {
                'supplier-proof.pdf': {
                  fileName: 'supplier-proof.pdf',
                  virusScanStatus: 'PASSED',
                  supplier: 'MBA',
                },
              },
            },
          } satisfies LetterTemplate
        }
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
