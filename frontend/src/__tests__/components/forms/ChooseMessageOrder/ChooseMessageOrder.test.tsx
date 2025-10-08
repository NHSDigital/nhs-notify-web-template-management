import { useActionState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChooseMessageOrder } from '@forms/ChooseMessageOrder/ChooseMessageOrder';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';

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

describe('Choose message order page', () => {
  it('renders form', () => {
    const container = render(<ChooseMessageOrder />);
    expect(container.asFragment()).toMatchSnapshot();
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

    const container = render(<ChooseMessageOrder />);
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers', () => {
    const container = render(<ChooseMessageOrder />);
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
