/* eslint-disable jsx-a11y/label-has-associated-control */
import { uploadData } from 'aws-amplify/storage';
import { randomUUID } from 'node:crypto';

async function uploadFile(formData: FormData) {
  'use server';

  try {
    const file = formData.get('file') as File;

    const result = await uploadData({
      path: `incoming/${randomUUID()}`,
      data: file,
    }).result;
    console.log('Succeeded:', result);
  } catch (error) {
    console.log('Error :', error);
  }
}

const UploadFilePage = async () => {
  return (
    <form action={uploadFile}>
      <label>
        <span>Upload a file</span>
        <input type='file' name='file' />
      </label>
      <button type='submit'>Submit</button>
    </form>
  );
};

export default UploadFilePage;
