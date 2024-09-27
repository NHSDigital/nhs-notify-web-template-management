'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { TemplateFormState } from '@utils/types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => {},
}));

jest.mock('react-dom', () => {
  const originalModule = jest.requireActual('react-dom');

  return {
    ...originalModule,
    useFormState: (
      _: (
        formState: TemplateFormState,
        formData: FormData
      ) => Promise<TemplateFormState>,
      initialState: TemplateFormState
    ) => [initialState, '/action'],
  };
});

describe('Choose template page', () => {
  it('selects one radio button at a time', () => {
    const container = render(
      <ChooseTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();

    const radioButtons = [
      screen.getByTestId('EMAIL-radio'),
      screen.getByTestId('NHS_APP-radio'),
      screen.getByTestId('SMS-radio'),
      screen.getByTestId('LETTER-radio'),
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
    const container = render(
      <ChooseTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              page: ['Component error message'],
            },
          },
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
