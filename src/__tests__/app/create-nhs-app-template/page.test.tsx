import { redirect } from 'next/navigation';
import { TemplateType } from '@utils/types';
import { getTemplate } from '@utils/form-actions';
import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import CreateNhsAppTemplatePage from '@app/create-nhs-app-template/[templateId]/page';

jest.mock('@forms/CreateNhsAppTemplate/CreateNhsAppTemplate');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('CreateNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('page loads', async () => {
    const state = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.NHS_APP,
    };

    getTemplateMock.mockResolvedValueOnce(state);

    const page = await CreateNhsAppTemplatePage({
      params: { templateId: 'template-id' },
    });

    expect(page).toEqual(<CreateNhsAppTemplate initialState={state} />);
  });

  test('should render invalid template, when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await CreateNhsAppTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  const invalidTemplateTypes: (TemplateType | 'UNKNOWN')[] = [
    TemplateType.EMAIL,
    TemplateType.SMS,
    TemplateType.LETTER,
    'UNKNOWN',
  ];

  test.each(invalidTemplateTypes)(
    'should render invalid template, when template type is %p',
    async (templateType) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        version: 1,
        templateType,
      });

      await CreateNhsAppTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
