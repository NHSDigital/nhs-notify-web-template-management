import { uploadLargePrintLetterTemplate } from '@app/upload-large-print-letter-template/server-action';

describe('uploadLargePrintLetterTemplate', () => {
  it('returns success when all fields are valid', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadLargePrintLetterTemplate({}, formData);

    expect(result.errorState).toBeUndefined();
    expect(result.fields).toEqual({
      name: 'Test Template',
      campaignId: 'Campaign 1',
      file,
    });
  });

  it('returns validation error when name is empty', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('campaignId', 'Campaign 1');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadLargePrintLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Enter a template name'],
      },
    });
    expect(result.fields).toEqual({
      name: '',
      campaignId: 'Campaign 1',
      file,
    });
  });

  it('returns validation error when name is missing', async () => {
    const formData = new FormData();
    formData.append('campaignId', 'Campaign 1');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadLargePrintLetterTemplate({}, formData);

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

    const result = await uploadLargePrintLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        campaignId: ['Choose a campaign'],
      },
    });
    expect(result.fields).toEqual({
      name: 'Test Template',
      campaignId: '',
      file,
    });
  });

  it('returns validation error when campaignId is missing', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadLargePrintLetterTemplate({}, formData);

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

    const result = await uploadLargePrintLetterTemplate({}, formData);

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

    const result = await uploadLargePrintLetterTemplate({}, formData);

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

    const result = await uploadLargePrintLetterTemplate({}, formData);

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
