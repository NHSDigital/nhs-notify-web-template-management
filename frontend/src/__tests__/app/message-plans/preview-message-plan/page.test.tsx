import { redirect, RedirectType } from 'next/navigation';
import { render, screen, within } from '@testing-library/react';

import {
  Channel,
  RoutingConfig,
} from 'nhs-notify-web-template-management-types';
import {
  DigitalTemplate,
  ORDINALS,
} from 'nhs-notify-web-template-management-utils';
import {
  EMAIL_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import { RoutingConfigFactory } from '@testhelpers/routing-config-factory';
import {
  getMessagePlanTemplates,
  getRoutingConfig,
} from '@utils/message-plans';
import type { MessagePlanTemplates } from '@utils/routing-utils';

import PreviewMessagePlanPage, {
  metadata,
} from '@app/message-plans/preview-message-plan/[routingConfigId]/page';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');

function createRoutingConfig(data?: Partial<RoutingConfig>) {
  return RoutingConfigFactory.create({
    id: '39ee95ca-0500-4fe0-b1d6-c7f1b28bc267',
    campaignId: '042774eb-b2c0-4c63-856a-39f7fc31ad7f',
    status: 'COMPLETED',
    ...data,
  });
}

async function renderPage(routingConfig?: RoutingConfig, id?: string) {
  jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

  const page = await PreviewMessagePlanPage({
    params: Promise.resolve({ routingConfigId: id ?? routingConfig?.id ?? '' }),
  });

  return render(page);
}

const appTemplateId = '8f9df705-fa06-4882-a7ca-02a257fbeb60';
const emailTemplateId = 'e1095ace-6c32-476b-9467-89e60323c7c4';
const smsTemplateId = '920f7ad7-8cf6-4dfb-a08d-a7782860375e';
const letterTemplateId = '278e1a92-353f-42a3-b08d-565ea1c9d763';
const kuTemplateId = '31399023-08a2-4dc7-81c7-e25b284b2aab';
const sqTemplateId = '35746144-cac4-4e1f-b92b-4f58e9f1154f';
const largePrintTemplateId = '72ebc15c-d950-4e2e-99d4-3de7f174fba6';

const templates: MessagePlanTemplates = {
  [appTemplateId]: {
    ...NHS_APP_TEMPLATE,
    id: appTemplateId,
    templateStatus: 'SUBMITTED',
  },
  [emailTemplateId]: {
    ...EMAIL_TEMPLATE,
    id: emailTemplateId,
    templateStatus: 'SUBMITTED',
  },
  [smsTemplateId]: {
    ...SMS_TEMPLATE,
    id: smsTemplateId,
    templateStatus: 'SUBMITTED',
  },
  [letterTemplateId]: {
    ...PDF_LETTER_TEMPLATE,
    id: letterTemplateId,
    templateStatus: 'SUBMITTED',
  },
  [kuTemplateId]: {
    ...PDF_LETTER_TEMPLATE,
    id: kuTemplateId,
    templateStatus: 'SUBMITTED',
  },
  [sqTemplateId]: {
    ...PDF_LETTER_TEMPLATE,
    id: sqTemplateId,
    templateStatus: 'SUBMITTED',
  },
  [largePrintTemplateId]: {
    ...PDF_LETTER_TEMPLATE,
    id: largePrintTemplateId,
    templateStatus: 'SUBMITTED',
  },
};

beforeEach(() => {
  jest.mocked(getMessagePlanTemplates).mockResolvedValue(templates);
});

afterEach(() => {
  jest.resetAllMocks();
});

it('has correct page metadata', () => {
  expect(metadata).toEqual({
    title: 'Preview message plan - NHS Notify',
  });
});

it('redirects to invalid if routing config is not found', async () => {
  await renderPage(undefined, 'routing-config-id');

  expect(getRoutingConfig).toHaveBeenCalledWith('routing-config-id');
  expect(redirect).toHaveBeenCalledWith(
    '/message-plans/invalid',
    RedirectType.replace
  );
});

it('redirects to the edit message plan page if routing config is in DRAFT', async () => {
  const routingConfig = createRoutingConfig({ status: 'DRAFT' });

  await renderPage(routingConfig);

  expect(redirect).toHaveBeenCalledWith(
    `/message-plans/edit-message-plan/${routingConfig.id}`,
    RedirectType.replace
  );
});

it('renders the message plan details', async () => {
  const routingConfig = createRoutingConfig();

  await renderPage(routingConfig);

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    routingConfig.name
  );

  const planDetails = screen.getByTestId('message-plan-details');

  expect(within(planDetails).getByTestId('plan-id')).toHaveTextContent(
    routingConfig.id
  );
  expect(within(planDetails).getByTestId('campaign-id')).toHaveTextContent(
    routingConfig.campaignId
  );
  expect(within(planDetails).getByTestId('status')).toHaveTextContent(
    'Production'
  );
});

describe('full cascade plan', () => {
  const routingConfig = createRoutingConfig({
    cascade: [
      {
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: appTemplateId,
        cascadeGroups: ['standard'],
      },
      {
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: emailTemplateId,
        cascadeGroups: ['standard'],
      },
      {
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: smsTemplateId,
        cascadeGroups: ['standard'],
      },
      {
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: letterTemplateId,
        cascadeGroups: ['standard', 'accessible', 'translations'],
        conditionalTemplates: [
          { templateId: kuTemplateId, language: 'ku' },
          { templateId: sqTemplateId, language: 'sq' },
          { templateId: largePrintTemplateId, accessibleFormat: 'x1' },
        ],
      },
    ],
  });

  it('matches snapshot', async () => {
    const { asFragment } = await renderPage(routingConfig);

    expect(asFragment()).toMatchSnapshot();
  });

  it('has correct structure reflecting the cascade data', async () => {
    await renderPage(routingConfig);

    const channelList = screen.getByTestId('cascade-channel-list');

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
      ...(channelList.children as HTMLCollectionOf<HTMLElement>),
    ].map((el) => el.dataset.testid);

    // Check that the actual matches the expected
    expect(listItemsTestIds).toEqual(expectedTestIds);

    const blockTestIds = expectedTestIds.filter((id) =>
      id.startsWith('message-plan-block')
    );

    // Now check each block individually
    for (const [index, id] of blockTestIds.entries()) {
      const block = within(channelList).getByTestId(id);

      const stepNumber = block.querySelector('.message-plan-block-number');
      expect(stepNumber).toHaveTextContent(String(index + 1));

      expect(
        within(block).getByRole('heading', { level: 2 })
      ).toHaveTextContent(`${ORDINALS[index]} message`);
    }
  });

  test('all details sections are controlled by button', async () => {
    const user = userEvent.setup();
    await renderPage(routingConfig);

    const button = screen.getByRole('button', {
      name: 'Open all template previews',
    });

    const detailsSections = screen
      .getByTestId('cascade-channel-list')
      .querySelectorAll('details');

    for (const section of detailsSections) {
      expect(section.open).toBe(false);
    }

    await user.click(button);

    expect(button).toHaveTextContent('Close all template previews');

    for (const section of detailsSections) {
      expect(section.open).toBe(true);
    }

    await user.click(button);

    expect(button).toHaveTextContent('Open all template previews');

    for (const section of detailsSections) {
      expect(section.open).toBe(false);
    }
  });
});

it('renders nothing for cascade items with no default template id', async () => {
  const routingConfig = createRoutingConfig({
    cascade: [
      {
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: null,
        cascadeGroups: ['standard'],
      },
    ],
  });

  await renderPage(routingConfig);

  expect(
    screen.queryByTestId('message-plan-block-NHSAPP')
  ).not.toBeInTheDocument();
});

const digitalChannels: [Channel, string, string][] = [
  ['NHSAPP', 'NHS App', appTemplateId],
  ['SMS', 'Text message (SMS)', smsTemplateId],
  ['EMAIL', 'Email', emailTemplateId],
];

describe.each(digitalChannels)(
  'single digital channel - %s',
  (channel, channelDisplayName, templateId) => {
    it('shows the channel and template name along with template preview', async () => {
      const routingConfig = createRoutingConfig({
        cascade: [
          {
            channel,
            channelType: 'primary',
            defaultTemplateId: templateId,
            cascadeGroups: ['standard'],
          },
        ],
      });

      const template = templates[templateId] as DigitalTemplate;

      await renderPage(routingConfig);

      const block = screen.getByTestId(`message-plan-block-${channel}`);

      const card = within(block).getByTestId('channel-card');

      expect(
        within(card).getByRole('heading', {
          level: 3,
        })
      ).toHaveTextContent(channelDisplayName);

      expect(within(card).getByTestId('template-name')).toHaveTextContent(
        template.name
      );

      expect(
        within(card).getByTestId('preview-template-summary')
      ).toHaveTextContent(`Preview ${channelDisplayName} template`);

      expect(
        within(card).getByTestId('preview-template-text')
      ).toHaveTextContent(template.message);
    });
  }
);

describe('letter only', () => {
  it('shows only the card for the default template when no conditional templates are included', async () => {
    const routingConfig = createRoutingConfig({
      cascade: [
        {
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: letterTemplateId,
          cascadeGroups: ['standard'],
        },
      ],
    });

    const template = templates[letterTemplateId];

    await renderPage(routingConfig);

    expect(
      screen.queryByRole('button', {
        name: 'Open all template previews',
      })
    ).not.toBeInTheDocument();

    const block = screen.getByTestId('message-plan-block-LETTER');

    const card = within(block).getByTestId('channel-card');

    const link = within(card).getByRole('link');

    expect(link).toHaveTextContent(template.name);

    expect(link).toHaveAttribute(
      'href',
      `/preview-submitted-letter-template/${template.id}`
    );

    expect(
      within(block).queryByTestId('conditional-templates')
    ).not.toBeInTheDocument();
  });

  it('shows the fallback conditions and card for large print accessible format', async () => {
    const routingConfig = createRoutingConfig({
      cascade: [
        {
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: letterTemplateId,
          cascadeGroups: ['standard', 'accessible'],
          conditionalTemplates: [
            { accessibleFormat: 'x1', templateId: largePrintTemplateId },
          ],
        },
      ],
    });

    const template = templates[largePrintTemplateId];

    await renderPage(routingConfig);

    const block = screen.getByTestId('message-plan-block-LETTER');

    const conditionalTemplatesList = within(block).getByTestId(
      'conditional-templates'
    );

    expect(
      within(conditionalTemplatesList).getByTestId(
        'conditional-templates-fallback-conditions'
      )
    ).toBeInTheDocument();

    const largePrintCard = within(
      within(conditionalTemplatesList).getByTestId('conditional-template-x1')
    ).getByTestId('channel-card');

    const link = within(largePrintCard).getByRole('link');

    expect(link).toHaveTextContent(template.name);

    expect(link).toHaveAttribute(
      'href',
      `/preview-submitted-letter-template/${template.id}`
    );
  });

  it('shows the card for the other language templates', async () => {
    const routingConfig = createRoutingConfig({
      cascade: [
        {
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: letterTemplateId,
          cascadeGroups: ['standard', 'accessible'],
          conditionalTemplates: [
            { language: 'ku', templateId: kuTemplateId },
            { language: 'sq', templateId: sqTemplateId },
          ],
        },
      ],
    });

    await renderPage(routingConfig);

    const block = screen.getByTestId('message-plan-block-LETTER');

    const conditionalTemplatesList = within(block).getByTestId(
      'conditional-templates'
    );

    expect(
      within(conditionalTemplatesList).getByTestId(
        'conditional-templates-fallback-conditions'
      )
    ).toBeInTheDocument();

    const languagesCard = within(
      within(conditionalTemplatesList).getByTestId(
        'conditional-template-languages'
      )
    ).getByTestId('channel-card');

    const links = within(languagesCard).getAllByRole('link');

    expect(links).toHaveLength(2);

    for (const [
      index,
      { templateId },
    ] of routingConfig.cascade[0].conditionalTemplates!.entries()) {
      const template = templates[templateId!];

      expect(links[index]).toHaveTextContent(template.name);

      expect(links[index]).toHaveAttribute(
        'href',
        `/preview-submitted-letter-template/${template.id}`
      );
    }
  });
});
