import React from 'react';
import { render, screen } from '@testing-library/react';
import { MessagePlanChannelList } from '@organisms/MessagePlanChannelList/MessagePlanChannelList';
import type {
  RoutingConfig,
  Channel,
  TemplateDto,
} from 'nhs-notify-backend-client';
import { MessagePlanTemplates } from '@utils/message-plans';

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
      channel,
      channelType: 'primary',
      defaultTemplateId: `test-template-${i}`,
    })),
    lockNumber: 0,
  };
}

const testTemplates: MessagePlanTemplates = {
  'test-template-0': {
    id: 'test-template-0',
    name: 'Template 0',
  } as TemplateDto,
  'test-template-1': {
    id: 'test-template-1',
    name: 'Template 1',
  } as TemplateDto,
  'test-template-2': {
    id: 'test-template-2',
    name: 'Template 2',
  } as TemplateDto,
};

describe('MessagePlanChannelList', () => {
  it('should render a list', () => {
    const messagePlan = buildRoutingConfig(['NHSAPP']);

    const { container } = render(
      <MessagePlanChannelList
        messagePlan={messagePlan}
        templates={testTemplates}
      />
    );

    expect(container.querySelector('ul.channel-list')).toBeInTheDocument();
  });

  it('should render a block and a fallback section for each cascade item, apart from the final channel', () => {
    const channels: Channel[] = ['NHSAPP', 'EMAIL', 'SMS'];
    const messagePlan = buildRoutingConfig(channels);

    render(
      <MessagePlanChannelList
        messagePlan={messagePlan}
        templates={testTemplates}
      />
    );

    expect(screen.getByTestId('message-plan-block-NHSAPP')).toBeInTheDocument();
    expect(
      screen.getByTestId('message-plan-fallback-conditions-NHSAPP')
    ).toBeInTheDocument();

    expect(screen.getByTestId('message-plan-block-EMAIL')).toBeInTheDocument();
    expect(
      screen.getByTestId('message-plan-fallback-conditions-EMAIL')
    ).toBeInTheDocument();

    expect(screen.getByTestId('message-plan-block-SMS')).toBeInTheDocument();
    expect(
      screen.queryByTestId('message-plan-fallback-conditions-SMS')
    ).toBeNull();
  });

  it('should render nothing inside the list when cascade is empty', () => {
    const messagePlan = buildRoutingConfig([]);

    const { container } = render(
      <MessagePlanChannelList
        messagePlan={messagePlan}
        templates={testTemplates}
      />
    );

    expect(container.querySelector('ul.channel-list')!.children.length).toBe(0);
  });

  it('should handle cascade item without a template', () => {
    const messagePlan = buildRoutingConfig(['NHSAPP']);
    messagePlan.cascade[0].defaultTemplateId = undefined;

    expect(() => {
      render(
        <MessagePlanChannelList
          messagePlan={messagePlan}
          templates={testTemplates}
        />
      );
    }).not.toThrow();
    expect(screen.getByTestId('message-plan-block-NHSAPP')).toBeInTheDocument();
  });

  it('should match snapshot for a digital routing plan', () => {
    const messagePlan = buildRoutingConfig(['NHSAPP', 'EMAIL', 'SMS']);

    const { asFragment } = render(
      <MessagePlanChannelList
        messagePlan={messagePlan}
        templates={testTemplates}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match snapshot for a routing plan with a letter', () => {
    const messagePlan = buildRoutingConfig(['NHSAPP', 'EMAIL', 'LETTER']);

    const { asFragment } = render(
      <MessagePlanChannelList
        messagePlan={messagePlan}
        templates={testTemplates}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
