'use client';

import { SubmitEventHandler } from 'react';
import { uploadStandardLetterTemplate } from '../app/upload-standard-english-letter-template/server-action';
import { useRouter } from 'next/navigation';

export function Upload() {
  const router = useRouter();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const file = fd.get('file');
    fd.delete('file');

    const response = await uploadStandardLetterTemplate(fd);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = (response as any).uploadUrl;

    console.log(response);

    await fetch(url, { method: 'PUT', body: file });

    router.push(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `/preview-letter-template/${(response as any).id}?from=upload`
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='file' name='file' />
      <button type='submit'>Upload</button>
    </form>
  );
}
