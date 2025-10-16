/**
 * @jest-environment node
 */
import UploadLetterTemplatePage, {
  generateMetadata,
} from '@app/upload-letter-template/page';
import content from '@content/content';
import { fetchClient } from '@utils/server-features';
import { redirect, RedirectType } from 'next/navigation';

const { pageTitle } = content.components.templateFormLetter;

jest.mock('next/navigation');
jest.mock('@utils/server-features');

const mockFetchClient = jest.mocked(fetchClient);

describe('UploadLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render UploadLetterTemplatePage when one campaignId is available', async () => {
    mockFetchClient.mockResolvedValueOnce({
      campaignIds: ['campaign-id'],
      features: {},
    });

    const page = await UploadLetterTemplatePage();

    expect(await generateMetadata()).toEqual({ title: pageTitle });
    expect(page).toMatchSnapshot();
  });

  it('should render UploadLetterTemplatePage with multiple campaignIds available', async () => {
    mockFetchClient.mockResolvedValueOnce({
      campaignIds: ['campaign-id', 'other-campaign-id'],
      features: {},
    });

    const page = await UploadLetterTemplatePage();

    expect(page).toMatchSnapshot();
  });

  it('should redirect to error page when client configuration is not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockFetchClient.mockResolvedValueOnce(null);

    await UploadLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });

  it('should redirect to error page when campaignIds is present and empty', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockFetchClient.mockResolvedValueOnce({
      campaignIds: [],
      features: {},
    });

    await UploadLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });

  it('should redirect to error page when campaignIds are not present', async () => {
    const mockRedirect = jest.mocked(redirect);

    mockFetchClient.mockResolvedValueOnce({
      campaignIds: undefined,
      features: {},
    });

    await UploadLetterTemplatePage();

    expect(mockRedirect).toHaveBeenCalledWith(
      '/upload-letter-template/client-id-and-campaign-id-required',
      RedirectType.replace
    );
  });
});
