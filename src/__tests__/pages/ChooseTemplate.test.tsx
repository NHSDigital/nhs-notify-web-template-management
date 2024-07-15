'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { ChooseTemplate } from '../../components/forms/ChooseTemplate/ChooseTemplate';
import { FormState } from '../../utils/types';

describe('Choose template page', () => {
  it('selects one radio button at a time', () => {
    const container = render(
      <ChooseTemplate
        state={mockDeep<FormState>({
          validationError: undefined,
        })}
        action='/action'
      />
    );
    expect(container.asFragment()).toMatchSnapshot();

    const radioButtons = [
      screen.getByTestId('create-email-template-radio'),
      screen.getByTestId('create-nhs-app-template-radio'),
      screen.getByTestId('create-sms-template-radio'),
      screen.getByTestId('create-letter-template-radio'),
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
        state={mockDeep<FormState>({
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
