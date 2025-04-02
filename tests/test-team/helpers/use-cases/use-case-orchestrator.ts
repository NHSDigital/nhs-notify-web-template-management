export interface IUseCase<TResult> {
  execute(): Promise<TResult>;
}

export class UseCaseOrchestrator {
  async send<TResult>(useCase: IUseCase<TResult>) {
    return await useCase.execute();
  }
}
