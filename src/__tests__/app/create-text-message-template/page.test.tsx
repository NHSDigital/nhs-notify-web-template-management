import CreateSmsTemplatePage from '@app/create-text-message-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { Template } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { redirect } from 'next/navigation';
import { CreateSmsTemplate } from '@forms/CreateSmsTemplate/CreateSmsTemplate';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/CreateSmsTemplate/CreateSmsTemplate');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: Template = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.SMS,
};

describe('CreateSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-template when no templateId is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await CreateSmsTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template type is not SMS', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...initialState,
      templateType: TemplateType.NHS_APP,
    });

    await CreateSmsTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateSmsTemplate component when templateId is found', async () => {
    getTemplateMock.mockResolvedValueOnce(initialState);

    const page = await CreateSmsTemplatePage({
      params: { templateId: 'template-id' },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(<CreateSmsTemplate initialState={initialState} />);
  });
});
