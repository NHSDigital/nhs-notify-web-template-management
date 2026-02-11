// Replace me with the actual code for your Lambda function
import { Handler } from 'aws-lambda';
import carbone from 'carbone';

export const handler: Handler = async (event) => {
  console.log('Received event:', event);

  await new Promise((resolve, reject) => {
    carbone.render(
      'var/task/doc.docx',
      {},
      { convertTo: 'pdf' },
      (err, buf) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log('Buffer.isBuffer(buf)', Buffer.isBuffer(buf));
          resolve(buf);
        }
      }
    );
  });

  return {
    statusCode: 200,
    body: 'Event logged',
  };
};
