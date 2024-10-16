import {
  AppSyncClient,
  GraphqlApi,
  paginateListGraphqlApis,
} from '@aws-sdk/client-appsync';
import { readFileSync } from 'node:fs';

export class AmplifyAppSyncClient {
  private readonly appSyncClient = new AppSyncClient({ region: 'eu-west-2' });

  private apiUrl: string;

  constructor() {
    const amplifyOutputs = JSON.parse(
      readFileSync('../../amplify_outputs.json', 'utf8')
    );

    this.apiUrl = amplifyOutputs.data.url;
  }

  private async listGraphqlAPIs() {
    const apiList: GraphqlApi[] = [];

    const paginator = paginateListGraphqlApis(
      { client: this.appSyncClient },
      {}
    );

    for await (const { graphqlApis } of paginator) {
      apiList.push(...(graphqlApis ?? []));
    }

    return apiList;
  }

  async getApiId() {
    const graphqlAPIs = await this.listGraphqlAPIs();

    const matchingGraphqlAPI = graphqlAPIs.find(
      (graphqlAPI) => graphqlAPI.uris?.GRAPHQL === this.apiUrl
    );

    if (!matchingGraphqlAPI?.apiId) {
      throw new Error('No matching graphql API');
    }

    return matchingGraphqlAPI.apiId;
  }
}
