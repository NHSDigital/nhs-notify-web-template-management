import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';
import type {
  RoutingConfig,
  Channel,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';

function buildRoutingConfig({
  id = 'routing-config-123',
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

    render(<CreateEditMessagePlan messagePlan={plan} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Covid vaccine' })
    ).toBeInTheDocument();
  });

  it('should display the routing config ID', () => {
    const plan = buildRoutingConfig({ id: 'routing-config-test' });

    const { container } = render(<CreateEditMessagePlan messagePlan={plan} />);

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
    render(<CreateEditMessagePlan messagePlan={plan} />);

    expect(screen.getByText(display)).toBeInTheDocument();
  });

  it('should render the channel list with a block and fallback for each cascade item (order check)', () => {
    const channels: Channel[] = ['NHSAPP', 'EMAIL', 'SMS'];
    const plan = buildRoutingConfig({ channels });
    const { container } = render(<CreateEditMessagePlan messagePlan={plan} />);

    const messagePlanChannelList = container.querySelector(
      'ul.channel-list'
    ) as HTMLUListElement;

    const listItemsTestIds = [
      ...(messagePlanChannelList.children as HTMLCollectionOf<HTMLElement>),
    ].map((el) => el.dataset.testid);

    expect(listItemsTestIds).toEqual([
      'message-plan-block-NHSAPP',
      'message-plan-fallback-conditions-NHSAPP',
      'message-plan-block-EMAIL',
      'message-plan-fallback-conditions-EMAIL',
      'message-plan-block-SMS',
      'message-plan-fallback-conditions-SMS',
    ]);
  });

  it('should render CTAs for both saving and moving to production', () => {
    const messagePlan = buildRoutingConfig();

    render(<CreateEditMessagePlan messagePlan={messagePlan} />);

    const formGroup = screen.getByTestId('message-plan-actions');
    const buttons = within(formGroup).getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('Move to production');
    expect(buttons[1].textContent).toBe('Save and close');
  });

  it('should render a "change name" link', () => {
    const plan = buildRoutingConfig();

    render(<CreateEditMessagePlan messagePlan={plan} />);

    const link = screen.getByTestId('change-message-plan-name-link');
    expect(link.textContent).toBe('Change name');
    expect(link.getAttribute('href')).toBe(
      '/templates/message-plans/change-name'
    );
  });

  it('should match snapshot for a typical message plan', () => {
    const messagePlan = buildRoutingConfig({
      name: 'COVID Booster Plan',
      channels: ['NHSAPP', 'EMAIL', 'LETTER'],
    });

    const { asFragment } = render(
      <CreateEditMessagePlan messagePlan={messagePlan} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
