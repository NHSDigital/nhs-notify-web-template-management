/**
 * @jest-environment node
 */
import CreateLetterTemplatePage from '@app/create-letter-template/page';

describe('CreateLetterTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateLetterTemplatePage', async () => {
    const page = await CreateLetterTemplatePage();

    expect(page).toMatchSnapshot();
  });

  it('returns 404 when letters feature flag is not enabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_LETTERS = 'false';

    await expect(CreateLetterTemplatePage()).rejects.toThrow(
      'NEXT_HTTP_ERROR_FALLBACK;404'
    );
  });
});
