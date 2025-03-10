import FormData from 'form-data';

type TemplatePart = {
  _type: 'json';
  partName: string;
};

type FilePart = {
  _type: 'file';
  partName: string;
  file: File;
  fileName?: string;
  fileType?: string;
};

export type PdfUploadPartSpec = TemplatePart | FilePart;

export async function pdfLetterMultipart(
  parts: PdfUploadPartSpec[],
  template: Record<string, unknown>
): Promise<{
  contentType: string;
  multipart: Buffer;
}> {
  const fd = new FormData();
  for (const part of parts) {
    if (part._type === 'json') {
      fd.append(part.partName, JSON.stringify(template));
    }

    if (part._type === 'file') {
      const buf = Buffer.from(await part.file.bytes());

      fd.append(part.partName, buf, {
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
