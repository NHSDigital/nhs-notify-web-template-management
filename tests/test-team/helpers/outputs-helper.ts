import * as fs from 'node:fs';

type Values = {
  value: string;
  type: string;
  sensitive: boolean;
};

type OutputConfig = {
  cognito_user_pool_client_id: Values;
  cognito_user_pool_id: Values;
  dynamodb_table_templates: Values;
};

export class OutputsHelper {
  private _config: OutputConfig;

  constructor() {
    this._config = JSON.parse(
      fs.readFileSync('../../sandbox_tf_outputs.json', 'utf8')
    );
  }

  public getTemplateStorageTableName() {
    return this._config.dynamodb_table_templates.value;
  }

  public getCognitoUserPoolId() {
    return this._config.cognito_user_pool_id.value;
  }

  public getCognitoUserPoolClientId() {
    return this._config.cognito_user_pool_client_id.value;
  }
}
