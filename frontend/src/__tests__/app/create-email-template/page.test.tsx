/**
 * @jest-environment node
 */
import CreateEmailTemplatePage, {
  generateMetadata,
} from '@app/create-email-template/page';
import content from '@content/content';

const { pageTitle } = content.components.templateFormEmail;

jest.mock('@forms/EmailTemplateForm/EmailTemplateForm');

describe('CreateEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateEmailTemplatePage', async () => {
    const page = await CreateEmailTemplatePage();

    expect(await generateMetadata()).toEqual({ title: pageTitle });
    expect(page).toMatchSnapshot();
  });
});
