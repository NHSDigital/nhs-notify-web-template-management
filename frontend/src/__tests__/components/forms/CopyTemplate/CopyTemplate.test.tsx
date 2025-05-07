'use client';

import { useActionState } from 'react';
import { mockDeep } from 'jest-mock-extended';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopyTemplate, ValidCopyType } from '@forms/CopyTemplate/CopyTemplate';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import { ValidatedTemplateDto } from 'nhs-notify-backend-client';

jest.mock('@utils/amplify-utils');

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: jest
      .fn()
      .mockImplementation(
        (
          _: (
            formState: TemplateFormState,
            formData: FormData
          ) => Promise<TemplateFormState>,
          initialState: TemplateFormState
        ) => [initialState, '/action']
      ),
  };
});

describe('Choose template page', () => {
  it('selects one radio button at a time', () => {
    const container = render(
      <CopyTemplate
        template={mockDeep<
          ValidatedTemplateDto & { templateType: ValidCopyType }
        >()}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();

    const radioButtons = [
      screen.getByTestId('EMAIL-radio'),
      screen.getByTestId('NHS_APP-radio'),
      screen.getByTestId('SMS-radio'),
    ];
    const submitButton = screen.getByTestId('submit-button');

    for (const radioButton of radioButtons) {
      expect(radioButton).toBeInTheDocument();
      expect(radioButton).not.toBeChecked();
    }
    expect(submitButton).toBeInTheDocument();

    for (const [, radioButton] of radioButtons.entries()) {
      // select an option
      fireEvent(radioButton, new MouseEvent('click'));

      expect(radioButton).toBeChecked();

      const notCheckedRadioButtons = radioButtons.filter(
        (r) => r !== radioButton
      );

      for (const button of notCheckedRadioButtons)
        expect(button).not.toBeChecked();
    }
  });

  it('renders error component', () => {
    const mockUseActionState = jest.fn().mockReturnValue([
      {
        validationError: {
          formErrors: [],
          fieldErrors: {
            page: ['Component error message'],
          },
        },
      },
      '/action',
    ]);

    jest.mocked(useActionState).mockImplementation(mockUseActionState);

    const container = render(
      <CopyTemplate
        template={mockDeep<
          ValidatedTemplateDto & { templateType: ValidCopyType }
        >()}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers', () => {
    const container = render(
      <CopyTemplate
        template={mockDeep<
          ValidatedTemplateDto & { templateType: ValidCopyType }
        >()}
      />
    );
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
