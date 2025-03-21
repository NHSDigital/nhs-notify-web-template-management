/**
 * @jest-environment node
 */
import CreateSMSTemplatePage, {
  generateMetadata,
} from '@app/create-text-message-template/page';

jest.mock('@forms/SmsTemplateForm/SmsTemplateForm');

describe('CreateSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateSMSTemplatePage', async () => {
    generateMetadata();
    const page = await CreateSMSTemplatePage();

    expect(page).toMatchSnapshot();
  });
});
