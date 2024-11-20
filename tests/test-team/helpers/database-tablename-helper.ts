import {
  AppSyncClient,
  paginateListGraphqlApis,
  GraphqlApi,
} from '@aws-sdk/client-appsync';
import { Amplify } from 'aws-amplify';
import * as fs from 'node:fs';

export class DatabaseTableNameHelper {
  private readonly _appSyncClient: AppSyncClient;

  private _appApiId?: string;

  constructor() {
    this._appSyncClient = new AppSyncClient({ region: 'eu-west-2' });
  }

  private async listGraphqlAPIs() {
    const apiList: GraphqlApi[] = [];

    const paginator = paginateListGraphqlApis(
      { client: this._appSyncClient },
      {}
    );

    for await (const page of paginator) {
      const apiData = page.graphqlApis ?? [];
      apiList.push(...apiData);
    }

    return apiList;
  }

  private async getApiId() {
    if (this._appApiId) {
      return this._appApiId;
    }

    const amplifyOutput = JSON.parse(
      fs.readFileSync('../../amplify_outputs.json', 'utf8')
    );

    Amplify.configure(amplifyOutput);

    const graphqlAPIs = await this.listGraphqlAPIs();

    const outputUri = Amplify.getConfig().API?.GraphQL?.endpoint;

    const matchingGraphqlAPI = graphqlAPIs.find(
      (graphqlAPI) => graphqlAPI.uris?.GRAPHQL === outputUri
    );

    this._appApiId = matchingGraphqlAPI?.apiId;

    return this._appApiId;
  }

  public async getTemplateStorageTableName() {
    const appApiId = await this.getApiId();

    return `TemplateStorage-${appApiId}-NONE`;
  }
}
