import { getLetterUploadParts } from '../../app/get-letter-upload-parts';
import type { CreateUpdateTemplate } from 'nhs-notify-web-template-management-types';
import { pdfLetterMultipart } from 'nhs-notify-web-template-management-test-helper-utils';

describe('getLetterUploadParts', () => {
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
    const { multipart, contentType } = pdfLetterMultipart(
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

    const result = getLetterUploadParts(multipart, contentType);

    expect(result).toEqual({
      data: {
        template: initialTemplate,
        pdf: expect.any(File),
        csv: expect.any(File),
      },
    });

    expect(result.data!.pdf).toEqual(
      new File([pdf], 'template.pdf', {
        type: 'application/pdf',
        lastModified: result.data!.pdf!.lastModified,
      })
    );

    expect(result.data!.csv).toEqual(
      new File([csv], 'test-data.csv', {
        type: 'text/csv',
        lastModified: result.data!.csv!.lastModified,
      })
    );
  });

  test('defaults filenames to empty strings', () => {
    const { multipart, contentType } = pdfLetterMultipart(
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

    const result = getLetterUploadParts(multipart, contentType);

    expect(result).toEqual({
      data: {
        template: initialTemplate,
        pdf: expect.any(File),
        csv: expect.any(File),
      },
    });

    expect(result.data!.pdf).toEqual(
      new File([pdf], '', {
        lastModified: result.data!.pdf!.lastModified,
      })
    );
    expect(result.data!.csv).toEqual(
      new File([csv], '', {
        lastModified: result.data!.csv!.lastModified,
      })
    );
  });

  test('returns default blank file object for PDF when expected file parts are not present', () => {
    const { multipart, contentType } = pdfLetterMultipart(
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

    const result = getLetterUploadParts(multipart, contentType);

    expect(result).toEqual({
      data: {
        template: initialTemplate,
        pdf: expect.any(File),
      },
    });

    expect(result.data!.pdf).toEqual(
      new File([], '', {
        lastModified: result.data!.pdf!.lastModified,
      })
    );
  });

  test('returns failure result when template part cannot be parsed as JSON', () => {
    const { multipart, contentType } = pdfLetterMultipart(
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

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Template is unavailable or cannot be parsed',
        },
      },
    });
  });

  test('returns failure result when template part is missing', () => {
    const { multipart, contentType } = pdfLetterMultipart([
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

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Template is unavailable or cannot be parsed',
        },
      },
    });
  });

  test('returns failure result when number of parts is not 2 or 3', () => {
    const { multipart, contentType } = pdfLetterMultipart([
      {
        _type: 'file',
        partName: 'testCsv',
        file: Buffer.from(''),
        fileName: 'test-data.csv',
        fileType: 'text/csv',
      },
    ]);

    expect(getLetterUploadParts(multipart, contentType)).toEqual({
      error: {
        errorMeta: {
          code: 400,
          description: 'Unexpected number of form parts in form data: 1',
        },
      },
    });
  });
});
