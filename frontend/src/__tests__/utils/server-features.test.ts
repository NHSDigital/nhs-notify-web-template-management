import { serverIsFeatureEnabled } from '@utils/server-features';
import { getSessionServer } from '@utils/amplify-utils';
import { clientConfigurationApiClient } from 'nhs-notify-backend-client/src/client-configuration-api-client';

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client/src/client-configuration-api-client');
jest.mock('nhs-notify-web-template-management-utils/logger');

const getSessionServerMock = jest.mocked(getSessionServer);
const clientConfigurationApiClientMock = jest.mocked(
  clientConfigurationApiClient
);

describe('serverIsFeatureEnabled', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('should return false when no accessToken', async () => {
    getSessionServerMock.mockResolvedValueOnce({
      accessToken: undefined,
      clientId: undefined,
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(false);
  });

  it('should return false when no client', async () => {
    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      clientId: 'client1',
    });

    clientConfigurationApiClientMock.fetch.mockResolvedValueOnce({
      data: null,
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(false);

    expect(clientConfigurationApiClientMock.fetch).toHaveBeenCalledWith(
      'token'
    );
  });

  it('returns false if fetching configuration fails unexpectedly', async () => {
    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      clientId: 'client1',
    });

    clientConfigurationApiClientMock.fetch.mockResolvedValueOnce({
      error: { errorMeta: { code: 500, description: 'server error' } },
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(false);

    expect(clientConfigurationApiClientMock.fetch).toHaveBeenCalledWith(
      'token'
    );
  });

  it('should return false when feature is not enabled', async () => {
    clientConfigurationApiClientMock.fetch.mockResolvedValueOnce({
      data: {
        features: { proofing: false },
      },
    });

    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      clientId: 'client1',
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(false);

    expect(clientConfigurationApiClientMock.fetch).toHaveBeenCalledWith(
      'token'
    );
  });

  it('should return true when feature is enabled', async () => {
    clientConfigurationApiClientMock.fetch.mockResolvedValueOnce({
      data: {
        features: { proofing: true },
      },
    });

    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      clientId: 'client1',
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(true);

    expect(clientConfigurationApiClientMock.fetch).toHaveBeenCalledWith(
      'token'
    );
  });
});
