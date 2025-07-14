import { serverIsFeatureEnabled } from '@utils/server-features';
import { getSessionServer } from '@utils/amplify-utils';
import { clientConfigurationApiClient } from 'nhs-notify-backend-client';

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client');
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
      userSub: undefined,
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(false);
  });

  it('should return false when no client', async () => {
    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      clientId: 'client1',
      userSub: 'user',
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
      userSub: 'user',
    });

    clientConfigurationApiClientMock.fetch.mockResolvedValueOnce({
      error: { code: 500, message: 'server error' },
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
      userSub: 'user',
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
      userSub: 'user',
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(true);

    expect(clientConfigurationApiClientMock.fetch).toHaveBeenCalledWith(
      'token'
    );
  });
});
