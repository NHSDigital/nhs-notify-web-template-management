/**
 * @jest-environment node
 */
import CreateNHSAppTemplatePage, {
  generateMetadata,
} from '@app/create-nhs-app-template/page';

jest.mock('@forms/NhsAppTemplateForm/NhsAppTemplateForm');

describe('CreateNHSAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateNHSAppTemplatePage', async () => {
    generateMetadata();
    const page = await CreateNHSAppTemplatePage();

    expect(page).toMatchSnapshot();
  });
});
