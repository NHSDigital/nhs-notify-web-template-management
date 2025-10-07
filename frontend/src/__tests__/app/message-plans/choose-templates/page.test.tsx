/**
 * @jest-environment node
 */
import { getMessagePlan } from '@utils/message-plans';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';
import type { RoutingConfig } from 'nhs-notify-backend-client';
import content from '@content/content';
import ChooseTemplatesPage, {
  generateMetadata,
} from '@app/message-plans/choose-templates/[routingConfigId]/page';

const { pageTitle } = content.pages.chooseTemplatesForMessagePlan;

jest.mock('@utils/message-plans');
jest.mock('@organisms/CreateEditMessagePlan/CreateEditMessagePlan');

const getMessagePlanMock = jest.mocked(getMessagePlan);

const routingConfig: RoutingConfig = {
  id: 'routing-config-001',
  name: 'Autumn Campaign Plan',
  status: 'DRAFT',
  clientId: 'client-123',
  campaignId: 'camp-123',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  cascadeGroupOverrides: [],
  cascade: [],
};

describe('ChooseTemplatesPage', () => {
  beforeEach(jest.resetAllMocks);

  it('should set the page metadata title', async () => {
    expect(await generateMetadata()).toEqual({ title: pageTitle });
  });

  it('should fetch the routing config and render CreateEditMessagePlan', async () => {
    getMessagePlanMock.mockResolvedValueOnce(routingConfig);

    const page = await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: 'routing-config-001' }),
    });

    expect(getMessagePlanMock).toHaveBeenCalledWith('routing-config-001');
    expect(page).toEqual(<CreateEditMessagePlan messagePlan={routingConfig} />);
  });

  it('should pass the routingConfigId from params to getMessagePlan', async () => {
    getMessagePlanMock.mockResolvedValueOnce(routingConfig);

    await ChooseTemplatesPage({
      params: Promise.resolve({ routingConfigId: 'test-routing-config' }),
    });

    expect(getMessagePlanMock).toHaveBeenCalledWith('test-routing-config');
  });

  // TODO: Redirect for invalid/not found message plan
});
