import { createHandler } from './api/process-proof';
import { createLetterFileRepositoryAndTemplateRepositoryContainer } from './container';

export const handler = createHandler(
  createLetterFileRepositoryAndTemplateRepositoryContainer()
);
