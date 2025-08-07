import { createHandler } from './api/process-proof';
import { uploadLetterFileRepositoryAndTemplateRepositoryContainer } from './container';

export const handler = createHandler(
  uploadLetterFileRepositoryAndTemplateRepositoryContainer()
);
