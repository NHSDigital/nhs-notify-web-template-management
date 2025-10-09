/**
 * @jest-environment node
 */
import content from '@content/content';
import ChooseTemplatesPage, {
  generateMetadata,
} from '@app/message-plans/choose-templates/[routingConfigId]/page';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';
import { getMessagePlan, getMessagePlanTemplates } from '@utils/message-plans';
import type {
  RoutingConfig,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers';
import { redirect } from 'next/dist/server/api-utils';

const { pageTitle } = content.pages.chooseTemplatesForMessagePlan;

jest.mock('next/navigation');
jest.mock('@utils/message-plans');
jest.mock('@organisms/CreateEditMessagePlan/CreateEditMessagePlan');

const redirectMock = jest.mocked(redirect);
const getMessagePlanMock = jest.mocked(getMessagePlan);
const getMessagePlanTemplatesMock = jest.mocked(getMessagePlanTemplates);

const routingConfig: RoutingConfig = {
  id: 'routing-config-001',
  name: 'Autumn Campaign Plan',
  status: 'DRAFT' as RoutingConfigStatus,
  clientId: 'clientemplate-123',
  campaignId: 'camp-123',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  cascadeGroupOverrides: [],
  cascade: [],
};

describe('ChooseTemplatesPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should set the page metadata title', async () => {
    expect(await generateMetadata()).toEqual({ title: pageTitle });
  });

  it('should call getMessagePlan with the correct routingConfigId from params', async () => {
    getMessagePlanMock.mockResolvedValueOnce(routingConfig);
    getMessagePlanTemplatesMock.mockResolvedValueOnce({});

    await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: 'test-routing-config' }),
    });

    expect(getMessagePlanMock).toHaveBeenCalledWith('test-routing-config');
  });

  it('should fetch the routing config and render CreateEditMessagePlan with empty templates when no cascade items', async () => {
    getMessagePlanMock.mockResolvedValueOnce(routingConfig);
    getMessagePlanTemplatesMock.mockResolvedValueOnce({});

    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: 'routing-config-001' }),
    });

    expect(getMessagePlanMock).toHaveBeenCalledWith('routing-config-001');
    expect(getMessagePlanTemplatesMock).toHaveBeenCalledWith(routingConfig);

    expect(page).toEqual(
      <CreateEditMessagePlan messagePlan={routingConfig} templates={{}} />
    );
  });

  it('should fetch templates and pass them when message plan has a cascade item', async () => {
    const planWithCascade: RoutingConfig = {
      ...routingConfig,
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          defaultTemplateId: 'template-1',
        },
      ],
    };

    const templates = {
      'template-1': { ...EMAIL_TEMPLATE, id: 'template-1' },
    };

    getMessagePlanMock.mockResolvedValueOnce(planWithCascade);
    getMessagePlanTemplatesMock.mockResolvedValueOnce(templates);

    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: 'routing-config-001' }),
    });

    expect(getMessagePlanMock).toHaveBeenCalledWith('routing-config-001');
    expect(getMessagePlanTemplatesMock).toHaveBeenCalledWith(planWithCascade);

    expect(page).toEqual(
      <CreateEditMessagePlan
        messagePlan={planWithCascade}
        templates={templates}
      />
    );
  });

  it('should fetch all templates and pass them when message plan has multiple cascade items', async () => {
    const planWithMultiple: RoutingConfig = {
      ...routingConfig,
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: 'test-template-app',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: 'test-template-sms',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: 'test-template-letter',
        },
      ],
    };

    const templates = {
      'test-template-app': { ...NHS_APP_TEMPLATE, id: 'test-template-app' },
      'test-template-sms': { ...SMS_TEMPLATE, id: 'test-template-sms' },
      'test-template-letter': {
        ...LETTER_TEMPLATE,
        id: 'test-template-letter',
      },
    };

    getMessagePlanMock.mockResolvedValueOnce(planWithMultiple);
    getMessagePlanTemplatesMock.mockResolvedValueOnce(templates);

    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: 'routing-config-002' }),
    });

    expect(getMessagePlanMock).toHaveBeenCalledWith('routing-config-002');
    expect(getMessagePlanTemplatesMock).toHaveBeenCalledWith(planWithMultiple);

    expect(page).toEqual(
      <CreateEditMessagePlan
        messagePlan={planWithMultiple}
        templates={templates}
      />
    );
  });

  it('should redirect when the routing config is not found', async () => {
    getMessagePlanMock.mockResolvedValueOnce(undefined);

    await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: 'missing-id' }),
    });
    // TODO: Update with real URL
    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
    expect(getMessagePlanTemplatesMock).not.toHaveBeenCalled();
  });
});
