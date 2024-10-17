/* eslint-disable security/detect-non-literal-fs-filename */

import {
  AppSyncClient,
  GraphqlApi,
  paginateListGraphqlApis,
} from '@aws-sdk/client-appsync';
import { readFileSync } from 'node:fs';

export class AmplifyAppSyncClient {
  private readonly appSyncClient = new AppSyncClient({ region: 'eu-west-2' });

  private apiUrl: string;

  private userPoolId: string;

  constructor(amplifyOutputsPathPrefix = '../..') {
    const amplifyOutputs = JSON.parse(
      readFileSync(`${amplifyOutputsPathPrefix}/amplify_outputs.json`, 'utf8')
    );

    this.apiUrl = amplifyOutputs.data.url;
    this.userPoolId = amplifyOutputs.auth.user_pool_id;
  }

  getUserPoolId() {
    return this.userPoolId;
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
