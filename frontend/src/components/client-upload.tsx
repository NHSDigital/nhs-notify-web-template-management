'use client';

import { type FormEvent } from 'react';
import { uploadStandardLetterTemplate } from '../app/upload-standard-english-letter-template/server-action';
import { useRouter } from 'next/navigation';

export function Upload() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get('file');
    fd.delete('file');

    const response = await uploadStandardLetterTemplate(fd);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { uploadUrl, uploadFields, id } = response as any;

    const s3FormData = new FormData();
    for (const [key, value] of Object.entries(
      uploadFields as Record<string, string>
    )) {
      s3FormData.append(key, value);
    }
    s3FormData.append('file', file!);

    await fetch(uploadUrl, { method: 'POST', body: s3FormData });

    router.push(`/preview-letter-template/${id}?from=upload`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='file' name='file' />
      <button type='submit'>Upload</button>
    </form>
  );
}
