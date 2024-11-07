import PreviewNhsAppTemplatePage from '@app/preview-nhs-app-template/[templateId]/page';
import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate';
import { NHSAppTemplate, TemplateType } from '@utils/types';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewNHSAppTemplate/ReviewNHSAppTemplate');
jest.mock('@utils/logger');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const state: NHSAppTemplate = {
      id: 'template-id',
      version: 1,
      templateType: TemplateType.NHS_APP,
      NHS_APP: {
        name: 'template-name',
        message: 'template-message',
      },
    };

    getTemplateMock.mockResolvedValueOnce(state);

    const page = await PreviewNhsAppTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(<ReviewNHSAppTemplate initialState={state} />);
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewNhsAppTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.LETTER,
      NHS_APP: {
        name: 'template-name',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.EMAIL,
      NHS_APP: {
        name: 'template-name',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.SMS,
      NHS_APP: {
        name: 'template-name',
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.NHS_APP,
      NHS_APP: {
        name: 'template-name',
        message: undefined as unknown as string,
      },
    },
    {
      templateType: TemplateType.NHS_APP,
      NHS_APP: {
        name: undefined as unknown as string,
        message: 'template-message',
      },
    },
    {
      templateType: TemplateType.NHS_APP,
      NHS_APP: {
        name: null as unknown as string,
        message: null as unknown as string,
      },
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $nhsAppTemplateName and message is $nhsAppTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        version: 1,
        ...value,
      });

      await PreviewNhsAppTemplatePage({
        params: {
          templateId: 'template-id',
        },
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});
