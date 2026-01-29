import { fetchClient } from '@utils/server-features';
import { initialFeatureFlags } from '@utils/client-config';
import { ClientConfigProviderServer } from '@providers/client-config-provider-server';
import { ClientConfigProvider } from '@providers/client-config-provider';

jest.mock('@utils/server-features');
const mockFetchClient = jest.mocked(fetchClient);

describe('ClientConfigProviderServer', () => {
  it('returns ClientConfigProvider with value set', async () => {
    mockFetchClient.mockResolvedValueOnce({
      campaignIds: ['new-campaign-id'],
      features: { proofing: true, routing: true, letterAuthoring: true },
    });

    const rendered = await ClientConfigProviderServer({ children: <div /> });

    expect(rendered.type).toBe(ClientConfigProvider);

    expect(rendered.props.value).toEqual({
      campaignIds: ['new-campaign-id'],
      features: { proofing: true, routing: true, letterAuthoring: true },
    });

    expect(rendered.props.children).toEqual(<div />);
  });

  it('should fall back to default flags when no config is returned', async () => {
    mockFetchClient.mockResolvedValueOnce(null);

    const child = await ClientConfigProviderServer({ children: <div /> });

    expect(child.props.value).toEqual({ features: initialFeatureFlags });
  });

  it('should fall back to default flag when feature flag is missing', async () => {
    mockFetchClient.mockResolvedValue({
      features: {
        proofing: true,
      },
    });
    const child = await ClientConfigProviderServer({ children: <div /> });

    expect(child.props.value).toEqual({
      features: {
        proofing: true,
        routing: false,
        letterAuthoring: false,
      },
    });
  });
});
