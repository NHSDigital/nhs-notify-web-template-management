/**
 * @jest-environment node
 */
import CreateSMSTemplatePage, {
  generateMetadata,
} from '@app/create-text-message-template/page';
import content from '@content/content';

const { pageTitle } = content.components.templateFormSms;

jest.mock('@forms/SmsTemplateForm/SmsTemplateForm');
jest.mock('nhs-notify-web-template-management-utils/logger');

describe('CreateSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateSMSTemplatePage', async () => {
    const page = await CreateSMSTemplatePage();

    expect(await generateMetadata()).toEqual({ title: pageTitle });
    expect(page).toMatchSnapshot();
  });
});
