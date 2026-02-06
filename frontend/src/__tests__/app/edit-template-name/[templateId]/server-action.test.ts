import { redirect } from 'next/navigation';
import { NextRedirectError } from '@testhelpers/next-redirect';
import { patchTemplate } from '@utils/form-actions';
import { editTemplateName } from '@app/edit-template-name/[templateId]/server-action';

jest.mock('next/navigation');
jest.mocked(redirect).mockImplementation((url) => {
  throw new NextRedirectError(url);
});

jest.mock('@utils/form-actions');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('editTemplateName', () => {
  it('patches the template and redirects when all fields are valid', async () => {
    const formData = new FormData();
    formData.append('name', 'Updated Template Name');
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    await expect(editTemplateName({}, formData)).rejects.toMatchObject({
      message: 'NEXT_REDIRECT',
      url: '/preview-letter-template/template-123',
    });

    expect(patchTemplate).toHaveBeenCalledWith(
      'template-123',
      { name: 'Updated Template Name' },
      5
    );
  });

  it('returns validation error when name is empty', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    const result = await editTemplateName({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Enter a template name'],
      },
    });
  });

  it('returns validation error when name is missing', async () => {
    const formData = new FormData();
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    const result = await editTemplateName({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Enter a template name'],
      },
    });
  });

  it('returns validation error when templateId is missing', async () => {
    const formData = new FormData();
    formData.append('name', 'Updated Template Name');
    formData.append('lockNumber', '5');

    const result = await editTemplateName({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        templateId: [expect.any(String)],
      },
    });
  });

  it('returns validation error when lockNumber is missing', async () => {
    const formData = new FormData();
    formData.append('name', 'Updated Template Name');
    formData.append('templateId', 'template-123');

    const result = await editTemplateName({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        lockNumber: [expect.any(String)],
      },
    });
  });
});
