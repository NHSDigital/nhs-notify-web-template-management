import { createHandler } from './api/process-proof';
import { letterFileRepositoryAndTemplateRepositoryContainer } from './container/letter-file-and-template-repository';

export const handler = createHandler(
  letterFileRepositoryAndTemplateRepositoryContainer()
);
