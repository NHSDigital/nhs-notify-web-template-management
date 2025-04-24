import { UpdateCommandBuilder } from './update-command-builder';
import { BuilderOptionalArgs } from '../types/builders';

export class EntityUpdateBuilder<Entity> {
  protected updateBuilder: UpdateCommandBuilder<Entity>;

  constructor(
    tableName: string,
    keys: Record<string, string>,
    optionalArgs?: BuilderOptionalArgs
  ) {
    this.updateBuilder = new UpdateCommandBuilder<Entity>(
      tableName,
      keys,
      optionalArgs
    );
  }

  build() {
    return this.updateBuilder.finalise();
  }
}
