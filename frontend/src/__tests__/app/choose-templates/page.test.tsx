import ChooseTemplatesPage from '@app/message-plans/choose-templates/[routingConfigId]/page';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getRoutingConfig,
  getMessagePlanTemplates,
} from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';
import {
  CascadeItem,
  Channel,
  ConditionalTemplateLanguage,
  RoutingConfig,
} from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import {
  channelDisplayMappings,
  ORDINALS,
} from 'nhs-notify-web-template-management-utils';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { MessagePlanTemplates } from '@utils/routing-utils';
import {
  NextRedirectBoundary,
  NextRedirectError,
} from '@testhelpers/next-redirect';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');
jest.mock('@utils/csrf-utils');
jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);

const routingConfigId = 'fbb81055-79b9-4759-ac07-d191ae57be34';
const appTemplateId = 'd3a2c6ba-438a-4bf4-b94a-7c64c6528e7f';
const smsTemplateId = '5f7c3e1d-9b1a-4d3a-8f3e-2c6b8e9f1a2b';
const emailTemplateId = '1d5bba4a-da2f-4409-8bab-9d9baf2f5774';
const letterTemplateId = '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d';
const frenchLetterTemplateId = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d';
const spanishLetterTemplateId = '6d5c4b3a-2f1e-0d9c-8b7a-6f5e4d3c2b1a';
const largePrintLetterTemplateId = 'cdee1708-e68d-45de-bb4c-4e193dd21012';

const mockRoutingConfig = (): RoutingConfig => ({
  id: routingConfigId,
  name: 'Autumn Campaign Plan',
  status: 'DRAFT',
  clientId: 'client-1',
  campaignId: 'campaign-2',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  cascadeGroupOverrides: [],
  cascade: [
    {
      cascadeGroups: ['standard'],
      channel: 'NHSAPP',
      channelType: 'primary',
      defaultTemplateId: appTemplateId,
    },
    {
      cascadeGroups: ['standard'],
      channel: 'SMS',
      channelType: 'primary',
      defaultTemplateId: smsTemplateId,
    },
    {
      cascadeGroups: ['standard'],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: null,
    },
    {
      cascadeGroups: ['standard'],
      channel: 'LETTER',
      channelType: 'primary',
      defaultTemplateId: letterTemplateId,
      conditionalTemplates: [
        {
          language: 'fr',
          templateId: frenchLetterTemplateId,
        },
        {
          language: 'es',
          templateId: spanishLetterTemplateId,
        },
      ],
    },
  ],
  lockNumber: 0,
  defaultCascadeGroup: 'standard',
});

const templates: MessagePlanTemplates = {
  [appTemplateId]: { ...NHS_APP_TEMPLATE, id: appTemplateId },
  [emailTemplateId]: { ...EMAIL_TEMPLATE, id: emailTemplateId },
  [smsTemplateId]: { ...SMS_TEMPLATE, id: smsTemplateId },
  [letterTemplateId]: {
    ...PDF_LETTER_TEMPLATE,
    id: letterTemplateId,
  },
  [frenchLetterTemplateId]: {
    ...PDF_LETTER_TEMPLATE,
    name: 'French Letter Template',
    id: frenchLetterTemplateId,
  },
  [spanishLetterTemplateId]: {
    ...PDF_LETTER_TEMPLATE,
    name: 'Spanish Letter Template',
    id: spanishLetterTemplateId,
  },
  [largePrintLetterTemplateId]: {
    ...PDF_LETTER_TEMPLATE,
    name: 'Large Print Letter Template',
    id: largePrintLetterTemplateId,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getRoutingConfig).mockResolvedValue(mockRoutingConfig());
  jest.mocked(getMessagePlanTemplates).mockResolvedValue(templates);
});

describe('ChooseTemplatesPage', () => {
  it('should redirect to invalid page when routing config not found', async () => {
    jest.mocked(getRoutingConfig).mockResolvedValue(undefined);

    await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: 'invalid-id' }),
    });

    expect(redirect).toHaveBeenCalledWith(
      '/message-plans/invalid',
      RedirectType.replace
    );
  });

  it('should redirect to preview when status is COMPLETED', async () => {
    const routingConfig: RoutingConfig = {
      ...mockRoutingConfig(),
      status: 'COMPLETED',
    };

    jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

    await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId }),
    });

    expect(redirect).toHaveBeenCalledWith(
      `/message-plans/preview-message-plan/${routingConfigId}`,
      RedirectType.replace
    );
  });

  it('renders correctly for a message plan with multiple templates (snapshot)', async () => {
    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId }),
    });

    expect(render(page).asFragment()).toMatchSnapshot();
  });

  it('should render message plan details', async () => {
    const routingConfig = mockRoutingConfig();

    jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId }),
    });

    render(page);

    expect(screen.getByTestId('routing-config-name')).toHaveTextContent(
      routingConfig.name
    );
    expect(screen.getByTestId('routing-config-id')).toHaveTextContent(
      routingConfig.id
    );
    expect(screen.getByTestId('campaign-id')).toHaveTextContent(
      routingConfig.campaignId
    );
  });

  it('should render CTAs for both saving and moving to production', async () => {
    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId }),
    });

    render(page);

    const formGroup = screen.getByTestId('message-plan-actions');
    const buttons = within(formGroup).getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('Move to production');
    expect(buttons[1].textContent).toBe('Save and close');
  });

  it('should render an "edit settings" link', async () => {
    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId }),
    });

    render(page);

    const link = screen.getByTestId('edit-settings-link');
    expect(link.textContent).toBe('Edit settings');
    expect(link.getAttribute('href')).toBe(
      `/message-plans/edit-message-plan-settings/${routingConfigId}`
    );
  });

  it('should render the channel list with a block and fallback for each cascade item', async () => {
    const routingConfig = mockRoutingConfig();

    jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId }),
    });

    const { container } = render(page);

    const messagePlanChannelList = container.querySelector(
      'ul.channel-list'
    ) as HTMLUListElement;

    const cascade = [...routingConfig.cascade.entries()];

    const expectedTestIds: string[] = [];

    // Build the expected ordered list of test ids of the list items
    for (const [index, { channel }] of cascade) {
      expectedTestIds.push(`message-plan-block-${channel}`);
      if (index < cascade.length - 1) {
        expectedTestIds.push(`message-plan-fallback-conditions-${channel}`);
      }
    }

    // Get the testids that are actually present
    const listItemsTestIds = [
      ...(messagePlanChannelList.children as HTMLCollectionOf<HTMLElement>),
    ].map((el) => el.dataset.testid);

    // Check that the actual matches the expected
    expect(listItemsTestIds).toEqual(expectedTestIds);

    const blockTestIds = expectedTestIds.filter((id) =>
      id.startsWith('message-plan-block')
    );

    // Now check each block individually
    for (const [index, id] of blockTestIds.entries()) {
      const block = screen.getByTestId(id);

      const cascadeItem = routingConfig.cascade[index];

      const stepNumber = block.querySelector('.message-plan-block-number');
      expect(stepNumber).toHaveTextContent(String(index + 1));

      expect(
        within(block).getByRole('heading', { level: 2 })
      ).toHaveTextContent(`${ORDINALS[index]} message`);

      const card = within(block).getByTestId(
        `channel-template-${cascadeItem.channel}`
      );

      expect(
        within(card).getByRole('heading', {
          level: 3,
        })
      ).toHaveTextContent(channelDisplayMappings(cascadeItem.channel));
    }
  });

  const digitalChannels: [Channel, string, string, string][] = [
    ['NHSAPP', 'NHS App', 'nhs-app', appTemplateId],
    ['SMS', 'Text message (SMS)', 'text-message', smsTemplateId],
    ['EMAIL', 'Email', 'email', emailTemplateId],
  ];

  describe.each(digitalChannels)(
    'single digital channel - %s',
    (channel, display, url, templateId) => {
      it('if the template is set, shows name along with change and remove links', async () => {
        const routingConfig = mockRoutingConfig();

        routingConfig.cascade = routingConfig.cascade.filter(
          (item) => item.channel === channel
        );

        for (const item of routingConfig.cascade) {
          item.defaultTemplateId = templateId;
        }

        jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

        const page = await ChooseTemplatesPage({
          params: Promise.resolve({ routingConfigId }),
        });

        render(page);

        const card = screen.getByTestId(`channel-template-${channel}`);

        expect(
          within(card).getByTestId(`template-name-${channel}`)
        ).toHaveTextContent(templates[templateId].name);

        const changeLink = within(card).getByRole('link', {
          name: `Change ${display} template`,
        });
        expect(changeLink).toHaveAttribute(
          'href',
          `/message-plans/choose-${url}-template/${routingConfigId}?lockNumber=${routingConfig.lockNumber}`
        );

        const removeButton = within(card).getByRole('button', {
          name: `Remove ${display} template`,
        });

        const form = removeButton.closest('form');

        expect(form).toBeInTheDocument();

        const routingConfigIdInput = form?.querySelector(
          'input[name="routingConfigId"]'
        );
        const templateIdInput = form?.querySelector('input[name="templateId"]');
        const lockNumberInput = form?.querySelector('input[name="lockNumber"]');

        expect(routingConfigIdInput).toHaveAttribute('type', 'hidden');
        expect(routingConfigIdInput).toHaveAttribute('value', routingConfigId);
        expect(templateIdInput).toHaveAttribute('type', 'hidden');
        expect(templateIdInput).toHaveAttribute('value', templateId);
        expect(lockNumberInput).toHaveAttribute('type', 'hidden');
        expect(lockNumberInput).toHaveAttribute(
          'value',
          String(routingConfig.lockNumber)
        );

        expect(
          within(card).queryByRole('link', {
            name: `Choose ${display} template`,
          })
        ).not.toBeInTheDocument();
      });

      it('if the template is unset, shows choose link', async () => {
        const routingConfig = mockRoutingConfig();

        routingConfig.cascade = routingConfig.cascade.filter(
          (item) => item.channel === channel
        );

        for (const item of routingConfig.cascade) {
          item.defaultTemplateId = null;
        }

        jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

        const page = await ChooseTemplatesPage({
          params: Promise.resolve({ routingConfigId }),
        });

        render(page);

        const card = screen.getByTestId(`channel-template-${channel}`);

        expect(
          within(card).queryByTestId(`template-name-${channel}`)
        ).not.toBeInTheDocument();

        expect(
          within(card).queryByRole('link', {
            name: `Change ${display} template`,
          })
        ).not.toBeInTheDocument();

        expect(
          within(card).queryByRole('button', {
            name: `Remove ${display} template`,
          })
        ).not.toBeInTheDocument();

        expect(within(card).queryByRole('form')).not.toBeInTheDocument();

        const chooseLink = within(card).getByRole('link', {
          name: `Choose ${display} template`,
        });

        expect(chooseLink).toHaveAttribute(
          'href',
          `/message-plans/choose-${url}-template/${routingConfigId}?lockNumber=${routingConfig.lockNumber}`
        );
      });
    }
  );

  describe('letter channel only', () => {
    it('renders fallback conditions, template names, change and remove links for english, foreign languages and all accessible formats when templates are set', async () => {
      const routingConfig = mockRoutingConfig();

      const cascade: CascadeItem[] = [];

      const conditionalLanguageTemplates: ConditionalTemplateLanguage[] = [
        {
          language: 'fr',
          templateId: frenchLetterTemplateId,
        },
        {
          language: 'es',
          templateId: spanishLetterTemplateId,
        },
      ];

      for (const item of routingConfig.cascade) {
        if (item.channel === 'LETTER') {
          item.conditionalTemplates = [
            ...conditionalLanguageTemplates,
            {
              accessibleFormat: 'x1',
              templateId: largePrintLetterTemplateId,
            },
          ];

          cascade.push(item);
        }
      }

      routingConfig.cascade = cascade;

      jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

      const page = await ChooseTemplatesPage({
        params: Promise.resolve({ routingConfigId }),
      });

      render(page);

      const letterBlock = screen.getByTestId('message-plan-block-LETTER');

      // Standard English

      const standardEnglishCard = within(letterBlock).getByTestId(
        'channel-template-LETTER'
      );

      expect(
        within(standardEnglishCard).getByTestId('template-name-LETTER')
      ).toHaveTextContent(templates[letterTemplateId].name);

      const standardEnglishChangeLink = within(standardEnglishCard).getByRole(
        'link',
        {
          name: 'Change Standard English letter template',
        }
      );
      expect(standardEnglishChangeLink).toHaveAttribute(
        'href',
        `/message-plans/choose-standard-english-letter-template/${routingConfigId}?lockNumber=${routingConfig.lockNumber}`
      );

      expect(
        within(standardEnglishCard).getByRole('button', {
          name: 'Remove Standard English letter template',
        })
      ).toBeInTheDocument();

      expect(
        within(standardEnglishCard).queryByRole('link', {
          name: `Choose Standard English letter template`,
        })
      ).not.toBeInTheDocument();

      // Conditional Templates

      const conditionalTemplatesBlock = screen.getByTestId(
        'message-plan-conditional-templates'
      );

      expect(
        within(conditionalTemplatesBlock).getByTestId(
          'message-plan-fallback-conditions-LETTER'
        )
      ).toBeInTheDocument();

      // Large Print

      const largePrintCard = within(conditionalTemplatesBlock).getByTestId(
        'channel-template-x1'
      );

      expect(
        within(largePrintCard).getByRole('heading', {
          level: 3,
          name: 'Large print letter (optional)',
        })
      ).toBeInTheDocument();

      expect(
        within(largePrintCard).getByTestId('template-name-x1')
      ).toHaveTextContent(templates[largePrintLetterTemplateId].name);

      const largePrintChangeLink = within(largePrintCard).getByRole('link', {
        name: 'Change Large print letter template',
      });

      expect(largePrintChangeLink).toHaveAttribute(
        'href',
        `/message-plans/choose-large-print-letter-template/${routingConfigId}?lockNumber=${routingConfig.lockNumber}`
      );

      expect(
        within(largePrintCard).getByRole('button', {
          name: 'Remove Large print letter template',
        })
      ).toBeInTheDocument();

      expect(
        within(largePrintCard).queryByRole('link', {
          name: `Choose Large print letter template`,
        })
      ).not.toBeInTheDocument();

      // Languages

      const languagesCard = within(conditionalTemplatesBlock).getByTestId(
        'channel-template-foreign-language'
      );

      expect(
        within(languagesCard).getByRole('heading', {
          level: 3,
          name: 'Other language letters (optional)',
        })
      ).toBeInTheDocument();

      const languageTemplateNames = within(languagesCard).getAllByTestId(
        'template-name-foreign-language'
      );

      expect(languageTemplateNames).toHaveLength(2);
      expect(languageTemplateNames[0]).toHaveTextContent(
        templates[frenchLetterTemplateId].name
      );
      expect(languageTemplateNames[1]).toHaveTextContent(
        templates[spanishLetterTemplateId].name
      );

      const languageChangeLink = within(languagesCard).getByRole('link', {
        name: 'Change Other language letters templates',
      });

      expect(languageChangeLink).toHaveAttribute(
        'href',
        `/message-plans/choose-other-language-letter-template/${routingConfigId}?lockNumber=${routingConfig.lockNumber}`
      );

      expect(
        within(languagesCard).getByRole('button', {
          name: 'Remove all Other language letters templates',
        })
      ).toBeInTheDocument();

      expect(
        within(languagesCard).queryByRole('link', {
          name: `Choose Other language letters templates`,
        })
      ).not.toBeInTheDocument();
    });

    it('renders choose links for english, foreign languages and all accessible formats when templates are not set', async () => {
      const routingConfig = mockRoutingConfig();

      const cascade: CascadeItem[] = [];

      for (const item of routingConfig.cascade) {
        if (item.channel === 'LETTER') {
          item.defaultTemplateId = null;
          item.conditionalTemplates = [];
          cascade.push(item);
        }
      }

      routingConfig.cascade = cascade;

      jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

      const page = await ChooseTemplatesPage({
        params: Promise.resolve({ routingConfigId }),
      });

      render(page);

      const letterBlock = screen.getByTestId('message-plan-block-LETTER');

      // Standard English

      const standardEnglishCard = within(letterBlock).getByTestId(
        'channel-template-LETTER'
      );

      expect(
        within(standardEnglishCard).queryByTestId('template-name-LETTER')
      ).not.toBeInTheDocument();

      expect(
        within(standardEnglishCard).queryByRole('link', {
          name: 'Change Standard English letter template',
        })
      ).not.toBeInTheDocument();

      expect(
        within(standardEnglishCard).queryByRole('button', {
          name: 'Remove Standard English letter template',
        })
      ).not.toBeInTheDocument();

      const standardEnglishChooseLink = within(standardEnglishCard).getByRole(
        'link',
        {
          name: 'Choose Standard English letter template',
        }
      );
      expect(standardEnglishChooseLink).toHaveAttribute(
        'href',
        `/message-plans/choose-standard-english-letter-template/${routingConfigId}?lockNumber=${routingConfig.lockNumber}`
      );

      // Conditional Templates

      const conditionalTemplatesBlock = screen.getByTestId(
        'message-plan-conditional-templates'
      );

      expect(
        within(conditionalTemplatesBlock).getByTestId(
          'message-plan-fallback-conditions-LETTER'
        )
      ).toBeInTheDocument();

      // Large Print

      const largePrintCard = within(conditionalTemplatesBlock).getByTestId(
        'channel-template-x1'
      );

      expect(
        within(largePrintCard).getByRole('heading', {
          level: 3,
          name: 'Large print letter (optional)',
        })
      ).toBeInTheDocument();

      expect(
        within(largePrintCard).queryByTestId('template-name-x1')
      ).not.toBeInTheDocument();

      expect(
        within(largePrintCard).queryByRole('link', {
          name: 'Change Large print letter template',
        })
      ).not.toBeInTheDocument();

      expect(
        within(largePrintCard).queryByRole('button', {
          name: 'Remove Large print letter template',
        })
      ).not.toBeInTheDocument();

      const largePrintChooseLink = within(largePrintCard).getByRole('link', {
        name: 'Choose Large print letter template',
      });

      expect(largePrintChooseLink).toHaveAttribute(
        'href',
        `/message-plans/choose-large-print-letter-template/${routingConfigId}?lockNumber=${routingConfig.lockNumber}`
      );

      // Languages

      const languagesCard = within(conditionalTemplatesBlock).getByTestId(
        'channel-template-foreign-language'
      );

      expect(
        within(languagesCard).getByRole('heading', {
          level: 3,
          name: 'Other language letters (optional)',
        })
      ).toBeInTheDocument();

      expect(
        within(languagesCard).queryByTestId('template-name-foreign-language')
      ).not.toBeInTheDocument();

      expect(
        within(languagesCard).queryByRole('link', {
          name: 'Change Other language letters templates',
        })
      ).not.toBeInTheDocument();

      expect(
        within(languagesCard).queryByRole('button', {
          name: 'Remove all Other language letters templates',
        })
      ).not.toBeInTheDocument();

      const languageChooseLink = within(languagesCard).getByRole('link', {
        name: 'Choose Other language letters templates',
      });

      expect(languageChooseLink).toHaveAttribute(
        'href',
        `/message-plans/choose-other-language-letter-template/${routingConfigId}?lockNumber=${routingConfig.lockNumber}`
      );
    });
  });

  describe('validation', () => {
    it('should not display error summary when all channels have templates', async () => {
      const user = userEvent.setup();

      const routingConfig = mockRoutingConfig();

      routingConfig.cascade = routingConfig.cascade.filter(
        (item) => item.defaultTemplateId !== null
      );

      jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

      jest.mocked(redirect).mockImplementation((url, type) => {
        throw new NextRedirectError(url, type);
      });

      const page = await ChooseTemplatesPage({
        params: Promise.resolve({ routingConfigId }),
      });

      render(<NextRedirectBoundary>{page}</NextRedirectBoundary>);

      const moveToProductionButton = screen.getByTestId(
        'move-to-production-cta'
      );
      await user.click(moveToProductionButton);

      const errorSummary = screen.queryByRole('alert');

      expect(errorSummary).not.toBeInTheDocument();

      expect(redirect).toHaveBeenCalledWith(
        `/message-plans/get-ready-to-move/${routingConfigId}`
      );
    });

    it('should show error summary when a channel is missing a template', async () => {
      const user = userEvent.setup();

      const page = await ChooseTemplatesPage({
        params: Promise.resolve({ routingConfigId }),
      });

      render(page);

      const moveToProductionButton = screen.getByTestId(
        'move-to-production-cta'
      );
      await user.click(moveToProductionButton);

      const errorSummary = screen.getByRole('alert');

      expect(
        within(errorSummary).getByTestId('error-summary')
      ).toHaveTextContent('There is a problem');

      const hintText = errorSummary.querySelector('.nhsuk-hint');
      expect(hintText).toHaveTextContent(
        'You must choose a template for each message.'
      );
      const errorLink = within(errorSummary).getByRole('link', {
        name: 'You have not chosen a template for your third message',
      });
      expect(errorLink).toBeInTheDocument();
      expect(errorLink).toHaveAttribute('href', '#channel-EMAIL');
    });

    it('should show multiple errors when multiple channels are missing templates', async () => {
      const user = userEvent.setup();

      const routingConfig = mockRoutingConfig();

      for (const cascadeItem of routingConfig.cascade) {
        cascadeItem.defaultTemplateId = null;
      }

      jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

      const page = await ChooseTemplatesPage({
        params: Promise.resolve({ routingConfigId }),
      });

      render(page);

      const moveToProductionButton = screen.getByTestId(
        'move-to-production-cta'
      );
      await user.click(moveToProductionButton);

      const errorLinks = screen.getAllByRole('link', {
        name: /You have not chosen a template for your/,
      });
      expect(errorLinks).toHaveLength(4);
      expect(errorLinks[0]).toHaveTextContent(
        'You have not chosen a template for your first message'
      );
      expect(errorLinks[0]).toHaveAttribute('href', '#channel-NHSAPP');

      expect(errorLinks[1]).toHaveTextContent(
        'You have not chosen a template for your second message'
      );
      expect(errorLinks[1]).toHaveAttribute('href', '#channel-SMS');

      expect(errorLinks[2]).toHaveTextContent(
        'You have not chosen a template for your third message'
      );
      expect(errorLinks[2]).toHaveAttribute('href', '#channel-EMAIL');

      expect(errorLinks[3]).toHaveTextContent(
        'You have not chosen a template for your fourth message'
      );
      expect(errorLinks[3]).toHaveAttribute('href', '#channel-LETTER');
    });

    it('should match snapshot when displaying validation errors', async () => {
      const user = userEvent.setup();

      const routingConfig = mockRoutingConfig();

      for (const cascadeItem of routingConfig.cascade) {
        cascadeItem.defaultTemplateId = null;
      }

      jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

      const page = await ChooseTemplatesPage({
        params: Promise.resolve({ routingConfigId }),
      });

      const { asFragment } = render(page);

      const moveToProductionButton = screen.getByTestId(
        'move-to-production-cta'
      );
      await user.click(moveToProductionButton);

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
