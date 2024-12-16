import * as fs from 'node:fs';

export class DatabaseTableNameHelper {
  public async getTemplateStorageTableName() {
    const sandboxOutputs = JSON.parse(
      fs.readFileSync('../../sandbox_tf_outputs.json', 'utf8')
    );

    return sandboxOutputs?.dynamodb_table_templates?.value;
  }
}
