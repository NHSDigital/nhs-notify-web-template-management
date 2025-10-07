import React from 'react';
import { render, screen } from '@testing-library/react';
import { MessagePlanChannelList } from '@organisms/MessagePlanChannelList/MessagePlanChannelList';
import type { RoutingConfig, Channel } from 'nhs-notify-backend-client';

function buildRoutingConfig(channels: Channel[]): RoutingConfig {
  const now = new Date().toISOString();
  return {
    id: 'routingconfig-1',
    name: 'Test plan',
    clientId: 'client-1',
    campaignId: 'campaign-1',
    status: 'DRAFT',
    createdAt: now,
    updatedAt: now,
    cascadeGroupOverrides: [],
    cascade: channels.map((channel, i) => ({
      cascadeGroups: ['standard'],
      channel: channel,
      channelType: 'primary',
      defaultTemplateId: `test-template-${i}`,
    })),
  };
}

describe('MessagePlanChannelList', () => {
  it('should render a list', () => {
    const messagePlan = buildRoutingConfig(['NHSAPP']);
    const { container } = render(
      <MessagePlanChannelList messagePlan={messagePlan} />
    );
    expect(container.querySelector('ul.channel-list')).toBeInTheDocument();
  });

  it('should render a block and fallback for each cascade item', () => {
    const channels: Channel[] = ['NHSAPP', 'EMAIL', 'SMS'];
    const messagePlan = buildRoutingConfig(channels);

    render(<MessagePlanChannelList messagePlan={messagePlan} />);

    for (const channel of channels) {
      expect(
        screen.getByTestId(`message-plan-block-${channel}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`message-plan-fallback-conditions-${channel}`)
      ).toBeInTheDocument();
    }
  });

  it('should render nothing inside the list when cascade is empty', () => {
    const messagePlan = buildRoutingConfig([]);
    const { container } = render(
      <MessagePlanChannelList messagePlan={messagePlan} />
    );
    expect(container.querySelector('ul.channel-list')!.children.length).toBe(0);
  });

  it('should match snapshot for a digital routing plan', () => {
    const messagePlan = buildRoutingConfig(['NHSAPP', 'EMAIL', 'SMS']);
    const { asFragment } = render(
      <MessagePlanChannelList messagePlan={messagePlan} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match snapshot for a routing plan with a letter', () => {
    const messagePlan = buildRoutingConfig(['NHSAPP', 'EMAIL', 'LETTER']);
    const { asFragment } = render(
      <MessagePlanChannelList messagePlan={messagePlan} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
