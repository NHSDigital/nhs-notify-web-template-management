import FormData from 'form-data';

type TemplatePart = {
  _type: 'json';
  partName: string;
};

type FilePart = {
  _type: 'file';
  partName: string;
  file: Buffer;
  fileName?: string;
  fileType?: string;
};

export type PdfUploadPartSpec = TemplatePart | FilePart;

export function pdfLetterMultipart(
  parts: PdfUploadPartSpec[],
  template?: Record<string, unknown> | string
): {
  contentType: string;
  multipart: Buffer;
} {
  const fd = new FormData();
  for (const part of parts) {
    if (part._type === 'json') {
      fd.append(
        part.partName,
        typeof template === 'string' ? template : JSON.stringify(template)
      );
    }

    if (part._type === 'file') {
      fd.append(part.partName, part.file, {
        filename: part.fileName,
        contentType: part.fileType,
      });
    }
  }

  const multipart = fd.getBuffer();
  const boundary = fd.getBoundary();
  const contentType = `multipart/form-data; boundary=${boundary}`;

  return {
    contentType,
    multipart,
  };
}
