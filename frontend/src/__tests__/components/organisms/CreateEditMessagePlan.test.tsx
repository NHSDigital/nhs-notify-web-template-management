import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';
import type {
  RoutingConfig,
  Channel,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import type { MessagePlanTemplates } from '@utils/message-plans';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
} from '@testhelpers/helpers';

const mockTemplates: MessagePlanTemplates = {} as MessagePlanTemplates;

function buildRoutingConfig({
  id = '30fd1e1c-a608-47cf-9cc2-eabaeeeebeca',
  name = 'Test Campaign',
  status = 'DRAFT' as RoutingConfigStatus,
  channels = ['NHSAPP', 'EMAIL'] as Channel[],
} = {}): RoutingConfig {
  const now = new Date().toISOString();
  return {
    id,
    name,
    status,
    clientId: 'client-1',
    campaignId: 'campaign-1',
    createdAt: now,
    updatedAt: now,
    cascadeGroupOverrides: [],
    cascade: channels.map((channel, index) => ({
      cascadeGroups: [],
      channel: channel,
      channelType: 'primary',
      defaultTemplateId: `template-${index}`,
    })),
  };
}

describe('CreateEditMessagePlan', () => {
  it('should render the page heading with the message plan name', () => {
    const plan = buildRoutingConfig({ name: 'Covid vaccine' });

    render(
      <CreateEditMessagePlan messagePlan={plan} templates={mockTemplates} />
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Covid vaccine' })
    ).toBeInTheDocument();
  });

  it('should display the routing config ID', () => {
    const plan = buildRoutingConfig({ id: 'routing-config-test' });

    const { container } = render(
      <CreateEditMessagePlan messagePlan={plan} templates={mockTemplates} />
    );

    const messagePlanId = container.querySelector(
      '.create-edit-message-plan-routing-config-id'
    ) as HTMLElement;

    expect(messagePlanId).toHaveTextContent('routing-config-test');
  });

  it.each([
    { status: 'DRAFT' as const, display: 'Draft' },
    { status: 'COMPLETED' as const, display: 'Production' },
  ])('should render the status tag for %s', ({ status, display }) => {
    const plan = buildRoutingConfig({ status });
    render(
      <CreateEditMessagePlan messagePlan={plan} templates={mockTemplates} />
    );

    expect(screen.getByText(display)).toBeInTheDocument();
  });

  it('should render the channel list with a block and fallback for each cascade item (order check)', () => {
    const channels: Channel[] = ['NHSAPP', 'EMAIL', 'SMS'];
    const plan = buildRoutingConfig({ channels });
    const { container } = render(
      <CreateEditMessagePlan messagePlan={plan} templates={mockTemplates} />
    );

    const messagePlanChannelList = container.querySelector(
      'ul.channel-list'
    ) as HTMLUListElement;

    const listItemsTestIds = [
      ...(messagePlanChannelList.children as HTMLCollectionOf<HTMLElement>),
    ].map((el) => el.dataset.testid);

    const expectedTestIds: string[] = [];
    for (const [id, channel] of channels.entries()) {
      expectedTestIds.push(`message-plan-block-${channel}`);
      if (id < channels.length - 1) {
        expectedTestIds.push(`message-plan-fallback-conditions-${channel}`);
      }
    }

    expect(listItemsTestIds).toEqual(expectedTestIds);
  });

  it('should render CTAs for both saving and moving to production', () => {
    const messagePlan = buildRoutingConfig();

    render(
      <CreateEditMessagePlan
        messagePlan={messagePlan}
        templates={mockTemplates}
      />
    );

    const formGroup = screen.getByTestId('message-plan-actions');
    const buttons = within(formGroup).getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('Move to production');
    expect(buttons[1].textContent).toBe('Save and close');
  });

  it('should render a "change name" link', () => {
    const plan = buildRoutingConfig();

    render(
      <CreateEditMessagePlan messagePlan={plan} templates={mockTemplates} />
    );

    const link = screen.getByTestId('change-message-plan-name-link');
    expect(link.textContent).toBe('Change name');
    expect(link.getAttribute('href')).toBe(
      `/message-plans/edit-message-plan-settings/${plan.id}`
    );
  });

  it('should match snapshot for a typical message plan', () => {
    const messagePlan = buildRoutingConfig({
      name: 'COVID Booster Plan',
      channels: ['NHSAPP', 'SMS', 'EMAIL', 'LETTER'],
    });

    const { asFragment } = render(
      <CreateEditMessagePlan
        messagePlan={messagePlan}
        templates={mockTemplates}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should match snapshot for a typical message plan with templates', () => {
    const messagePlan = buildRoutingConfig({
      name: 'COVID Booster Plan',
      channels: ['NHSAPP', 'EMAIL', 'LETTER'],
    });

    const templates: MessagePlanTemplates = {
      'template-0': NHS_APP_TEMPLATE,
      'template-1': EMAIL_TEMPLATE,
      'template-2': LETTER_TEMPLATE,
    };
    const { asFragment } = render(
      <CreateEditMessagePlan messagePlan={messagePlan} templates={templates} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  // TODO: CCM-11495 Add tests for validation (ErrorSummary)
});
