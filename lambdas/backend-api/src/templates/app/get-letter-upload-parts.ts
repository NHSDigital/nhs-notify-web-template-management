import { failure, success } from '@backend-api/utils/result';
import { ErrorCase, Result } from 'nhs-notify-backend-client';
import { LETTER_MULTIPART } from 'nhs-notify-backend-client/src/schemas/constants';
import { parse as parseMultipart, getBoundary } from 'parse-multipart-data';

export function getLetterUploadParts(
  base64body: Buffer,
  contentType: string
): Result<{ template: unknown; pdf: File; csv?: File }> {
  const boundary = getBoundary(contentType);

  const formParts = parseMultipart(base64body, boundary);

  if (formParts.length < 2 || formParts.length > 3) {
    return failure(ErrorCase.VALIDATION_FAILED, 'Invalid request');
  }

  const pdfPart = formParts.find(
    (part) => part.name === LETTER_MULTIPART.PDF.name
  );

  const pdf = new File(
    pdfPart?.data ? [pdfPart.data] : [],
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
    return failure(ErrorCase.VALIDATION_FAILED, 'Invalid request');
  }

  const csvPart = formParts.find(
    (part) => part.name === LETTER_MULTIPART.CSV.name
  );

  const csv =
    csvPart &&
    new File([csvPart.data], csvPart.filename ?? '', { type: csvPart.type });

  return success({ template, pdf, csv });
}
