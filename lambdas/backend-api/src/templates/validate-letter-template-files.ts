import { ValidateLetterTemplateFilesLambda } from './api/validate-letter-template-files';
import { validateLetterTemplateFilesContainer } from './container/validate-letter-template';

export const handler = new ValidateLetterTemplateFilesLambda(
  validateLetterTemplateFilesContainer()
).sqsHandler;
