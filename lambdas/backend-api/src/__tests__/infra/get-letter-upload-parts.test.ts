import {
  getPdfUploadParts,
  getDocxUploadParts,
} from '../../app/get-letter-upload-parts';
import type { CreateUpdateTemplate } from 'nhs-notify-web-template-management-types';
import { getTestMultipartFormData } from 'nhs-notify-web-template-management-test-helper-utils';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00'));
});

describe('getDocxUploadParts', () => {
  const initialTemplate: CreateUpdateTemplate = {
    templateType: 'LETTER',
    name: 'template-name',
    letterType: 'x0',
    language: 'en',
    campaignId: 'camapign-id',
    letterVersion: 'AUTHORING',
  };

  const docxTemplate = Buffer.from('docxTemplate');

  test('parses a multipart letter event', () => {
    const { multipart, contentType } = getTestMultipartFormData(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'docxTemplate',
          file: docxTemplate,
          fileName: 'template.docx',
          fileType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
      initialTemplate
    );

    const result = getDocxUploadParts(multipart, contentType);

    expect(result).toEqual({
      data: {
        template: initialTemplate,
        docxTemplate: new File([docxTemplate], 'template.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          lastModified: new Date('2022-01-01 09:00').getTime(),
        }),
      },
    });
  });

  test('returns failure result when docx part is missing name', () => {
    const { multipart, contentType } = getTestMultipartFormData([
      { _type: 'json', partName: 'template' },
      {
        _type: 'file',
        partName: 'docxTemplate',
        file: docxTemplate,
        fileType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    ]);

    expect(getDocxUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Docx template file is unavailable or cannot be parsed',
        },
      },
    });
  });

  test('returns failure result when template part is missing', () => {
    const { multipart, contentType } = getTestMultipartFormData([
      {
        _type: 'file',
        partName: 'docxTemplate',
        file: docxTemplate,
        fileName: 'template.docx',
        fileType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      {
        _type: 'file',
        partName: 'docxTemplate',
        file: docxTemplate,
        fileName: 'template.docx',
        fileType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    ]);

    expect(getDocxUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Template is unavailable or cannot be parsed',
        },
      },
    });
  });

  test('returns failure result when number of parts is not 2', () => {
    const { multipart, contentType } = getTestMultipartFormData([
      {
        _type: 'file',
        partName: 'docxTemplate',
        file: docxTemplate,
        fileName: 'template.docx',
        fileType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    ]);

    expect(getDocxUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Unexpected number of form parts in form data: 1',
        },
      },
    });
  });
});

describe('getPdfUploadParts', () => {
  const initialTemplate: CreateUpdateTemplate = {
    templateType: 'LETTER',
    name: 'template-name',
    letterType: 'x0',
    language: 'en',
    campaignId: 'camapign-id',
    letterVersion: 'PDF',
  };

  const pdf = Buffer.from('letterPdf');
  const csv = Buffer.from('testCsv');

  test('parses a multipart letter event', () => {
    const { multipart, contentType } = getTestMultipartFormData(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: pdf,
          fileName: 'template.pdf',
          fileType: 'application/pdf',
        },
        {
          _type: 'file',
          partName: 'testCsv',
          file: csv,
          fileName: 'test-data.csv',
          fileType: 'text/csv',
        },
      ],
      initialTemplate
    );

    const result = getPdfUploadParts(multipart, contentType);

    expect(result).toEqual({
      data: {
        template: initialTemplate,
        pdf: new File([pdf], 'template.pdf', {
          type: 'application/pdf',
          lastModified: result.data!.pdf!.lastModified,
        }),
        csv: new File([csv], 'test-data.csv', {
          type: 'text/csv',
          lastModified: result.data!.csv!.lastModified,
        }),
      },
    });
  });

  test('defaults filenames to empty strings', () => {
    const { multipart, contentType } = getTestMultipartFormData(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: pdf,
          fileType: 'application/pdf',
        },
        {
          _type: 'file',
          partName: 'testCsv',
          file: csv,
          fileType: 'text/csv',
        },
      ],
      initialTemplate
    );

    const result = getPdfUploadParts(multipart, contentType);

    expect(result).toEqual({
      data: {
        template: initialTemplate,
        pdf: new File([pdf], '', {
          lastModified: result.data!.pdf!.lastModified,
        }),
        csv: new File([csv], '', {
          lastModified: result.data!.csv!.lastModified,
        }),
      },
    });
  });

  test('returns default blank file object for PDF when expected file parts are not present', () => {
    const { multipart, contentType } = getTestMultipartFormData(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'unexpected',
          file: Buffer.from(''),
          fileType: 'application/pdf',
        },
        {
          _type: 'file',
          partName: 'another_unexpected',
          file: Buffer.from(''),
          fileType: 'text/csv',
        },
      ],
      initialTemplate
    );

    const result = getPdfUploadParts(multipart, contentType);

    expect(result).toEqual({
      data: {
        template: initialTemplate,
        pdf: new File([], '', {
          lastModified: result.data!.pdf!.lastModified,
        }),
      },
    });
  });

  test('returns failure result when template part cannot be parsed as JSON', () => {
    const { multipart, contentType } = getTestMultipartFormData(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: Buffer.from(''),
          fileName: 't.pdf',
          fileType: 'application/pdf',
        },
        {
          _type: 'file',
          partName: 'testCsv',
          file: Buffer.from(''),
          fileName: 't.csv',
          fileType: 'text/csv',
        },
      ],
      'not_json'
    );

    expect(getPdfUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Template is unavailable or cannot be parsed',
        },
      },
    });
  });

  test('returns failure result when template part is missing', () => {
    const { multipart, contentType } = getTestMultipartFormData([
      {
        _type: 'file',
        partName: 'letterPdf',
        file: Buffer.from(''),
        fileName: 't.pdf',
        fileType: 'application/pdf',
      },
      {
        _type: 'file',
        partName: 'testCsv',
        file: Buffer.from(''),
        fileName: 't.csv',
        fileType: 'text/csv',
      },
    ]);

    expect(getPdfUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Template is unavailable or cannot be parsed',
        },
      },
    });
  });

  test('returns failure result when number of parts is not 2 or 3', () => {
    const { multipart, contentType } = getTestMultipartFormData([
      {
        _type: 'file',
        partName: 'testCsv',
        file: Buffer.from(''),
        fileName: 'test-data.csv',
        fileType: 'text/csv',
      },
    ]);

    expect(getPdfUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Unexpected number of form parts in form data: 1',
        },
      },
    });
  });
});
