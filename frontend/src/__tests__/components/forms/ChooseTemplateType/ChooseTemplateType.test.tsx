import { useActionState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChooseTemplateType } from '@forms/ChooseTemplateType/ChooseTemplateType';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';
import { useFeatureFlags } from '@providers/client-config-provider';

jest.mock('@utils/amplify-utils');

jest.mock('@providers/client-config-provider', () => ({
  useFeatureFlags: jest.fn().mockReturnValue({
    letterAuthoring: true,
  }),
}));

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
  const errorLogger = console.error;

  beforeAll(() => {
    global.console.error = jest.fn(); // suppress error logging in tests
  });

  afterAll(() => {
    jest.resetAllMocks();
    global.console.error = errorLogger;
  });

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

    jest.mocked(useActionState).mockImplementationOnce(mockUseActionState);

    const container = render(
      <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers - valid form - no errors', () => {
    const container = render(
      <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
    );

    fireEvent.click(screen.getByTestId('nhsapp-radio'));
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers - invalid form - errors displayed', () => {
    const container = render(
      <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
    );

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(container.asFragment()).toMatchSnapshot();
  });

  describe('when letter authoring is enabled', () => {
    beforeEach(() => {
      jest.mocked(useFeatureFlags).mockReturnValue({
        letterAuthoring: true,
      });
    });

    it('shows letter type options once "Letter" template type radio is selected', () => {
      render(<ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />);

      expect(
        screen.queryByTestId('letter-type-q4-radio')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('letter-type-x0-radio')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('letter-type-x1-radio')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('letter-type-language-radio')
      ).not.toBeInTheDocument();

      const letterRadio = screen.getByTestId('letter-radio');
      fireEvent.click(letterRadio);

      expect(letterRadio).toBeChecked();

      expect(screen.getByTestId('letter-type-q4-radio')).toBeInTheDocument();
      expect(screen.getByTestId('letter-type-x0-radio')).toBeInTheDocument();
      expect(screen.getByTestId('letter-type-x1-radio')).toBeInTheDocument();
      expect(
        screen.getByTestId('letter-type-language-radio')
      ).toBeInTheDocument();
    });

    it('should show the correct validation errors for both template type and letter type', () => {
      const mockUseActionState = jest.fn().mockReturnValue([
        {
          errorState: {
            formErrors: [],
            fieldErrors: {
              letterType: ['Select a letter template type'],
            },
          },
        },
        '/action',
      ]);

      jest.mocked(useActionState).mockImplementation(mockUseActionState);

      const container = render(
        <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
      );

      const letterRadio = screen.getByTestId('letter-radio');
      fireEvent.click(letterRadio);

      const errorMessages = screen.getAllByText(
        'Select a letter template type'
      );
      expect(errorMessages).toHaveLength(2);

      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when letter authoring is disabled', () => {
    beforeEach(() => {
      jest.mocked(useFeatureFlags).mockReturnValue({
        letterAuthoring: false,
      });
    });

    it('should not show the letter type options when "Letter" radio is selected', () => {
      render(<ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />);

      const letterRadio = screen.getByTestId('letter-radio');
      fireEvent.click(letterRadio);

      expect(letterRadio).toBeChecked();

      expect(
        screen.queryByTestId('letter-type-q4-radio')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('letter-type-x0-radio')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('letter-type-x1-radio')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('letter-type-language-radio')
      ).not.toBeInTheDocument();
    });
  });
});
