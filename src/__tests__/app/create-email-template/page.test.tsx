import CreateEmailTemplatePage from '@app/create-email-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { Template } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { redirect } from 'next/navigation';
import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/CreateEmailTemplate/CreateEmailTemplate');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: Template = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.EMAIL,
};

describe('CreateEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-template when no template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await CreateEmailTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template type is not EMAIL', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...initialState,
      templateType: TemplateType.NHS_APP,
    });

    await CreateEmailTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateEmailTemplatePage component when template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(initialState);

    const page = await CreateEmailTemplatePage({
      params: { templateId: 'template-id' },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(<CreateEmailTemplate initialState={initialState} />);
  });
});
