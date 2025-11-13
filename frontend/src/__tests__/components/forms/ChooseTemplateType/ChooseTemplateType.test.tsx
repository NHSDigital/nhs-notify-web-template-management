import { useActionState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChooseTemplateType } from '@forms/ChooseTemplateType/ChooseTemplateType';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';

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
      <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
    );
    expect(container.asFragment()).toMatchSnapshot();

    const radioButtons = [
      screen.getByTestId('email-radio'),
      screen.getByTestId('nhsapp-radio'),
      screen.getByTestId('sms-radio'),
      screen.getByTestId('letter-radio'),
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
        errorState: {
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
      <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers', () => {
    const container = render(
      <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
    );
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
