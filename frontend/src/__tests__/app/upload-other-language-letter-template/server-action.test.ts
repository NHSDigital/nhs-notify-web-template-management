import { uploadOtherLanguageLetterTemplate } from '@app/upload-other-language-letter-template/server-action';

describe('uploadOtherLanguageLetterTemplate', () => {
  it('returns success when all fields are valid', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');
    formData.append('language', 'lv');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

    expect(result.errorState).toBeUndefined();
    expect(result.fields).toEqual({
      name: 'Test Template',
      campaignId: 'Campaign 1',
      language: 'lv',
    });
  });

  it('returns validation error when name is empty', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('campaignId', 'Campaign 1');
    formData.append('language', 'lv');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

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
    formData.append('language', 'lv');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

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
    formData.append('language', 'lv');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

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
    formData.append('language', 'lv');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        campaignId: ['Choose a campaign'],
      },
    });
  });

  it('returns validation error when language is empty', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');
    formData.append('language', '');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        language: ['Choose a language'],
      },
    });
  });

  it('returns validation error when language is missing', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        language: ['Choose a language'],
      },
    });
  });

  it('returns validation error when language is invalid', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');
    formData.append('language', 'not a language code');

    const file = new File(['content'], 'template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        language: ['Choose a language'],
      },
    });
  });

  it('returns validation error when file is missing', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Template');
    formData.append('campaignId', 'Campaign 1');
    formData.append('language', 'lv');

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

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
    formData.append('language', 'lv');

    const file = new File(['content'], 'template.pdf', {
      type: 'application/pdf',
    });
    formData.append('file', file);

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

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
    formData.append('language', '');

    const result = await uploadOtherLanguageLetterTemplate({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Enter a template name'],
        campaignId: ['Choose a campaign'],
        language: ['Choose a language'],
        file: ['Choose a template file'],
      },
    });
  });
});
