/**
 * @jest-environment node
 */
import CreateEmailTemplatePage, {
  generateMetadata,
} from '@app/create-email-template/page';

jest.mock('@forms/EmailTemplateForm/EmailTemplateForm');

describe('CreateEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateEmailTemplatePage', async () => {
    generateMetadata();
    const page = await CreateEmailTemplatePage();

    expect(page).toMatchSnapshot();
  });
});
