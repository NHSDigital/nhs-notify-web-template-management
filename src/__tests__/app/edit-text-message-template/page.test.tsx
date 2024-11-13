/**
 * @jest-environment node
 */
import EditSmsTemplatePage from '@app/edit-text-message-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { SMSTemplate } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { redirect } from 'next/navigation';
import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SmsTemplateForm/SmsTemplateForm');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: SMSTemplate = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.SMS,
  name: '',
  message: '',
};

describe('EditSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-template when no templateId is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditSmsTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template type is not SMS', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...initialState,
      templateType: TemplateType.NHS_APP,
    });

    await EditSmsTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateSmsTemplate component when templateId is found', async () => {
    getTemplateMock.mockResolvedValueOnce(initialState);

    const page = await EditSmsTemplatePage({
      params: { templateId: 'template-id' },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(<SmsTemplateForm initialState={initialState} />);
  });
});
