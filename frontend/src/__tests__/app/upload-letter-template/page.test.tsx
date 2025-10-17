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

  it('should check client ID and campaign ID', async () => {
    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client1',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignIds: ['campaign2'],
        features: {},
      },
    });

    await UploadLetterTemplatePage();

    expect(mockGetSessionServer).toHaveBeenCalled();
    expect(mockFetchClient).toHaveBeenCalled();
  });

  it('should render UploadLetterTemplatePage with campaignIds field when available', async () => {
    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client1',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignIds: ['campaign-id', 'other-campaign-id'],
        features: {},
      },
    });

    const page = await UploadLetterTemplatePage();

    expect(await generateMetadata()).toEqual({ title: pageTitle });
    expect(page).toMatchSnapshot();
  });

  it('should redirect to error page when client configuration is not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client-id',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: null,
    });

    await UploadLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });

  it('should redirect to error page when client ID is not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: undefined,
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignIds: ['campaign2'],
        features: {},
      },
    });

    await UploadLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });

  it('should redirect to error page when campaignIds is present and empty', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client2',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignIds: [],
        features: {},
      },
    });

    await UploadLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });

  it('should redirect to error page when neither campaignIds are not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockGetSessionServer.mockResolvedValueOnce({
      accessToken: 'mocktoken',
      clientId: 'client2',
    });
    mockFetchClient.mockResolvedValueOnce({
      data: {
        campaignIds: undefined,
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
