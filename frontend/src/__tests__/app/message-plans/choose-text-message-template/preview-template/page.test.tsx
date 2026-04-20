import PreviewTextMessageTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-text-message-template/[routingConfigId]/preview-template/[templateId]/page';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import {
  useFeatureFlags,
  useCampaignIds,
} from '@providers/client-config-provider';
import { SMS_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@providers/client-config-provider');

const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewTextMessageTemplateFromMessagePlan page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });
    jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
  });

  it('should render full page with SMS template', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...SMS_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewTextMessageTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: SMS_TEMPLATE.id,
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    });

    const { asFragment } = render(page);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview text message template - NHS Notify',
    });
  });
});
