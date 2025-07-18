/**
 * @jest-environment node
 */
import CreateLetterTemplatePage from '@app/create-letter-template/page';
import { getSessionServer } from '@utils/amplify-utils';
import { fetchClient } from '@utils/server-features';
import { redirect, RedirectType } from 'next/navigation';

jest.mock('next/navigation');
jest.mock('@utils/amplify-utils');
jest.mock('@utils/server-features');

const mockGetSessionServer = jest.mocked(getSessionServer);
const mockFetchClient = jest.mocked(fetchClient);

describe('CreateLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render CreateLetterTemplatePage', async () => {
    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client1',
      userSub: 'sub',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignId: 'campaign2',
        features: {},
      },
    });

    const page = await CreateLetterTemplatePage();

    expect(page).toMatchSnapshot();
  });

  it('should check client ID and campaign ID', async () => {
    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client1',
      userSub: 'sub',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignId: 'campaign2',
        features: {},
      },
    });

    await CreateLetterTemplatePage();

    expect(mockGetSessionServer).toHaveBeenCalled();
    expect(mockFetchClient).toHaveBeenCalled();
  });

  it('should redirect to error page when client ID is not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: undefined,
      userSub: 'sub',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignId: 'campaign2',
        features: {},
      },
    });

    await CreateLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/create-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });

  it('should redirect to error page when campaign ID is not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client2',
      userSub: 'sub',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignId: undefined,
        features: {},
      },
    });

    await CreateLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/create-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });
});
