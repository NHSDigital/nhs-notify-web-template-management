import { render, screen } from '@testing-library/react';
import { MessagePlanCascadePreview } from '@molecules/MessagePlanCascadePreview/MessagePlanCascadePreview';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  ROUTING_CONFIG,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';

describe('MessagePlanCascadePreview', () => {
  const templates = {
    [NHS_APP_TEMPLATE.id]: NHS_APP_TEMPLATE,
    [EMAIL_TEMPLATE.id]: EMAIL_TEMPLATE,
    [SMS_TEMPLATE.id]: SMS_TEMPLATE,
    [PDF_LETTER_TEMPLATE.id]: PDF_LETTER_TEMPLATE,
  };

  it('renders cascade preview with all channels', () => {
    render(
      <MessagePlanCascadePreview
        messagePlan={ROUTING_CONFIG}
        templates={templates}
      />
    );

    expect(screen.getByTestId('cascade-channel-list')).toBeInTheDocument();
    expect(screen.getByTestId('message-plan-block-NHSAPP')).toBeInTheDocument();
    expect(screen.getByTestId('message-plan-block-EMAIL')).toBeInTheDocument();
    expect(screen.getByTestId('message-plan-block-SMS')).toBeInTheDocument();
    expect(screen.getByTestId('message-plan-block-LETTER')).toBeInTheDocument();
  });

  it('renders template names', () => {
    render(
      <MessagePlanCascadePreview
        messagePlan={ROUTING_CONFIG}
        templates={templates}
      />
    );

    const templateNames = screen.getAllByTestId('template-name');
    expect(templateNames).toHaveLength(4);
    expect(templateNames[0]).toHaveTextContent(NHS_APP_TEMPLATE.name);
    expect(templateNames[1]).toHaveTextContent(EMAIL_TEMPLATE.name);
    expect(templateNames[2]).toHaveTextContent(SMS_TEMPLATE.name);
    expect(templateNames[3]).toHaveTextContent(PDF_LETTER_TEMPLATE.name);
  });

  it('renders open/close all previews button when non-letter channels present', () => {
    render(
      <MessagePlanCascadePreview
        messagePlan={ROUTING_CONFIG}
        templates={templates}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Open all template previews' })
    ).toBeInTheDocument();
  });

  it('does not render open/close button when only letter channel present', () => {
    const letterOnlyRoutingConfig = {
      ...ROUTING_CONFIG,
      cascade: [
        {
          cascadeGroups: ['standard' as const],
          channel: 'LETTER' as const,
          channelType: 'primary' as const,
          defaultTemplateId: PDF_LETTER_TEMPLATE.id,
        },
      ],
    };

    render(
      <MessagePlanCascadePreview
        messagePlan={letterOnlyRoutingConfig}
        templates={templates}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Open all template previews' })
    ).not.toBeInTheDocument();
  });

  it('renders fallback conditions between cascade items', () => {
    render(
      <MessagePlanCascadePreview
        messagePlan={ROUTING_CONFIG}
        templates={templates}
      />
    );

    expect(
      screen.getByTestId('message-plan-fallback-conditions-NHSAPP')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('message-plan-fallback-conditions-EMAIL')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('message-plan-fallback-conditions-SMS')
    ).toBeInTheDocument();
  });

  it('does not render fallback conditions for single channel', () => {
    const singleChannelRoutingConfig = {
      ...ROUTING_CONFIG,
      cascade: [
        {
          cascadeGroups: ['standard' as const],
          channel: 'NHSAPP' as const,
          channelType: 'primary' as const,
          defaultTemplateId: NHS_APP_TEMPLATE.id,
        },
      ],
    };

    render(
      <MessagePlanCascadePreview
        messagePlan={singleChannelRoutingConfig}
        templates={templates}
      />
    );

    expect(
      screen.queryByTestId('message-plan-fallback-conditions-NHSAPP')
    ).not.toBeInTheDocument();
  });

  it('renders letter template as link', () => {
    render(
      <MessagePlanCascadePreview
        messagePlan={ROUTING_CONFIG}
        templates={templates}
      />
    );

    const letterBlock = screen.getByTestId('message-plan-block-LETTER');
    const link = letterBlock.querySelector('a');
    expect(link).toHaveAttribute(
      'href',
      `/preview-submitted-letter-template/${PDF_LETTER_TEMPLATE.id}`
    );
    expect(link).toHaveTextContent(PDF_LETTER_TEMPLATE.name);
  });

  it('renders non-letter templates with preview details', () => {
    render(
      <MessagePlanCascadePreview
        messagePlan={ROUTING_CONFIG}
        templates={templates}
      />
    );

    const previewSummaries = screen.getAllByTestId('preview-template-summary');
    expect(previewSummaries).toHaveLength(3);
  });

  it('does not render cascade item when template is missing', () => {
    const templatesWithMissing = {
      [NHS_APP_TEMPLATE.id]: NHS_APP_TEMPLATE,
      // EMAIL_TEMPLATE is missing
      [SMS_TEMPLATE.id]: SMS_TEMPLATE,
      [PDF_LETTER_TEMPLATE.id]: PDF_LETTER_TEMPLATE,
    };

    render(
      <MessagePlanCascadePreview
        messagePlan={ROUTING_CONFIG}
        templates={templatesWithMissing}
      />
    );

    expect(screen.getByTestId('message-plan-block-NHSAPP')).toBeInTheDocument();
    expect(
      screen.queryByTestId('message-plan-block-EMAIL')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('message-plan-block-SMS')).toBeInTheDocument();
    expect(screen.getByTestId('message-plan-block-LETTER')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(
      <MessagePlanCascadePreview
        messagePlan={ROUTING_CONFIG}
        templates={templates}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
