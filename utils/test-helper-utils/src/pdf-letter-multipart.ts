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

export function getTestMultipartFormData(
  parts: PdfUploadPartSpec[],
  template?: Record<string, unknown> | string
): {
  contentType: string;
  multipart: Buffer;
} {
  const fd = new FormData();
  for (const part of parts) {
    switch (part._type) {
      case 'json': {
        fd.append(
          part.partName,
          typeof template === 'string' ? template : JSON.stringify(template)
        );
        break;
      }
      case 'file': {
        fd.append(part.partName, part.file, {
          filename: part.fileName,
          contentType: part.fileType,
        });
        break;
      }
      default: {
        throw new Error(`unknown part type ${part}`);
      }
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
