import { ConditionBuilder } from '../common/condition-builder';
import { UpdateCommandBuilder } from '../common/update-command-builder';
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
      new ConditionBuilder<Entity>(),
      optionalArgs
    );
  }

  build() {
    return this.updateBuilder.build();
  }
}
