/**
 * @jest-environment node
 */
import CreateNHSAppTemplatePage, {
  generateMetadata,
} from '@app/create-nhs-app-template/page';
import content from '@content/content';

const { pageTitle } = content.components.templateFormNhsApp;

jest.mock('@forms/NhsAppTemplateForm/NhsAppTemplateForm');
jest.mock('nhs-notify-web-template-management-utils/logger');

describe('CreateNHSAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateNHSAppTemplatePage', async () => {
    const page = await CreateNHSAppTemplatePage();

    expect(await generateMetadata()).toEqual({ title: pageTitle });
    expect(page).toMatchSnapshot();
  });
});
