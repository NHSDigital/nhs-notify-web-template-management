/**
 * @jest-environment node
 */
import CreateNHSAppTemplatePage from '@app/create-nhs-app-template/page';

jest.mock('@forms/CreateNhsAppTemplate/CreateNhsAppTemplate');

describe('CreateNHSAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateNHSAppTemplatePage', async () => {
    const page = await CreateNHSAppTemplatePage();

    expect(page).toMatchSnapshot();
  });
});
