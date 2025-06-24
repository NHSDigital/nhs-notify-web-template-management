import { serverIsFeatureEnabled } from '@utils/server-features';
import { getSessionServer } from '@utils/amplify-utils';
import { ClientConfiguration } from 'nhs-notify-backend-client';
import { mock } from 'jest-mock-extended';

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client');

const getSessionServerMock = jest.mocked(getSessionServer);
const clientConfigurationMock = jest.mocked(ClientConfiguration.fetch);

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

  it('should return false when no client', async () => {
    getSessionServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      userSub: undefined,
    });

    const enabled = await serverIsFeatureEnabled('proofing');

    expect(enabled).toEqual(false);

    expect(clientConfigurationMock).toHaveBeenCalledWith('token');
  });

  it('should return false when feature is not enabled', async () => {
    const featureEnabled = jest.fn(() => false);

    clientConfigurationMock.mockResolvedValueOnce(
      mock<ClientConfiguration>({
        featureEnabled,
      })
    );

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

    clientConfigurationMock.mockResolvedValueOnce(
      mock<ClientConfiguration>({
        featureEnabled,
      })
    );

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
