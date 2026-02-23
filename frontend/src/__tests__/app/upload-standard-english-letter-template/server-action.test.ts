import { redirect, RedirectType } from 'next/navigation';
import { uploadStandardLetterTemplate } from '@app/upload-standard-english-letter-template/server-action';
import { uploadDocxTemplate } from '@utils/form-actions';
import { mockDeep } from 'jest-mock-extended';
import { TemplateDto } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

describe('uploadStandardLetterTemplate', () => {
  it('returns success when all fields are valid', async () => {
    const mockUploadDocxTemplate = jest
      .mocked(uploadDocxTemplate)
      .mockResolvedValue(
        mockDeep<TemplateDto>({
          id: 'template-id',
        })
      );

    const mockRedirect = jest.mocked(redirect);

    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    await uploadStandardLetterTemplate({}, formData);

    expect(mockUploadDocxTemplate).toHaveBeenCalledWith(
      {
        name: 'Test Template',
        campaignId: 'Campaign 1',
        letterType: 'x0',
        language: 'en',
        templateType: 'LETTER',
        letterVersion: 'AUTHORING',
      },
      file
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      '/preview-letter-template/template-id',
      RedirectType.push
    );
  });

  it('returns validation error when name is empty', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('campaignId', 'Campaign 1');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadStandardLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Enter a template name'],
      },
    });
  });

  it('returns validation error when name is missing', async () => {
    const formData = new FormData();
    formData.append('campaignId', 'Campaign 1');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadStandardLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Enter a template name'],
      },
    });
  });

  it('returns validation error when campaignId is empty', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', '');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadStandardLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        campaignId: ['Choose a campaign'],
      },
    });
  });

  it('returns validation error when campaignId is missing', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadStandardLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        campaignId: ['Choose a campaign'],
      },
    });
  });

  it('returns validation error when file is missing', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');

    const result = await uploadStandardLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        file: ['Choose a template file'],
      },
    });
  });

  it('returns validation error when file has incorrect MIME type', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');

    const file = new File(['content'], 'template.pdf', {
      type: 'application/pdf',
    });
    formData.append('file', file);

    const result = await uploadStandardLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        file: ['Choose a template file'],
      },
    });
  });

  it('returns multiple validation errors when multiple fields are invalid', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('campaignId', '');

    const result = await uploadStandardLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Enter a template name'],
        campaignId: ['Choose a campaign'],
        file: ['Choose a template file'],
      },
    });
  });
});
