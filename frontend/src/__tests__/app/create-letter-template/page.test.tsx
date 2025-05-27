/**
 * @jest-environment node
 */
import CreateLetterTemplatePage from '@app/create-letter-template/page';

describe('CreateLetterTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render CreateLetterTemplatePage', async () => {
    const page = await CreateLetterTemplatePage();

    expect(page).toMatchSnapshot();
  });
});
