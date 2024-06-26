'use client'
import { render, screen, fireEvent } from '@testing-library/react';
import { ChooseTemplate } from '../../components/forms/ChooseTemplate/ChooseTemplate';
import { mockDeep } from 'jest-mock-extended';
import { FormState } from '../../utils/types';

describe('Choose template page', () => {
  it('selects one radio button at a time', () => {

    const container = render(<ChooseTemplate 
        state={mockDeep<FormState>({
            validationError: null,
        })}
        action='/action'
    />);
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

    for (const [index, radioButton] of radioButtons.entries()) {
      // select an option
      fireEvent(radioButton, new MouseEvent('click'));

      // make sure the selected option is checked and the other options are not
      for (const [index2, radioButton2] of radioButtons.entries()) {
        if (index === index2) {
          expect(radioButton2).toBeChecked();
        } else {
          expect(radioButton2).not.toBeChecked();
        }
      }
    }
  });

  it('renders error component', () => {
    const container = render(<ChooseTemplate 
        state={mockDeep<FormState>({
            validationError: {
                formErrors: [],
                fieldErrors: {
                    page: ['Component error message']
                },
            }
        })}
        action='/action'
    />);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
