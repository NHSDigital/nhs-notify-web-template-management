/**
 * @jest-environment node
 */
import UploadLetterTemplatePage, {
  generateMetadata,
} from '@app/upload-letter-template/page';
import content from '@content/content';
import { getSessionServer } from '@utils/amplify-utils';
import { fetchClient } from '@utils/server-features';
import { redirect, RedirectType } from 'next/navigation';

const { pageTitle } = content.components.templateFormLetter;

jest.mock('next/navigation');
jest.mock('@utils/amplify-utils');
jest.mock('@utils/server-features');

const mockGetSessionServer = jest.mocked(getSessionServer);
const mockFetchClient = jest.mocked(fetchClient);

describe('UploadLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render UploadLetterTemplatePage', async () => {
    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client1',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignId: 'campaign2',
        features: {},
      },
    });

    const page = await UploadLetterTemplatePage();

    expect(await generateMetadata()).toEqual({ title: pageTitle });
    expect(page).toMatchSnapshot();
  });

  it('should check client ID and campaign ID', async () => {
    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client1',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignId: 'campaign2',
        features: {},
      },
    });

    await UploadLetterTemplatePage();

    expect(mockGetSessionServer).toHaveBeenCalled();
    expect(mockFetchClient).toHaveBeenCalled();
  });

  it('should redirect to error page when client ID is not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: undefined,
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignId: 'campaign2',
        features: {},
      },
    });

    await UploadLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });

  it('should redirect to error page when campaign ID is not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client2',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignId: undefined,
        features: {},
      },
    });

    await UploadLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });
});
