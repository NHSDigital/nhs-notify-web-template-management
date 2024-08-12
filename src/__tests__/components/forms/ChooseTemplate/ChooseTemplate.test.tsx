'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { ChooseTemplate } from '@forms/ChooseTemplate/ChooseTemplate';
import { TemplateFormState } from '@utils/types';

describe('Choose template page', () => {
  it('selects one radio button at a time', () => {
    const container = render(
      <ChooseTemplate
        state={mockDeep<TemplateFormState>({
          validationError: undefined,
        })}
        action='/action'
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

    for (const [_, radioButton] of radioButtons.entries()) {
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
        state={mockDeep<TemplateFormState>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              page: ['Component error message'],
            },
          },
        })}
        action='/action'
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
