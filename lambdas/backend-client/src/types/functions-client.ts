import { Result } from './result';

export interface IFunctionsClient {
  sendEmail(templateId: string): Promise<Result<void>>;
}
