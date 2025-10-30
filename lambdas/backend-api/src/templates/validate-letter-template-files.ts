import { ValidateLetterTemplateFilesLambda } from './api/validate-letter-template-files';
import { validateLetterTemplateContainer } from './container';

export const handler = new ValidateLetterTemplateFilesLambda(
  validateLetterTemplateContainer()
).sqsHandler;
