import { redirect } from 'next/navigation';
import { NextRedirectError } from '@testhelpers/next-redirect';
import { patchTemplate } from '@utils/form-actions';
import { editTemplateCampaign } from '@app/edit-template-campaign/[templateId]/server-action';

jest.mock('next/navigation');
jest.mocked(redirect).mockImplementation((url) => {
  throw new NextRedirectError(url);
});

jest.mock('@utils/form-actions');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('editTemplateCampaign', () => {
  it('patches the template and redirects when all fields are valid', async () => {
    const formData = new FormData();
    formData.append('campaignId', 'Updated Campaign Id');
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    await expect(editTemplateCampaign({}, formData)).rejects.toMatchObject({
      message: 'NEXT_REDIRECT',
      url: '/preview-letter-template/template-123',
    });

    expect(patchTemplate).toHaveBeenCalledWith(
      'template-123',
      { campaignId: 'Updated Campaign Id' },
      5
    );
  });

  it('returns validation error when campaignId is empty', async () => {
    const formData = new FormData();
    formData.append('campaignId', '');
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    const result = await editTemplateCampaign({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        campaignId: ['Choose a campaign'],
      },
    });
  });

  it('returns validation error when campaignId is missing', async () => {
    const formData = new FormData();
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    const result = await editTemplateCampaign({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        campaignId: ['Choose a campaign'],
      },
    });
  });

  it('returns validation error when templateId is missing', async () => {
    const formData = new FormData();
    formData.append('campaignId', 'Updated Campaign Id');
    formData.append('lockNumber', '5');

    const result = await editTemplateCampaign({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        templateId: [expect.any(String)],
      },
    });
  });

  it('returns validation error when lockNumber is missing', async () => {
    const formData = new FormData();
    formData.append('campaignId', 'Updated Campaign Id');
    formData.append('templateId', 'template-123');

    const result = await editTemplateCampaign({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        lockNumber: [expect.any(String)],
      },
    });
  });
});
