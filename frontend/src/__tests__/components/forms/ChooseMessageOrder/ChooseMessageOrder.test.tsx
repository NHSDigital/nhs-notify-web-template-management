import { useActionState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChooseMessageOrder } from '@forms/ChooseMessageOrder/ChooseMessageOrder';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import { useFeatureFlags } from '@providers/client-config-provider';

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

jest.mocked(useFeatureFlags).mockReturnValue({ letterAuthoring: true });

describe('Choose message order page', () => {
  const errorLogger = console.error;

  beforeAll(() => {
    global.console.error = jest.fn(); // suppress error logging in tests
  });

  afterAll(() => {
    jest.resetAllMocks();
    global.console.error = errorLogger;
  });

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

    jest.mocked(useActionState).mockImplementationOnce(mockUseActionState);

    const container = render(<ChooseMessageOrder />);
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers - valid form - no errors', () => {
    const container = render(<ChooseMessageOrder />);

    fireEvent.click(screen.getByTestId('nhsapp-radio'));
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers - invalid form - errors displayed', () => {
    const container = render(<ChooseMessageOrder />);

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(container.asFragment()).toMatchSnapshot();
  });
});
