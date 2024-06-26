'use client';
import { useFormState } from 'react-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ChooseTemplatePage from '../../app/choose-template/page';
import { mockDeep } from 'jest-mock-extended';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: jest.fn(),
}));

describe('Choose template page', () => {
  it('selects one radio button at a time', () => {
    (useFormState as jest.Mock).mockReturnValue([
      {
        formErrors: [],
        fieldErrors: {},
      },
      '/action',
      false,
    ]);
    const container = render(<ChooseTemplatePage />);
    expect(container.asFragment()).toMatchSnapshot();

    const radioButtons = [
      screen.getByTestId('email-radio'),
      screen.getByTestId('nhs-app-radio'),
      screen.getByTestId('sms-radio'),
      screen.getByTestId('letter-radio'),
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
    (useFormState as jest.Mock).mockReturnValue([
      {
        formErrors: [],
        fieldErrors: {
          'choose-template': ['Component error message'],
        },
      },
      '/action',
      false,
    ]);
    const container = render(<ChooseTemplatePage />);
    expect(container.asFragment()).toMatchSnapshot();

    expect(screen.getByTestId('error-summary')).toBeInTheDocument();
    expect(
      document.getElementById('choose-template-error-message')
    ).toBeInTheDocument();
  });
});
