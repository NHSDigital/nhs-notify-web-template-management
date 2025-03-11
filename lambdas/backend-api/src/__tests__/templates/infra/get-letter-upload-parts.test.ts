import { getLetterUploadParts } from '@backend-api/templates/app/get-letter-upload-parts';
import { CreateTemplate } from 'nhs-notify-backend-client';
import { pdfLetterMultipart } from 'nhs-notify-web-template-management-test-helper-utils';

describe('getLetterUploadParts', () => {
  const initialTemplate: CreateTemplate = {
    templateType: 'LETTER',
    name: 'template-name',
    letterType: 'x0',
    language: 'en',
    files: {
      pdfTemplate: {
        fileName: 'template.pdf',
      },
      testDataCsv: {
        fileName: 'test-data.csv',
      },
    },
  };

  test('parses a multipart letter event', async () => {
    const pdf = new File(['letterPdf'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['testCsv'], 'test-data.csv', {
      type: 'text/csv',
    });

    const { multipart, contentType } = await pdfLetterMultipart(
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

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      data: {
        template: initialTemplate,
        pdf,
        csv,
      },
    });
  });

  test('defaults filenames to empty strings', async () => {
    const pdf = new File(['letterPdf'], '');
    const csv = new File(['testCsv'], '');

    const { multipart, contentType } = await pdfLetterMultipart(
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

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      data: {
        template: initialTemplate,
        pdf,
        csv,
      },
    });
  });

  test('returns default blank file object for PDF when expected file parts are not present', async () => {
    const pdf = new File(['letterPdf'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['testCsv'], 'test-data.csv', {
      type: 'text/csv',
    });

    const { multipart, contentType } = await pdfLetterMultipart(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'unexpected',
          file: pdf,
          fileType: 'application/pdf',
        },
        {
          _type: 'file',
          partName: 'another_unexpected',
          file: csv,
          fileType: 'text/csv',
        },
      ],
      initialTemplate
    );

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      data: {
        template: initialTemplate,
        pdf: new File([], ''),
      },
    });
  });

  test('returns failure result when template part cannot be parsed as JSON', async () => {
    const pdf = new File(['letterPdf'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['testCsv'], 'test-data.csv', {
      type: 'text/csv',
    });

    const { multipart, contentType } = await pdfLetterMultipart(
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
      'not_json'
    );

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      error: {
        code: 400,
        message: 'Invalid request',
      },
    });
  });

  test('returns failure result when template part is missing', async () => {
    const pdf = new File(['letterPdf'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['testCsv'], 'test-data.csv', {
      type: 'text/csv',
    });

    const { multipart, contentType } = await pdfLetterMultipart([
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
    ]);

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      error: {
        code: 400,
        message: 'Invalid request',
      },
    });
  });

  test('returns failure result when number of parts is not 2 or 3', async () => {
    const { multipart, contentType } = await pdfLetterMultipart(
      [
        {
          _type: 'file',
          partName: 'testCsv',
          file: new File(['testCsv'], 'test-data.csv', {
            type: 'text/csv',
          }),
          fileName: 'test-data.csv',
          fileType: 'text/csv',
        },
      ],
      'not_json'
    );

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      error: {
        code: 400,
        message: 'Invalid request',
      },
    });
  });
});
