/**
 * @jest-environment node
 */
import CreateEmailTemplatePage from '@app/create-email-template/page';

jest.mock('@forms/CreateEmailTemplate/CreateEmailTemplate');

describe('CreateEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateEmailTemplatePage', async () => {
    const page = await CreateEmailTemplatePage();

    expect(page).toMatchSnapshot();
  });
});
