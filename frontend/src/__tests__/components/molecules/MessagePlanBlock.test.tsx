import React from 'react';
import { render, screen } from '@testing-library/react';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import type { CascadeItem, Channel } from 'nhs-notify-backend-client';
import type { TemplateDto } from 'nhs-notify-backend-client';
import { EMAIL_TEMPLATE } from '@testhelpers/helpers';

function buildCascadeItem(channel: Channel): CascadeItem {
  return {
    cascadeGroups: [],
    channel,
    channelType: 'primary',
    defaultTemplateId: '',
  };
}

const mockTemplate: TemplateDto = {
  ...EMAIL_TEMPLATE,
  name: 'Test email template',
};

describe('MessagePlanBlock', () => {
  it('should render the step number and the heading for the first cascade item', () => {
    const channelItem = buildCascadeItem('EMAIL');

    const { container } = render(
      <MessagePlanBlock
        index={0}
        channelItem={channelItem}
        routingConfigId='test-routing-config-id'
      />
    );

    const stepNumber = container.querySelector('.message-plan-block-number');
    expect(stepNumber).toHaveTextContent('1');

    expect(
      screen.getByRole('heading', { level: 2, name: 'First message' })
    ).toBeInTheDocument();
  });

  it('should render the step number and the interpolated heading for a third item', () => {
    const channelItem = buildCascadeItem('NHSAPP');

    const { container } = render(
      <MessagePlanBlock
        index={2}
        channelItem={channelItem}
        routingConfigId='test-routing-config-id'
      />
    );

    const stepNumber = container.querySelector('.message-plan-block-number');
    expect(stepNumber).toHaveTextContent('3');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Third message' })
    ).toBeInTheDocument();
  });

  it('should render the channel template section with the correct channel subheading', () => {
    const channelItem = buildCascadeItem('EMAIL');

    render(
      <MessagePlanBlock
        index={0}
        channelItem={channelItem}
        routingConfigId='test-routing-config-id'
      />
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Email' })
    ).toBeInTheDocument();
  });

  describe('when the channel has a template', () => {
    it('should display the template name', () => {
      const channelItem = buildCascadeItem('EMAIL');

      render(
        <MessagePlanBlock
          index={0}
          channelItem={channelItem}
          template={mockTemplate}
          routingConfigId='test-routing-config-id'
        />
      );
      expect(screen.getByText('Test email template')).toBeInTheDocument();
    });

    it('should show Change/Remove links (and no Choose link)', () => {
      const channelItem = buildCascadeItem('EMAIL');

      render(
        <MessagePlanBlock
          index={0}
          channelItem={channelItem}
          template={mockTemplate}
          routingConfigId='test-routing-config-id'
        />
      );

      expect(
        screen.getByRole('link', { name: 'Change Email template' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Remove Email template' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Choose Email template' })
      ).not.toBeInTheDocument();
    });
  });

  describe('when the channel does not have a template', () => {
    it('should show Choose link (and no Change/Remove links)', () => {
      const channelItem = buildCascadeItem('SMS');

      render(
        <MessagePlanBlock
          index={0}
          channelItem={channelItem}
          routingConfigId='test-routing-config-id'
        />
      );

      expect(
        screen.getByRole('link', { name: 'Choose Text message (SMS) template' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', {
          name: 'Change Text message (SMS) template',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', {
          name: 'Remove Text message (SMS) template',
        })
      ).not.toBeInTheDocument();
    });
  });

  describe.each(['NHSAPP', 'EMAIL', 'SMS', 'LETTER'] as const)(
    'for channel %s with template',
    (channel) => {
      it('should match snapshot', async () => {
        const channelItem = buildCascadeItem(channel);
        const { asFragment } = render(
          <MessagePlanBlock
            index={0}
            channelItem={channelItem}
            template={mockTemplate}
            routingConfigId='test-routing-config-id'
          />
        );
        expect(asFragment()).toMatchSnapshot();
      });
    }
  );

  describe.each(['NHSAPP', 'EMAIL', 'SMS', 'LETTER'] as const)(
    'for channel %s with no template',
    (channel) => {
      it('should match snapshot', async () => {
        const channelItem = buildCascadeItem(channel);
        const { asFragment } = render(
          <MessagePlanBlock
            index={0}
            channelItem={channelItem}
            routingConfigId='test-routing-config-id'
          />
        );
        expect(asFragment()).toMatchSnapshot();
      });
    }
  );
});
