import { getSessionServer } from '@utils/amplify-utils';
import { fetchClient } from '@utils/server-features';
import { initialFeatureFlags } from '@utils/features';
import { ClientConfigProviderServer } from '@providers/client-config-provider-server';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/server-features');

const mockGetSessionServer = jest.mocked(getSessionServer);
const mockFetchClient = jest.mocked(fetchClient);

describe('ClientConfigProviderServer', () => {
  describe('when unauthenticated', () => {
    beforeEach(() => {
      mockGetSessionServer.mockResolvedValueOnce({});
    });

    it('returns initial flags when unauthenticated', async () => {
      const child = await ClientConfigProviderServer({ children: <div /> });

      expect(child.props.config).toEqual({ features: initialFeatureFlags });
    });

    it('should not fetch client', async () => {
      await ClientConfigProviderServer({ children: <div /> });

      expect(mockFetchClient).not.toHaveBeenCalled();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockGetSessionServer.mockResolvedValueOnce({ accessToken: 'mocktoken' });
    });

    it('returns config when authenticated', async () => {
      mockFetchClient.mockResolvedValueOnce({
        data: {
          campaignId: 'legacy-campaign-id',
          campaignIds: ['new-campaign-id'],
          features: { proofing: true, routing: true },
        },
      });

      const child = await ClientConfigProviderServer({ children: <div /> });

      expect(child.props.config).toEqual({
        campaignId: 'legacy-campaign-id',
        campaignIds: ['new-campaign-id'],
        features: { proofing: true, routing: true },
      });
    });

    it('should fall back to default flags on fetch error', async () => {
      mockFetchClient.mockRejectedValueOnce({});

      const child = await ClientConfigProviderServer({ children: <div /> });

      expect(child.props.config).toEqual({ features: initialFeatureFlags });
    });

    it('should fall back to default flag when feature flag is missing', async () => {
      mockFetchClient.mockResolvedValue({
        data: {
          features: {
            proofing: true,
          },
        },
      });
      const child = await ClientConfigProviderServer({ children: <div /> });

      expect(child.props.config).toEqual({
        features: {
          proofing: true,
          routing: false,
        },
      });
    });
  });
});
