import { ValidateLetterTemplateFilesLambda } from './api/validate-letter-template-files';
import { validateLetterTemplateFilesContainer } from './container';

export const handler = new ValidateLetterTemplateFilesLambda(
  validateLetterTemplateFilesContainer()
).sqsHandler;
