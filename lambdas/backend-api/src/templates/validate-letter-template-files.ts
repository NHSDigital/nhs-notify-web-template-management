import { ValidateLetterTemplateFilesLambda } from './api/validate-letter-template-files';
import { createContainer } from './container';

export const handler = new ValidateLetterTemplateFilesLambda(createContainer())
  .sqsHandler;
