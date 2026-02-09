import React from 'react';
import { redirect, RedirectType } from 'next/navigation';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { RoutingConfig } from 'nhs-notify-backend-client';
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

import ReviewAndMoveMessagePlanPage, {
  metadata,
} from '@app/message-plans/review-and-move-to-production/[routingConfigId]/page';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');
jest.mock('@forms/ReviewAndMoveToProductionForm/server-action', () => ({
  moveToProductionAction: jest.fn(),
}));
jest.mock('@providers/form-provider', () => ({
  NHSNotifyFormProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useNHSNotifyForm: () => [{}, jest.fn(), false],
}));

function createRoutingConfig(data?: Partial<RoutingConfig>) {
  return RoutingConfigFactory.create({
    id: 'rc-123',
    campaignId: 'cmp-1',
    status: 'DRAFT',
    lockNumber: 5,
    ...data,
  });
}

async function renderPage(routingConfig?: RoutingConfig, id?: string) {
  jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);

  const page = await ReviewAndMoveMessagePlanPage({
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
  [appTemplateId]: { ...NHS_APP_TEMPLATE, id: appTemplateId },
  [emailTemplateId]: { ...EMAIL_TEMPLATE, id: emailTemplateId },
  [smsTemplateId]: { ...SMS_TEMPLATE, id: smsTemplateId },
  [letterTemplateId]: { ...PDF_LETTER_TEMPLATE, id: letterTemplateId },
  [kuTemplateId]: { ...PDF_LETTER_TEMPLATE, id: kuTemplateId },
  [sqTemplateId]: { ...PDF_LETTER_TEMPLATE, id: sqTemplateId },
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

describe('Review and move to production page', () => {
  it('has correct page metadata', () => {
    expect(metadata).toEqual({
      title: 'Review and move message plan to production - NHS Notify',
    });
  });

  it('redirects to invalid when message plan not found', async () => {
    await renderPage(undefined, 'rc-unknown');

    expect(getRoutingConfig).toHaveBeenCalledWith('rc-unknown');
    expect(redirect).toHaveBeenCalledWith(
      '/message-plans/invalid',
      RedirectType.replace
    );
  });

  it('redirects to message plans if status is not DRAFT', async () => {
    const routingConfig = createRoutingConfig({ status: 'COMPLETED' });

    await renderPage(routingConfig);

    expect(redirect).toHaveBeenCalledWith(
      '/message-plans/preview-message-plan/rc-123',
      RedirectType.replace
    );
  });

  it('renders the page heading and step counter', async () => {
    const routingConfig = createRoutingConfig({
      cascade: [
        {
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: appTemplateId,
          cascadeGroups: ['standard'],
        },
      ],
    });

    await renderPage(routingConfig);

    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Review and move message plan to production',
      })
    ).toBeInTheDocument();
  });

  it('renders summary list with message plan name only', async () => {
    const routingConfig = createRoutingConfig({
      name: 'My Test Plan',
      cascade: [
        {
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: appTemplateId,
          cascadeGroups: ['standard'],
        },
      ],
    });

    await renderPage(routingConfig);

    const summaryList = screen.getByTestId('message-plan-details');
    expect(within(summaryList).getByTestId('plan-name')).toHaveTextContent(
      'My Test Plan'
    );

    // Should only have name row, not ID, campaign or status
    expect(
      within(summaryList).queryByTestId('plan-id')
    ).not.toBeInTheDocument();
    expect(
      within(summaryList).queryByTestId('campaign-id')
    ).not.toBeInTheDocument();
    expect(within(summaryList).queryByTestId('status')).not.toBeInTheDocument();
  });

  it('renders move to production button with warning style', async () => {
    const routingConfig = createRoutingConfig({
      cascade: [
        {
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: appTemplateId,
          cascadeGroups: ['standard'],
        },
      ],
    });

    await renderPage(routingConfig);

    const moveButton = screen.getByTestId('move-to-production-button');
    expect(moveButton).toBeInTheDocument();
    expect(moveButton).toHaveTextContent('Move to production');
    expect(moveButton).toHaveClass('nhsuk-button--warning');
  });

  it('renders keep in draft link with correct href', async () => {
    const routingConfig = createRoutingConfig({
      cascade: [
        {
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: appTemplateId,
          cascadeGroups: ['standard'],
        },
      ],
    });

    await renderPage(routingConfig);

    const keepInDraftLink = screen.getByTestId('keep-in-draft-link');
    expect(keepInDraftLink).toHaveTextContent('Keep in draft');
    expect(keepInDraftLink).toHaveAttribute(
      'href',
      '/templates/message-plans/choose-templates/rc-123'
    );
  });

  describe('cascade channel display', () => {
    it('renders cascade channel list', async () => {
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
        ],
      });

      await renderPage(routingConfig);

      const channelList = screen.getByTestId('cascade-channel-list');
      expect(channelList).toBeInTheDocument();

      expect(
        within(channelList).getByTestId('message-plan-block-NHSAPP')
      ).toBeInTheDocument();
      expect(
        within(channelList).getByTestId('message-plan-block-EMAIL')
      ).toBeInTheDocument();
    });

    it('shows open/close all button for digital channels', async () => {
      const routingConfig = createRoutingConfig({
        cascade: [
          {
            channel: 'NHSAPP',
            channelType: 'primary',
            defaultTemplateId: appTemplateId,
            cascadeGroups: ['standard'],
          },
        ],
      });

      await renderPage(routingConfig);

      expect(
        screen.getByRole('button', { name: /open all template previews/i })
      ).toBeInTheDocument();
    });

    it('does not show open/close all button when only letters in cascade', async () => {
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

      await renderPage(routingConfig);

      expect(
        screen.queryByRole('button', { name: /open all template previews/i })
      ).not.toBeInTheDocument();
    });

    it('renders template preview details for digital channels', async () => {
      const routingConfig = createRoutingConfig({
        cascade: [
          {
            channel: 'NHSAPP',
            channelType: 'primary',
            defaultTemplateId: appTemplateId,
            cascadeGroups: ['standard'],
          },
        ],
      });

      await renderPage(routingConfig);

      const block = screen.getByTestId('message-plan-block-NHSAPP');
      expect(within(block).getByTestId('template-name')).toHaveTextContent(
        templates[appTemplateId].name
      );
      expect(
        within(block).getByTestId('preview-template-summary')
      ).toBeInTheDocument();
    });

    it('renders letter template as link', async () => {
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

      await renderPage(routingConfig);

      const block = screen.getByTestId('message-plan-block-LETTER');
      const templateName = within(block).getByTestId('template-name');
      const link = within(templateName).getByRole('link');

      expect(link).toHaveTextContent(templates[letterTemplateId].name);
      expect(link).toHaveAttribute(
        'href',
        `/preview-letter-template/${letterTemplateId}`
      );
    });

    it('renders fallback conditions between channels', async () => {
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
        ],
      });

      await renderPage(routingConfig);

      expect(
        screen.getByTestId('message-plan-fallback-conditions-NHSAPP')
      ).toBeInTheDocument();
    });
  });

  describe('conditional templates', () => {
    it('renders accessible format templates', async () => {
      const routingConfig = createRoutingConfig({
        cascade: [
          {
            channel: 'LETTER',
            channelType: 'primary',
            defaultTemplateId: letterTemplateId,
            cascadeGroups: ['standard', 'accessible'],
            conditionalTemplates: [
              { templateId: largePrintTemplateId, accessibleFormat: 'x1' },
            ],
          },
        ],
      });

      await renderPage(routingConfig);

      expect(screen.getByTestId('conditional-template-x1')).toBeInTheDocument();
    });

    it('renders language templates', async () => {
      const routingConfig = createRoutingConfig({
        cascade: [
          {
            channel: 'LETTER',
            channelType: 'primary',
            defaultTemplateId: letterTemplateId,
            cascadeGroups: ['standard', 'translations'],
            conditionalTemplates: [
              { templateId: kuTemplateId, language: 'ku' },
              { templateId: sqTemplateId, language: 'sq' },
            ],
          },
        ],
      });

      await renderPage(routingConfig);

      expect(
        screen.getByTestId('conditional-template-languages')
      ).toBeInTheDocument();
    });
  });

  it('does not render back to all message plans link', async () => {
    const routingConfig = createRoutingConfig({
      cascade: [
        {
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: appTemplateId,
          cascadeGroups: ['standard'],
        },
      ],
    });

    await renderPage(routingConfig);

    expect(
      screen.queryByText('Back to all message plans')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('back-link-top')).not.toBeInTheDocument();
    expect(screen.queryByTestId('back-link-bottom')).not.toBeInTheDocument();
  });

  it('matches snapshot for full cascade', async () => {
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

    const { asFragment } = await renderPage(routingConfig);

    expect(asFragment()).toMatchSnapshot();
  });
});
