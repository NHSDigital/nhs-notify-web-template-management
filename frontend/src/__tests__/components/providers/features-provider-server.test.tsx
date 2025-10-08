import { getSessionServer } from '@utils/amplify-utils';
import { fetchClient } from '@utils/server-features';
import { initialFeatureFlags } from '@utils/features';
import FeatureFlagProviderServer from '@providers/features-provider-server';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/server-features');

const mockGetSessionServer = jest.mocked(getSessionServer);
const mockFetchClient = jest.mocked(fetchClient);

describe('FeatureFlagProviderServer', () => {
  describe('when unauthenticated', () => {
    beforeEach(() => {
      mockGetSessionServer.mockResolvedValueOnce({});
    });

    it('returns initial flags when unauthenticated', async () => {
      const child = await FeatureFlagProviderServer({ children: <div /> });

      expect(child.props.featureFlags).toEqual(initialFeatureFlags);
    });

    it('should not fetch client', async () => {
      await FeatureFlagProviderServer({ children: <div /> });

      expect(mockFetchClient).not.toHaveBeenCalled();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockGetSessionServer.mockResolvedValueOnce({ accessToken: 'mocktoken' });
    });

    it('returns flags when authenticated', async () => {
      mockFetchClient.mockResolvedValueOnce({
        data: { features: { proofing: true, routing: true } },
      });

      const child = await FeatureFlagProviderServer({ children: <div /> });

      expect(child.props.featureFlags).toEqual({
        proofing: true,
        routing: true,
      });
    });

    it('should fall back to default flags on fetch error', async () => {
      mockFetchClient.mockRejectedValueOnce({});

      const child = await FeatureFlagProviderServer({ children: <div /> });

      expect(child.props.featureFlags).toEqual(initialFeatureFlags);
    });

    it('should fall back to default flag when feature flag is missing', async () => {
      mockFetchClient.mockResolvedValue({
        data: {
          features: {
            proofing: true,
          },
        },
      });
      const child = await FeatureFlagProviderServer({ children: <div /> });

      expect(child.props.featureFlags).toEqual({
        proofing: true,
        routing: false,
      });
    });
  });
});
