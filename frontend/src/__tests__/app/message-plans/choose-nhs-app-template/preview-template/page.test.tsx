import PreviewNhsAppTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-nhs-app-template/[routingConfigId]/preview-template/[templateId]/page';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import {
  useFeatureFlags,
  useCampaignIds,
} from '@providers/client-config-provider';
import { NHS_APP_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@providers/client-config-provider');

const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewNhsAppTemplateFromMessagePlan page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });
    jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
  });

  it('should render full page with NHS App template', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...NHS_APP_TEMPLATE,
      templateStatus: 'NOT_YET_SUBMITTED',
    });

    const page = await PreviewNhsAppTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: NHS_APP_TEMPLATE.id,
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    });

    const { asFragment } = render(page);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview NHS App message template - NHS Notify',
    });
  });
});
