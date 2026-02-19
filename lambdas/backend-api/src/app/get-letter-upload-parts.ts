import { File } from 'node:buffer';
import { failure, success } from '@backend-api/utils/result';
import { ErrorCase, Result } from 'nhs-notify-backend-client';
import { LETTER_MULTIPART } from 'nhs-notify-backend-client/src/schemas/constants';
import { parse as parseMultipart, getBoundary } from 'parse-multipart-data';

export function getDocxUploadParts(
  base64body: Buffer,
  contentType: string
): Result<{ template: unknown; docxTemplate: File }> {
  const boundary = getBoundary(contentType);

  const formParts = parseMultipart(base64body, boundary);

  if (formParts.length !== 2) {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      `Unexpected number of form parts in form data: ${formParts.length}`
    );
  }

  const docxPart = formParts.find(
    (part) => part.name === LETTER_MULTIPART.DOCX.name
  );

  if (!docxPart || !docxPart.data || !docxPart.filename || !docxPart.type) {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      'Docx template file is unavailable or cannot be parsed'
    );
  }

  const docxTemplate = new File(
    [new Uint8Array(docxPart.data)],
    docxPart.filename,
    {
      type: docxPart.type,
    }
  );

  const templatePart = formParts
    .find((part) => part.name === LETTER_MULTIPART.TEMPLATE.name)
    ?.data.toString();

  let template;

  try {
    template = JSON.parse(templatePart ?? '');
  } catch {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      'Template is unavailable or cannot be parsed'
    );
  }

  return success({ template, docxTemplate });
}

export function getPdfUploadParts(
  base64body: Buffer,
  contentType: string
): Result<{ template: unknown; pdf: File; csv?: File }> {
  const boundary = getBoundary(contentType);

  const formParts = parseMultipart(base64body, boundary);

  if (formParts.length < 2 || formParts.length > 3) {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      `Unexpected number of form parts in form data: ${formParts.length}`
    );
  }

  const pdfPart = formParts.find(
    (part) => part.name === LETTER_MULTIPART.PDF.name
  );

  const pdf = new File(
    pdfPart?.data ? [new Uint8Array(pdfPart.data)] : [],
    pdfPart?.filename ?? '',
    {
      type: pdfPart?.type,
    }
  );

  const templatePart = formParts
    .find((part) => part.name === LETTER_MULTIPART.TEMPLATE.name)
    ?.data.toString();

  let template;

  try {
    template = JSON.parse(templatePart ?? '');
  } catch {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      'Template is unavailable or cannot be parsed'
    );
  }

  const csvPart = formParts.find(
    (part) => part.name === LETTER_MULTIPART.CSV.name
  );

  const csv =
    csvPart &&
    new File([new Uint8Array(csvPart.data)], csvPart.filename ?? '', {
      type: csvPart.type,
    });

  return success({ template, pdf, csv });
}
