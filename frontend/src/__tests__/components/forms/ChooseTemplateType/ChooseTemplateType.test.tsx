import { useActionState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChooseTemplateType } from '@forms/ChooseTemplateType/ChooseTemplateType';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client/schemas';
import { useFeatureFlags } from '@providers/client-config-provider';

jest.mock('@utils/amplify-utils');

jest.mock('@providers/client-config-provider', () => ({
  useFeatureFlags: jest.fn().mockReturnValue({
    letterAuthoring: false,
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

const letterRadioTestId = 'letter-radio';
const radioTestIds = [
  'email-radio',
  'nhsapp-radio',
  'sms-radio',
  letterRadioTestId,
];
const letterTypeRadioTestIds = [
  'letter-type-q4-radio',
  'letter-type-x0-radio',
  'letter-type-x1-radio',
  'letter-type-language-radio',
];

describe('Choose template page', () => {
  const errorLogger = console.error;

  beforeAll(() => {
    global.console.error = jest.fn(); // suppress error logging in tests
  });

  afterAll(() => {
    jest.resetAllMocks();
    global.console.error = errorLogger;
  });

  describe('When letter authoring is disabled', () => {
    it('lists types excluding letter', () => {
      const container = render(
        <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
      );

      const radioButtons = radioTestIds
        .filter((testId) => testId !== letterRadioTestId)
        .map((testId) => screen.getByTestId(testId));
      const submitButton = screen.getByTestId('submit-button');

      for (const radioButton of radioButtons) {
        expect(radioButton).toBeInTheDocument();
        expect(radioButton).not.toBeChecked();
      }

      const letterRadioButtons = [
        letterRadioTestId,
        ...letterTypeRadioTestIds,
      ].map((testId) => screen.queryByTestId(testId));
      for (const radioButton of letterRadioButtons) {
        expect(radioButton).not.toBeInTheDocument();
      }

      expect(submitButton).toBeInTheDocument();

      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('When letter authoring is enabled', () => {
    beforeEach(() => {
      jest.mocked(useFeatureFlags).mockReturnValue({
        letterAuthoring: true,
      });
    });

    it('lists types including letter', () => {
      const container = render(
        <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
      );

      const radioButtons = radioTestIds.map((testId) =>
        screen.getByTestId(testId)
      );

      for (const radioButton of radioButtons) {
        expect(radioButton).toBeInTheDocument();
        expect(radioButton).not.toBeChecked();
      }

      const letterTypesRadioButtons = letterTypeRadioTestIds.map((testId) =>
        screen.queryByTestId(testId)
      );
      for (const radioButton of letterTypesRadioButtons) {
        expect(radioButton).not.toBeInTheDocument();
      }

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('selects one non-letter radio button at a time', () => {
      render(<ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />);

      const radioButtons = radioTestIds.map((testId) =>
        screen.getByTestId(testId)
      );

      for (const radioButton of radioButtons.filter(
        (r) => r.id !== letterRadioTestId
      )) {
        fireEvent(radioButton, new MouseEvent('click'));

        expect(radioButton).toBeChecked();

        const notCheckedRadioButtons = radioButtons.filter(
          (r) => r !== radioButton
        );

        for (const button of notCheckedRadioButtons) {
          expect(button).not.toBeChecked();
        }

        const letterTypeRadioButtons = letterTypeRadioTestIds.map((testId) =>
          screen.queryByTestId(testId)
        );

        for (const letterTypeButton of letterTypeRadioButtons) {
          expect(letterTypeButton).not.toBeInTheDocument();
        }
      }
    });

    it('lists letter subtypes when letter is selected', () => {
      const container = render(
        <ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />
      );

      const letterRadio = screen.getByTestId('letter-radio');
      fireEvent.click(letterRadio);

      expect(letterRadio).toBeChecked();

      const notCheckedRadioButtons = radioTestIds
        .filter((r) => r !== 'letter-radio')
        .map((testId) => screen.getByTestId(testId));

      for (const button of notCheckedRadioButtons) {
        expect(button).not.toBeChecked();
      }

      const letterTypeRadioButtons = letterTypeRadioTestIds.map((testId) =>
        screen.getByTestId(testId)
      );

      for (const letterTypeButton of letterTypeRadioButtons) {
        expect(letterTypeButton).toBeInTheDocument();
        expect(letterTypeButton).not.toBeChecked();
      }

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('selects letter subtypes one at a time', () => {
      render(<ChooseTemplateType templateTypes={TEMPLATE_TYPE_LIST} />);

      const letterRadio = screen.getByTestId('letter-radio');
      fireEvent.click(letterRadio);

      const letterTypeRadioButtons = letterTypeRadioTestIds.map((testId) =>
        screen.getByTestId(testId)
      );

      const notCheckedRadioButtons = radioTestIds
        .filter((r) => r !== 'letter-radio')
        .map((testId) => screen.getByTestId(testId));

      for (const letterTypeButton of letterTypeRadioButtons) {
        fireEvent.click(letterTypeButton);

        expect(letterRadio).toBeChecked();
        expect(letterTypeButton).toBeChecked();

        for (const button of notCheckedRadioButtons) {
          expect(button).not.toBeChecked();
        }

        const notCheckedLetterTypeButtons = letterTypeRadioButtons.filter(
          (b) => b !== letterTypeButton
        );

        for (const button of notCheckedLetterTypeButtons) {
          expect(button).not.toBeChecked();
        }
      }
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
  });
});
