import { createHandler } from './api/copy-scanned-object-to-internal';
import { uploadLetterFileRepositoryContainer } from './container';

export const handler = createHandler(uploadLetterFileRepositoryContainer());
