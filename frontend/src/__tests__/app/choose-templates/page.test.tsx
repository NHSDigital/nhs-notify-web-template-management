import content from '@content/content';
import ChooseTemplatesPage, {
  generateMetadata,
} from '@app/message-plans/choose-templates/[routingConfigId]/page';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';
import {
  getRoutingConfig,
  getMessagePlanTemplates,
} from '@utils/message-plans';
import type { RoutingConfig } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import { redirect } from 'next/navigation';
import { render } from '@testing-library/react';

const { pageTitle } = content.pages.chooseTemplatesForMessagePlan;

jest.mock('next/navigation');
jest.mock('@utils/message-plans');

const redirectMock = jest.mocked(redirect);
const getMessagePlanMock = jest.mocked(getRoutingConfig);
const getMessagePlanTemplatesMock = jest.mocked(getMessagePlanTemplates);

const validRoutingConfigId = 'fbb81055-79b9-4759-ac07-d191ae57be34';

const routingConfig: RoutingConfig = {
  id: validRoutingConfigId,
  name: 'Autumn Campaign Plan',
  status: 'DRAFT',
  clientId: 'client-1',
  campaignId: 'campaign-2',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  cascadeGroupOverrides: [],
  cascade: [],
  lockNumber: 0,
  defaultCascadeGroup: 'standard',
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
      params: Promise.resolve({ routingConfigId: validRoutingConfigId }),
    });

    expect(getMessagePlanMock).toHaveBeenCalledWith(validRoutingConfigId);
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
      params: Promise.resolve({ routingConfigId: validRoutingConfigId }),
    });

    expect(getMessagePlanMock).toHaveBeenCalledWith(validRoutingConfigId);
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

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
    expect(getMessagePlanTemplatesMock).not.toHaveBeenCalled();
  });

  it('renders correctly for a message plan with multiple templates (snapshot)', async () => {
    const appTemplateId = 'd3a2c6ba-438a-4bf4-b94a-7c64c6528e7f';
    const smsTemplateId = '5f7c3e1d-9b1a-4d3a-8f3e-2c6b8e9f1a2b';
    const letterTemplateId = '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d';

    const planWithMultiple: RoutingConfig = {
      ...routingConfig,
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: appTemplateId,
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: smsTemplateId,
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          defaultTemplateId: null,
        },
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: letterTemplateId,
        },
      ],
    };

    const templates = {
      [appTemplateId]: { ...NHS_APP_TEMPLATE, id: appTemplateId },
      [smsTemplateId]: { ...SMS_TEMPLATE, id: smsTemplateId },
      [letterTemplateId]: {
        ...LETTER_TEMPLATE,
        id: letterTemplateId,
      },
    };

    getMessagePlanMock.mockResolvedValueOnce(planWithMultiple);
    getMessagePlanTemplatesMock.mockResolvedValueOnce(templates);

    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: validRoutingConfigId }),
    });

    const { container } = render(page);

    expect(container).toMatchSnapshot();
  });
});
