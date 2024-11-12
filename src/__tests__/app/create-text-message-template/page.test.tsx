/**
 * @jest-environment node
 */
import CreateSMSTemplatePage from '@app/create-text-message-template/page';

jest.mock('@forms/CreateSmsTemplate/CreateSmsTemplate');

describe('CreateSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateSMSTemplatePage', async () => {
    const page = await CreateSMSTemplatePage();

    expect(page).toMatchSnapshot();
  });
});
