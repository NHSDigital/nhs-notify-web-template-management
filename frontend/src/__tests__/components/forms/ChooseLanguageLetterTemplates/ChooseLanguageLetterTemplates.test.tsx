import { ChooseLanguageLetterTemplates } from '@forms/ChooseLanguageLetterTemplates/ChooseLanguageLetterTemplates';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  AUTHORING_LETTER_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { useActionState } from 'react';
import { ChooseLanguageLetterTemplatesFormState } from '@forms/ChooseLanguageLetterTemplates/server-action';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { ConditionalTemplateLanguage } from 'nhs-notify-backend-client';

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: jest
      .fn()
      .mockImplementation(
        (
          _: (
            formState: ChooseLanguageLetterTemplatesFormState,
            formData: FormData
          ) => Promise<ChooseLanguageLetterTemplatesFormState>,
          initialState: ChooseLanguageLetterTemplatesFormState
        ) => [initialState, '/action']
      ),
  };
});

const FRENCH_LETTER_TEMPLATE: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'french-letter-id',
  name: 'French letter template',
  language: 'fr',
};

const POLISH_LETTER_TEMPLATE: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'polish-letter-id',
  name: 'Polish letter template',
  language: 'pl',
};

const SPANISH_LETTER_TEMPLATE: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'spanish-letter-id',
  name: 'Spanish letter template',
  language: 'es',
};

const GERMAN_AUTHORING_LETTER_TEMPLATE: LetterTemplate = {
  ...AUTHORING_LETTER_TEMPLATE,
  id: 'german-authoring-letter-id',
  name: 'German authoring letter template',
  language: 'de',
};

const languageLetterTemplates = [
  FRENCH_LETTER_TEMPLATE,
  POLISH_LETTER_TEMPLATE,
  SPANISH_LETTER_TEMPLATE,
];

const createMessagePlanWithLanguageTemplates = (
  languageTemplates: ConditionalTemplateLanguage[]
) => ({
  ...ROUTING_CONFIG,
  cascade: [
    ...ROUTING_CONFIG.cascade.slice(0, 3),
    {
      ...ROUTING_CONFIG.cascade[3],
      conditionalTemplates: languageTemplates.map(
        ({ templateId, language }) => ({
          templateId,
          language,
        })
      ),
    },
  ],
});

const renderComponent = (overrides = {}) => {
  const defaultProps = {
    messagePlan: ROUTING_CONFIG,
    pageHeading: 'Choose language letter templates',
    templateList: languageLetterTemplates,
    cascadeIndex: 3,
    lockNumber: 42,
  };

  return render(
    <ChooseLanguageLetterTemplates {...defaultProps} {...overrides} />
  );
};

describe('ChooseLanguageLetterTemplates', () => {
  it('displays correct message plan name', () => {
    renderComponent();

    expect(screen.getByText(ROUTING_CONFIG.name)).toBeInTheDocument();
  });

  it('displays correct page heading', () => {
    const heading = 'Choose other language letter templates';

    renderComponent({
      pageHeading: heading,
    });

    expect(
      screen.getByRole('heading', {
        name: heading,
      })
    ).toBeInTheDocument();
  });

  it('displays back link with correct URL', () => {
    renderComponent();

    const backLink = screen.getByRole('link', { name: 'Go back' });
    expect(backLink).toHaveAttribute(
      'href',
      `/message-plans/choose-templates/${ROUTING_CONFIG.id}`
    );
  });

  describe('when templates are available', () => {
    it('displays correct number of templates to choose from', () => {
      renderComponent({
        templateList: languageLetterTemplates,
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(languageLetterTemplates.length);

      const table = screen.getByTestId('language-templates-table');
      expect(
        within(table).getByText(FRENCH_LETTER_TEMPLATE.name)
      ).toBeInTheDocument();
      expect(
        within(table).getByText(POLISH_LETTER_TEMPLATE.name)
      ).toBeInTheDocument();
      expect(
        within(table).getByText(SPANISH_LETTER_TEMPLATE.name)
      ).toBeInTheDocument();
    });

    it('displays "Save and continue" button', () => {
      renderComponent();

      const saveButton = screen.getByRole('button', {
        name: 'Save and continue',
      });
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveAttribute('type', 'submit');
    });

    it('displays table hint text', () => {
      renderComponent();

      const hintText = screen.getByText(
        'Choose all the templates that you want to include in this message plan. You can only choose one template for each language.'
      );
      expect(hintText).toBeInTheDocument();
      expect(hintText).toHaveClass('nhsuk-hint');
    });

    it('renders multiple options', () => {
      const container = renderComponent({
        templateList: languageLetterTemplates,
      });
      expect(container.asFragment()).toMatchSnapshot();
    });

    it('renders mixed PDF and authoring letter templates', () => {
      const mixedTemplateList = [
        FRENCH_LETTER_TEMPLATE,
        GERMAN_AUTHORING_LETTER_TEMPLATE,
        SPANISH_LETTER_TEMPLATE,
      ];

      const container = renderComponent({
        templateList: mixedTemplateList,
      });

      const table = screen.getByTestId('language-templates-table');
      expect(
        within(table).getByText(FRENCH_LETTER_TEMPLATE.name)
      ).toBeInTheDocument();
      expect(
        within(table).getByText(GERMAN_AUTHORING_LETTER_TEMPLATE.name)
      ).toBeInTheDocument();
      expect(
        within(table).getByText(SPANISH_LETTER_TEMPLATE.name)
      ).toBeInTheDocument();

      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when there are no templates', () => {
    it('displays "You do not have any other language letter templates" message', () => {
      renderComponent({
        templateList: [],
      });

      expect(
        screen.getByText(
          'You do not have any other language letter templates yet.'
        )
      ).toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('displays "Go to templates" link', () => {
      renderComponent({
        templateList: [],
      });

      const goToTemplatesLink = screen.getByRole('link', {
        name: 'Go to templates',
      });
      expect(goToTemplatesLink).toHaveAttribute('href', '/message-templates');
      expect(
        screen.queryByRole('button', { name: 'Save and continue' })
      ).not.toBeInTheDocument();
    });

    it('renders correctly', () => {
      const container = renderComponent({
        templateList: [],
      });
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when there are no language templates preselected', () => {
    it('does not display previously selected templates details', () => {
      renderComponent();

      expect(
        screen.queryByTestId('previous-selection-details')
      ).not.toBeInTheDocument();
    });

    it('does not preselect any checkboxes', () => {
      renderComponent();

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        expect(checkbox).not.toBeChecked();
      }
    });

    it('renders correctly', () => {
      const container = renderComponent();
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when there are language templates preselected', () => {
    it('displays previously selected templates in details component', () => {
      const messagePlan = createMessagePlanWithLanguageTemplates([
        { templateId: FRENCH_LETTER_TEMPLATE.id, language: 'fr' },
        { templateId: POLISH_LETTER_TEMPLATE.id, language: 'pl' },
      ]);

      renderComponent({ messagePlan });

      const previouslySelected = screen.getByTestId(
        'previous-selection-details'
      );
      expect(previouslySelected).toBeInTheDocument();

      const previousSelectionTexts = screen.getAllByText(
        'Previously selected templates'
      );
      expect(previousSelectionTexts.length).toBeGreaterThan(0);

      expect(
        within(previouslySelected).getByText(FRENCH_LETTER_TEMPLATE.name)
      ).toBeInTheDocument();
      expect(
        within(previouslySelected).getByText(POLISH_LETTER_TEMPLATE.name)
      ).toBeInTheDocument();
    });

    it('preselects the correct checkboxes', () => {
      const messagePlan = createMessagePlanWithLanguageTemplates([
        { templateId: FRENCH_LETTER_TEMPLATE.id, language: 'fr' },
        { templateId: SPANISH_LETTER_TEMPLATE.id, language: 'es' },
      ]);

      renderComponent({ messagePlan });

      const checkboxes = screen.getAllByRole('checkbox');
      const frenchCheckbox = checkboxes.find(
        (checkbox) =>
          checkbox.getAttribute('name') ===
          `template_${FRENCH_LETTER_TEMPLATE.id}`
      );
      const polishCheckbox = checkboxes.find(
        (checkbox) =>
          checkbox.getAttribute('name') ===
          `template_${POLISH_LETTER_TEMPLATE.id}`
      );
      const spanishCheckbox = checkboxes.find(
        (checkbox) =>
          checkbox.getAttribute('name') ===
          `template_${SPANISH_LETTER_TEMPLATE.id}`
      );

      expect(frenchCheckbox).toBeChecked();
      expect(spanishCheckbox).toBeChecked();
      expect(polishCheckbox).not.toBeChecked();
    });

    it('renders correctly', () => {
      const messagePlan = createMessagePlanWithLanguageTemplates([
        { templateId: FRENCH_LETTER_TEMPLATE.id, language: 'fr' },
      ]);

      const container = renderComponent({ messagePlan });
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('error handling', () => {
    describe('when no template is selected', () => {
      it('displays error summary with missing selection hint text', () => {
        const mockUseActionState = jest.mocked(useActionState);
        mockUseActionState.mockReturnValueOnce([
          {
            messagePlan: ROUTING_CONFIG,
            pageHeading: 'Choose language letter templates',
            templateList: languageLetterTemplates,
            cascadeIndex: 3,
            errorState: {
              formErrors: ['You have not chosen any templates'],
            },
            errorType: 'missing',
          },
          jest.fn(),
          false,
        ]);

        const { container } = renderComponent();

        const errorSummary = container.querySelector(
          '.nhsuk-error-summary'
        ) as HTMLElement;

        const errorSummaryHeading = screen.getByTestId('error-summary');
        expect(errorSummaryHeading).toHaveTextContent('There is a problem');

        const errorSummaryHint = errorSummary.querySelector(
          '.nhsuk-hint'
        ) as HTMLElement;
        expect(errorSummaryHint).toHaveTextContent(
          'You have not chosen any templates'
        );
        const errorListItem = within(errorSummary).getByRole('listitem');
        expect(
          within(errorListItem).getByText('You have not chosen any templates')
        ).toBeInTheDocument();
      });

      it('displays error on language templates component', () => {
        const mockUseActionState = jest.mocked(useActionState);
        mockUseActionState.mockReturnValueOnce([
          {
            messagePlan: ROUTING_CONFIG,
            pageHeading: 'Choose language letter templates',
            templateList: languageLetterTemplates,
            cascadeIndex: 3,
            errorState: {
              fieldErrors: {
                'language-templates': ['Choose one or more templates'],
              },
            },
            errorType: 'missing',
          },
          jest.fn(),
          false,
        ]);

        const { container } = renderComponent();

        const formGroup = container.querySelector('.nhsuk-form-group');
        expect(formGroup).toHaveClass('nhsuk-form-group--error');

        const formErrorMessage = container.querySelector(
          '#language-templates--error-message'
        );
        expect(formErrorMessage).toHaveClass('nhsuk-error-message');
        expect(formErrorMessage).toHaveTextContent(
          'Choose one or more templates'
        );
      });

      it('renders correctly', () => {
        const mockUseActionState = jest.mocked(useActionState);
        mockUseActionState.mockReturnValueOnce([
          {
            messagePlan: ROUTING_CONFIG,
            pageHeading: 'Choose language letter templates',
            templateList: languageLetterTemplates,
            cascadeIndex: 3,
            errorState: {
              fieldErrors: {
                'language-templates': ['Choose one or more templates'],
              },
            },
            errorType: 'missing',
          },
          jest.fn(),
          false,
        ]);

        const container = renderComponent();
        expect(container.asFragment()).toMatchSnapshot();
      });
    });

    describe('when duplicate languages are selected', () => {
      it('displays error summary with duplicate language hint text', () => {
        const mockUseActionState = jest.mocked(useActionState);
        mockUseActionState.mockReturnValueOnce([
          {
            messagePlan: ROUTING_CONFIG,
            pageHeading: 'Choose language letter templates',
            templateList: languageLetterTemplates,
            cascadeIndex: 3,
            errorState: {
              fieldErrors: {
                'language-templates': [
                  'Choose only one template for each language',
                ],
              },
            },
            errorType: 'duplicate',
          },
          jest.fn(),
          false,
        ]);

        const { container } = renderComponent();

        const errorSummary = container.querySelector(
          '.nhsuk-error-summary'
        ) as HTMLElement;

        const errorSummaryHeading = screen.getByTestId('error-summary');
        expect(errorSummaryHeading).toHaveTextContent('There is a problem');

        const errorSummaryHint = errorSummary.querySelector(
          '.nhsuk-hint'
        ) as HTMLElement;
        expect(errorSummaryHint).toHaveTextContent(
          'You can only choose one template for each language'
        );

        const errorListItem = within(errorSummary).getByRole('listitem');
        expect(
          within(errorListItem).getByText(
            'Choose only one template for each language'
          )
        ).toBeInTheDocument();
      });

      it('displays form error for duplicate language selection', () => {
        const mockUseActionState = jest.mocked(useActionState);
        mockUseActionState.mockReturnValueOnce([
          {
            messagePlan: ROUTING_CONFIG,
            pageHeading: 'Choose language letter templates',
            templateList: languageLetterTemplates,
            cascadeIndex: 3,
            errorState: {
              fieldErrors: {
                'language-templates': [
                  'Choose only one template for each language',
                ],
              },
            },
            errorType: 'duplicate',
          },
          jest.fn(),
          false,
        ]);

        const { container } = renderComponent();

        const formGroup = container.querySelector('.nhsuk-form-group');
        expect(formGroup).toHaveClass('nhsuk-form-group--error');

        const formErrorMessage = container.querySelector(
          '#language-templates--error-message'
        );
        expect(formErrorMessage).toHaveClass('nhsuk-error-message');
        expect(formErrorMessage).toHaveTextContent(
          'Choose only one template for each language'
        );
      });

      it('renders correctly', () => {
        const mockUseActionState = jest.mocked(useActionState);
        mockUseActionState.mockReturnValueOnce([
          {
            messagePlan: ROUTING_CONFIG,
            pageHeading: 'Choose language letter templates',
            templateList: languageLetterTemplates,
            cascadeIndex: 3,
            errorState: {
              fieldErrors: {
                'language-templates': [
                  'Choose only one template for each language',
                ],
              },
            },
            errorType: 'duplicate',
          },
          jest.fn(),
          false,
        ]);

        const container = renderComponent();
        expect(container.asFragment()).toMatchSnapshot();
      });
    });
  });

  describe('form submission', () => {
    it('renders form with correct form-id hidden input', () => {
      const { container } = renderComponent();

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();

      const formIdInput = within(form!).getByDisplayValue(
        'choose-language-letter-templates'
      );
      expect(formIdInput).toHaveAttribute('name', 'form-id');
      expect(formIdInput).toHaveAttribute('type', 'hidden');
    });

    it('includes selected template IDs in form data when checkboxes are checked', () => {
      const { container } = renderComponent();

      const checkboxes = screen.getAllByRole('checkbox');
      const frenchCheckbox = checkboxes.find(
        (checkbox) =>
          checkbox.getAttribute('name') ===
          `template_${FRENCH_LETTER_TEMPLATE.id}`
      ) as HTMLInputElement;
      const polishCheckbox = checkboxes.find(
        (checkbox) =>
          checkbox.getAttribute('name') ===
          `template_${POLISH_LETTER_TEMPLATE.id}`
      ) as HTMLInputElement;
      const spanishCheckbox = checkboxes.find(
        (checkbox) =>
          checkbox.getAttribute('name') ===
          `template_${SPANISH_LETTER_TEMPLATE.id}`
      ) as HTMLInputElement;

      fireEvent.click(frenchCheckbox);
      fireEvent.click(polishCheckbox);

      expect(frenchCheckbox.checked).toBe(true);
      expect(polishCheckbox.checked).toBe(true);
      expect(spanishCheckbox.checked).toBe(false);

      const form = container.querySelector('form')!;
      const formData = new FormData(form);

      expect(formData.get('form-id')).toBe('choose-language-letter-templates');
      expect(formData.get(`template_${FRENCH_LETTER_TEMPLATE.id}`)).toBe(
        `${FRENCH_LETTER_TEMPLATE.id}:fr`
      );
      expect(formData.get(`template_${POLISH_LETTER_TEMPLATE.id}`)).toBe(
        `${POLISH_LETTER_TEMPLATE.id}:pl`
      );
      expect(formData.get(`template_${SPANISH_LETTER_TEMPLATE.id}`)).toBeNull();
    });

    it('submits form with selected templates when Save and continue is clicked', () => {
      const { container } = renderComponent();

      const checkboxes = screen.getAllByRole('checkbox');
      const frenchCheckbox = checkboxes.find(
        (checkbox) =>
          checkbox.getAttribute('name') ===
          `template_${FRENCH_LETTER_TEMPLATE.id}`
      ) as HTMLInputElement;
      const polishCheckbox = checkboxes.find(
        (checkbox) =>
          checkbox.getAttribute('name') ===
          `template_${POLISH_LETTER_TEMPLATE.id}`
      ) as HTMLInputElement;

      fireEvent.click(frenchCheckbox);
      fireEvent.click(polishCheckbox);

      const saveButton = screen.getByRole('button', {
        name: 'Save and continue',
      });

      const form = container.querySelector('form')!;
      let capturedFormData: FormData | null = null;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        capturedFormData = new FormData(form);
      });

      fireEvent.click(saveButton);

      expect(capturedFormData).not.toBeNull();
      expect(capturedFormData!.get('form-id')).toBe(
        'choose-language-letter-templates'
      );
      expect(
        capturedFormData!.get(`template_${FRENCH_LETTER_TEMPLATE.id}`)
      ).toBe(`${FRENCH_LETTER_TEMPLATE.id}:fr`);
      expect(
        capturedFormData!.get(`template_${POLISH_LETTER_TEMPLATE.id}`)
      ).toBe(`${POLISH_LETTER_TEMPLATE.id}:pl`);
      expect(
        capturedFormData!.get(`template_${SPANISH_LETTER_TEMPLATE.id}`)
      ).toBeNull();
    });
  });
});
