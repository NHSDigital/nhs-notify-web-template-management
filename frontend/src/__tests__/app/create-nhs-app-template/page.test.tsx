/**
 * @jest-environment node
 */
import CreateNHSAppTemplatePage from '@app/create-nhs-app-template/page';

jest.mock('@forms/NhsAppTemplateForm/NhsAppTemplateForm');
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({
      value: 'csrf-token',
    }),
  }),
}));

describe('CreateNHSAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should render CreateNHSAppTemplatePage', async () => {
    const page = await CreateNHSAppTemplatePage();

    expect(page).toMatchSnapshot();
  });
});
