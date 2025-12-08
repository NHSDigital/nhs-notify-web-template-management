import { ChooseChannelTemplate } from '@forms/ChooseChannelTemplate';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  EMAIL_TEMPLATE,
  LARGE_PRINT_LETTER_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  ROUTING_CONFIG,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import { useActionState } from 'react';
import { ChooseChannelTemplateFormState } from '@forms/ChooseChannelTemplate/server-action';
import { usePathname } from 'next/navigation';
import { LetterType } from 'nhs-notify-backend-client';

jest.mock('next/navigation');

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: jest
      .fn()
      .mockImplementation(
        (
          _: (
            formState: ChooseChannelTemplateFormState,
            formData: FormData
          ) => Promise<ChooseChannelTemplateFormState>,
          initialState: ChooseChannelTemplateFormState
        ) => [initialState, '/action']
      ),
  };
});

jest
  .mocked(usePathname)
  .mockReturnValue('message-plans/choose-email-template/testid');

const createEmptyMessagePlan = (channel: string, cascadeIndex = 0) => {
  const emptyCascade = {
    cascadeGroups: ['standard'],
    channel,
    channelType: 'primary' as const,
    defaultTemplateId: null,
  };

  const cascade = Array.from({ length: cascadeIndex + 1 }, (_, i) => {
    if (i === cascadeIndex) {
      return emptyCascade;
    }
    return ROUTING_CONFIG.cascade[i] || emptyCascade;
  });

  return {
    ...ROUTING_CONFIG,
    cascade,
  };
};

const createMessagePlanWithConditionalTemplate = (
  templateId: string,
  accessibleFormat: Exclude<LetterType, 'x0'>
) => ({
  ...ROUTING_CONFIG,
  cascade: [
    ...ROUTING_CONFIG.cascade.slice(0, 3),
    {
      ...ROUTING_CONFIG.cascade[3],
      conditionalTemplates: [
        {
          templateId,
          accessibleFormat,
        },
      ],
    },
  ],
});

const propsByChannel = {
  NHSAPP: {
    pageHeading: 'Choose an NHS App template',
    cascadeIndex: 0,
    templateList: [NHS_APP_TEMPLATE],
  },
  EMAIL: {
    pageHeading: 'Choose an email template',
    cascadeIndex: 1,
    templateList: [EMAIL_TEMPLATE],
  },
  SMS: {
    pageHeading: 'Choose a text message (SMS) template',
    cascadeIndex: 2,
    templateList: [SMS_TEMPLATE],
  },
  LETTER: {
    pageHeading: 'Choose a letter template',
    cascadeIndex: 3,
    templateList: [LETTER_TEMPLATE],
  },
  LARGE_PRINT_LETTER: {
    pageHeading: 'Choose a large print letter template',
    cascadeIndex: 3,
    templateList: [LARGE_PRINT_LETTER_TEMPLATE],
    accessibleFormat: 'x1' as Exclude<LetterType, 'x0'>,
  },
};

const renderComponent = (overrides = {}) => {
  const defaultProps = {
    messagePlan: ROUTING_CONFIG,
    ...propsByChannel.NHSAPP,
  };

  return render(<ChooseChannelTemplate {...defaultProps} {...overrides} />);
};

const nhsAppTemplates = [
  NHS_APP_TEMPLATE,
  {
    ...NHS_APP_TEMPLATE,
    id: 'template-2',
    name: 'Second template',
  },
  {
    ...NHS_APP_TEMPLATE,
    id: 'template-3',
    name: 'Third template',
  },
];

const largePrintLetterTemplates = [
  {
    ...LARGE_PRINT_LETTER_TEMPLATE,
    id: 'large-print-template-2',
    name: 'Second large print template',
  },
  LARGE_PRINT_LETTER_TEMPLATE,
  {
    ...LARGE_PRINT_LETTER_TEMPLATE,
    id: 'large-print-template-3',
    name: 'Third large print template',
  },
];

describe('ChooseChannelTemplate', () => {
  it('displays correct message plan name', () => {
    renderComponent();

    expect(screen.getByText(ROUTING_CONFIG.name)).toBeInTheDocument();
  });

  it('displays correct page heading', () => {
    const heading = 'Choose a large print letter template';
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

    const backLinks = screen.getAllByRole('link', { name: 'Go back' });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks[0]).toHaveAttribute(
      'href',
      `/message-plans/choose-templates/${ROUTING_CONFIG.id}`
    );
  });

  describe('when templates are available', () => {
    it('displays correct number of templates', () => {
      renderComponent({
        templateList: nhsAppTemplates,
      });

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(nhsAppTemplates.length);

      const table = screen.getByTestId('channel-templates-table');
      expect(
        within(table).getByText(nhsAppTemplates[0].name)
      ).toBeInTheDocument();
      expect(
        within(table).getByText(nhsAppTemplates[1].name)
      ).toBeInTheDocument();
      expect(
        within(table).getByText(nhsAppTemplates[2].name)
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

    it('renders multiple options', () => {
      const container = renderComponent({
        templateList: nhsAppTemplates,
      });
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when there are no templates', () => {
    it('displays "You do not have any templates" message', () => {
      renderComponent({
        messagePlan: createEmptyMessagePlan('NHSAPP'),
        templateList: [],
      });

      expect(
        screen.getByText('You do not have any templates yet.')
      ).toBeInTheDocument();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });

    it('displays "Go to templates" link', () => {
      renderComponent({
        messagePlan: createEmptyMessagePlan('NHSAPP'),
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
        messagePlan: createEmptyMessagePlan('NHSAPP'),
        templateList: [],
      });
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when there is no template preselected', () => {
    it('does not display previously selected template summary', () => {
      renderComponent({
        messagePlan: createEmptyMessagePlan('EMAIL', 1),
        ...propsByChannel.EMAIL,
      });

      expect(
        screen.queryByTestId('previous-selection-details')
      ).not.toBeInTheDocument();
    });

    it('does not preselect any radio button', () => {
      renderComponent({
        messagePlan: createEmptyMessagePlan('EMAIL', 1),
        ...propsByChannel.EMAIL,
      });

      const radio = screen.getByRole('radio');
      expect(radio).not.toBeChecked();
    });

    it('renders correctly', () => {
      const container = renderComponent({
        messagePlan: createEmptyMessagePlan('NHSAPP'),
      });
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when there is a default template selected', () => {
    it('displays previously selected template', () => {
      renderComponent();

      const summary = screen.getByTestId('previous-selection-details');
      expect(summary).toBeInTheDocument();
      expect(
        screen.getByText('Previously selected template')
      ).toBeInTheDocument();
      expect(
        within(summary).getByText(NHS_APP_TEMPLATE.name)
      ).toBeInTheDocument();
    });

    it('preselects the correct radio button', () => {
      const cascadeIndex = 0;

      renderComponent({
        templateList: nhsAppTemplates,
        cascadeIndex,
      });

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);

      const selectedTemplate =
        ROUTING_CONFIG.cascade[cascadeIndex].defaultTemplateId;

      const selectedRadio = radios.find(
        (radio) => (radio as HTMLInputElement).value === selectedTemplate
      );
      expect(selectedRadio).toBeChecked();

      const unselectedRadios = radios.filter(
        (radio) => (radio as HTMLInputElement).value !== selectedTemplate
      );
      for (const radio of unselectedRadios) {
        expect(radio).not.toBeChecked();
      }
    });

    it('renders correctly', () => {
      const container = renderComponent({
        templateList: nhsAppTemplates,
      });
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when there is a conditional template selected', () => {
    it('displays previously selected template summary', () => {
      renderComponent({
        ...propsByChannel.LARGE_PRINT_LETTER,
        templateList: largePrintLetterTemplates,
        messagePlan: createMessagePlanWithConditionalTemplate(
          LARGE_PRINT_LETTER_TEMPLATE.id,
          'x1'
        ),
      });

      const summary = screen.getByTestId('previous-selection-details');

      expect(summary).toBeInTheDocument();
      expect(
        screen.getByText('Previously selected template')
      ).toBeInTheDocument();
      expect(
        within(summary).getByText('large print letter template name')
      ).toBeInTheDocument();
    });

    it('preselects the correct radio button', () => {
      renderComponent({
        ...propsByChannel.LARGE_PRINT_LETTER,
        templateList: largePrintLetterTemplates,
        messagePlan: createMessagePlanWithConditionalTemplate(
          LARGE_PRINT_LETTER_TEMPLATE.id,
          'x1'
        ),
      });

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);

      const selectedTemplateId = LARGE_PRINT_LETTER_TEMPLATE.id;

      const selectedRadio = radios.find(
        (radio) => (radio as HTMLInputElement).value === selectedTemplateId
      );
      expect(selectedRadio).toBeChecked();

      const unselectedRadios = radios.filter(
        (radio) => (radio as HTMLInputElement).value !== selectedTemplateId
      );
      for (const radio of unselectedRadios) {
        expect(radio).not.toBeChecked();
      }
    });

    it('renders correctly', () => {
      const container = renderComponent({
        ...propsByChannel.LARGE_PRINT_LETTER,
        templateList: largePrintLetterTemplates,
        messagePlan: createMessagePlanWithConditionalTemplate(
          LARGE_PRINT_LETTER_TEMPLATE.id,
          'x1'
        ),
      });
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  it('renders nhs app form', () => {
    const container = renderComponent();
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders email form', () => {
    const container = renderComponent(propsByChannel.EMAIL);
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders sms form', () => {
    const container = renderComponent(propsByChannel.SMS);
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders letter form', () => {
    const container = renderComponent(propsByChannel.LETTER);
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders large print letter form with accessibleFormat x1', () => {
    const container = renderComponent({
      ...propsByChannel.LARGE_PRINT_LETTER,
      messagePlan: createEmptyMessagePlan('LETTER', 3),
      accessibleFormat: 'x1' as Exclude<LetterType, 'x0'>,
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders error component', () => {
    const mockUseActionState = jest.fn().mockReturnValue([
      {
        errorState: {
          formErrors: [],
          fieldErrors: {
            channelTemplate: ['You must select a template'],
          },
        },
      },
      '/action',
    ]);

    jest.mocked(useActionState).mockImplementation(mockUseActionState);

    const container = renderComponent({
      messagePlan: createEmptyMessagePlan('NHSAPP'),
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers', () => {
    const container = renderComponent({
      messagePlan: createEmptyMessagePlan('NHSAPP'),
    });
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
