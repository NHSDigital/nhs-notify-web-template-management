import { createHandler } from './api/delete-failed-scanned-object';
import { uploadLetterFileRepositoryContainer } from './container';

export const handler = createHandler(uploadLetterFileRepositoryContainer());
