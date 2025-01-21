import * as fs from 'node:fs';

type Config = {
  auth: {
    user_pool_id: string;
    user_pool_client_id: string;
  };
  meta: {
    dynamo_table_name: string;
    backend_api_url: string;
  };
};

export class ConfigHelper {
  private _config: Config;

  constructor() {
    this._config = JSON.parse(
      fs.readFileSync('../../frontend/amplify_outputs.json', 'utf8')
    );
  }

  public getTemplateStorageTableName() {
    return this._config.meta.dynamo_table_name;
  }

  public getCognitoUserPoolId() {
    return this._config.auth.user_pool_id;
  }

  public getCognitoUserPoolClientId() {
    return this._config.auth.user_pool_client_id;
  }
}
