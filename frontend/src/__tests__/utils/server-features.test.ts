import { serverIsFeatureEnabled } from '@utils/server-features';
import { getSessionServer } from '@utils/amplify-utils';
import { clientConfigurationApiClient } from 'nhs-notify-backend-client';

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client');

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
      userSub: undefined,
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(false);
  });

  it('should return true when no client', async () => {
    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      userSub: 'user',
    });

    clientConfigurationApiClientMock.fetch.mockResolvedValueOnce(undefined);

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(true);

    expect(clientConfigurationApiClientMock.fetch).toHaveBeenCalledWith(
      'token'
    );
  });

  it('should return false when feature is not enabled', async () => {
    clientConfigurationApiClientMock.fetch.mockResolvedValueOnce({
      features: { proofing: false },
    });

    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
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
      features: { proofing: true },
    });

    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      userSub: 'user',
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(true);

    expect(clientConfigurationApiClientMock.fetch).toHaveBeenCalledWith(
      'token'
    );
  });
});
