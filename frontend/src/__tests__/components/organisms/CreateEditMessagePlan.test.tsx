import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';
import type {
  RoutingConfig,
  Channel,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import type { MessagePlanTemplates } from '@utils/routing-utils';
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
    lockNumber: 0,
    defaultCascadeGroup: 'standard',
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

    render(
      <CreateEditMessagePlan messagePlan={plan} templates={mockTemplates} />
    );

    const messagePlanId = screen.getByTestId('routing-config-id');

    expect(messagePlanId).toHaveTextContent('routing-config-test');
  });

  it('should display the campaign ID', () => {
    const plan = buildRoutingConfig();

    render(
      <CreateEditMessagePlan messagePlan={plan} templates={mockTemplates} />
    );

    const campaignId = screen.getByTestId('campaign-id');

    expect(campaignId).toHaveTextContent('campaign-1');
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

  it('should render an "edit settings" link', () => {
    const plan = buildRoutingConfig();

    render(
      <CreateEditMessagePlan messagePlan={plan} templates={mockTemplates} />
    );

    const link = screen.getByTestId('edit-settings-link');
    expect(link.textContent).toBe('Edit settings');
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

  describe('validation', () => {
    it('should not display error summary when all channels have templates', async () => {
      const user = userEvent.setup();
      const messagePlan = buildRoutingConfig({
        channels: ['NHSAPP', 'EMAIL'],
      });

      render(
        <CreateEditMessagePlan
          messagePlan={messagePlan}
          templates={mockTemplates}
        />
      );

      const moveToProductionButton = screen.getByTestId(
        'move-to-production-cta'
      );
      await user.click(moveToProductionButton);

      const errorSummary = screen.queryByRole('alert');

      expect(errorSummary).not.toBeInTheDocument();
    });

    it('should show error summary when a channel is missing a template', async () => {
      const user = userEvent.setup();
      const messagePlan = buildRoutingConfig({
        channels: ['NHSAPP', 'EMAIL'],
      });
      messagePlan.cascade[1].defaultTemplateId = null;

      render(
        <CreateEditMessagePlan
          messagePlan={messagePlan}
          templates={mockTemplates}
        />
      );

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
        name: 'You have not chosen a template for your second message',
      });
      expect(errorLink).toBeInTheDocument();
      expect(errorLink).toHaveAttribute('href', '#channel-EMAIL');
    });

    it('should show multiple errors when multiple channels are missing templates', async () => {
      const user = userEvent.setup();
      const messagePlan = buildRoutingConfig({
        channels: ['NHSAPP', 'EMAIL', 'SMS'],
      });
      messagePlan.cascade[0].defaultTemplateId = null;
      messagePlan.cascade[2].defaultTemplateId = null;

      render(
        <CreateEditMessagePlan
          messagePlan={messagePlan}
          templates={mockTemplates}
        />
      );

      const moveToProductionButton = screen.getByTestId(
        'move-to-production-cta'
      );
      await user.click(moveToProductionButton);

      const errorLinks = screen.getAllByRole('link', {
        name: /You have not chosen a template for your/,
      });
      expect(errorLinks).toHaveLength(2);
      expect(errorLinks[0]).toHaveTextContent(
        'You have not chosen a template for your first message'
      );
      expect(errorLinks[0]).toHaveAttribute('href', '#channel-NHSAPP');
      expect(errorLinks[1]).toHaveTextContent(
        'You have not chosen a template for your third message'
      );
      expect(errorLinks[1]).toHaveAttribute('href', '#channel-SMS');
    });

    it('should match snapshot when displaying validation errors', async () => {
      const user = userEvent.setup();
      const messagePlan = buildRoutingConfig({
        name: 'Test Campaign with Missing Templates',
        channels: ['NHSAPP', 'EMAIL', 'SMS'],
      });
      messagePlan.cascade[0].defaultTemplateId = null;
      messagePlan.cascade[2].defaultTemplateId = null;

      const { asFragment } = render(
        <CreateEditMessagePlan
          messagePlan={messagePlan}
          templates={mockTemplates}
        />
      );

      const moveToProductionButton = screen.getByTestId(
        'move-to-production-cta'
      );
      await user.click(moveToProductionButton);

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
