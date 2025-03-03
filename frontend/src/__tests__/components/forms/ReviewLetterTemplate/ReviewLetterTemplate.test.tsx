'use client';

import { render, screen } from '@testing-library/react';
import { ReviewLetterTemplate } from '@forms/ReviewLetterTemplate';
import {
  LetterTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { mockDeep } from 'jest-mock-extended';
import { useSearchParams } from 'next/navigation';
import {
  Language,
  LetterType,
  VirusScanStatus,
} from 'nhs-notify-backend-client';

jest.mock('@forms/ReviewLetterTemplate/server-actions');

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: (
      _: (
        formState: TemplateFormState,
        formData: FormData
      ) => Promise<TemplateFormState>,
      initialState: TemplateFormState
    ) => [initialState, '/action'],
  };
});

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => undefined),
  })),
}));

describe('Review letter form renders', () => {
  it('matches snapshot when navigating from manage templates screen', () => {
    const container = render(
      <ReviewLetterTemplate
        initialState={mockDeep<TemplateFormState<LetterTemplate>>({
          validationError: undefined,
          name: 'test-template-letter',
          id: 'template-id',
          language: Language.EN,
          letterType: LetterType.Q1,
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: VirusScanStatus.PENDING,
            },
          },
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when navigating from edit screen', () => {
    const mockSearchParams = new Map([['from', 'edit']]);
    (useSearchParams as jest.Mock).mockImplementation(() => ({
      get: (key: string) => mockSearchParams.get(key),
    }));

    const container = render(
      <ReviewLetterTemplate
        initialState={mockDeep<TemplateFormState<LetterTemplate>>({
          validationError: undefined,
          name: 'test-template-letter',
          id: 'template-id',
          language: Language.EN,
          letterType: LetterType.Q1,
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: VirusScanStatus.PENDING,
            },
            testDataCsv: {
              fileName: 'test-data.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: VirusScanStatus.PENDING,
            },
          },
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <ReviewLetterTemplate
        initialState={mockDeep<TemplateFormState<LetterTemplate>>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              reviewLetterTemplateAction: ['Select an option'],
            },
          },
          name: 'test-template-letter',
          id: 'template-id',
          language: Language.DE,
          letterType: LetterType.X3,
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: VirusScanStatus.PENDING,
            },
            testDataCsv: {
              fileName: 'test-data.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: VirusScanStatus.PENDING,
            },
          },
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewLetterTemplate
        initialState={mockDeep<TemplateFormState<LetterTemplate>>({
          validationError: undefined,
          name: 'test-template-email',
          id: 'template-id',
          language: Language.HI,
          letterType: LetterType.X0,
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: VirusScanStatus.PENDING,
            },
            testDataCsv: {
              fileName: 'test-data.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: VirusScanStatus.PENDING,
            },
          },
        })}
      />
    );

    expect(screen.getByTestId('letter-edit-radio')).toHaveAttribute(
      'value',
      'letter-edit'
    );

    expect(screen.getByTestId('letter-submit-radio')).toHaveAttribute(
      'value',
      'letter-submit'
    );
  });
});
