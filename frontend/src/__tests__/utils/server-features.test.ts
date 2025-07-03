import { serverIsFeatureEnabled } from '@utils/server-features';
import { getSessionServer } from '@utils/amplify-utils';
import { ClientConfiguration } from 'nhs-notify-backend-client';

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client');

const getSessionServerMock = jest.mocked(getSessionServer);
const clientConfigurationMock = mock<ClientConfigurationApiClient>();

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

  // Note: Should be updated when we have an API
  it('should return true when no client', async () => {
    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      userSub: undefined,
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(true);

    expect(clientConfigurationMock).toHaveBeenCalledWith('token');
  });

  it('should return false when feature is not enabled', async () => {
    const featureEnabled = jest.fn(() => false);

    clientConfigurationMock.mockResolvedValueOnce({
      features: { proofing: false },
      featureEnabled,
    });

    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      userSub: undefined,
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(false);

    expect(clientConfigurationMock).toHaveBeenCalledWith('token');

    expect(featureEnabled).toHaveBeenCalledWith('proofing');
  });

  it('should return true when feature is enabled', async () => {
    const featureEnabled = jest.fn(() => true);

    clientConfigurationMock.mockResolvedValueOnce({
      features: { proofing: true },
      featureEnabled,
    });

    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      userSub: undefined,
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(true);

    expect(clientConfigurationMock).toHaveBeenCalledWith('token');

    expect(featureEnabled).toHaveBeenCalledWith('proofing');
  });
});
