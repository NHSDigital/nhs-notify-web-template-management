/* eslint-disable no-await-in-loop */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-var-requires */

import { test as teardown } from '@playwright/test';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { Session } from '../../../src/utils/types';
import { Schema } from '../../../amplify/data/resource';
import { TemplateMgmtCreatePage } from '../pages/template-mgmt-create-page';

const config = require('@/amplify_outputs.json');

teardown('teardown session data', async () => {
  const sessionData: Session[] = [
    ...TemplateMgmtChoosePage.sessionData,
    ...TemplateMgmtCreatePage.sessionData,
  ];

  Amplify.configure(config);

  const client = generateClient<Schema>({ authMode: 'iam' });

  for await (const data of sessionData) {
    await client.models.SessionStorage.delete(data);
  }
});
