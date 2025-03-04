'use client';

import { useActionState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import {
  TemplateFormState,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';

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
      <ChooseTemplate templateTypes={Object.values(TemplateType)} />
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
      <ChooseTemplate templateTypes={Object.values(TemplateType)} />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
