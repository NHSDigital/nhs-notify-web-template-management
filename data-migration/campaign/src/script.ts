import fs from 'node:fs';
import process from 'node:process';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { $TemplateDtoSchema } from 'nhs-notify-backend-client';
import { z } from 'zod/v4';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

const sqs = new SQSClient({ region: 'eu-west-2' });

const sts = new STSClient({ region: 'eu-west-2' });

export async function getAccountId(): Promise<string> {
  const callerIdentity = await sts.send(new GetCallerIdentityCommand());
  const accountId = callerIdentity.Account;
  if (!accountId) {
    throw new Error('Unable to get account ID from caller');
  }
  return accountId;
}

const { environment, file, newCampaignId, clientId, supplier } = yargs(
  hideBin(process.argv)
)
  .options({
    environment: {
      type: 'string',
      demandOption: true,
    },
    clientId: {
      type: 'string',
      demandOption: true,
    },
    file: {
      type: 'string',
      demandOption: true,
    },
    newCampaignId: {
      type: 'string',
      demandOption: true,
    },
    supplier: {
      type: 'string',
      default: 'MBA',
    },
  })
  .parseSync();

async function main() {
  const acct = await getAccountId();

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const templateIds = fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const id of templateIds) {
    const updateInput: UpdateCommandInput = {
      TableName: `nhs-notify-${environment}-app-api-templates`,
      Key: {
        id,
        owner: `CLIENT#${clientId}`,
      },
      UpdateExpression:
        'SET templateStatus = :waitingForProofProofStatus, files.proofs = :emptyObj, campaignId = :newId REMOVE sftpSendLockTime',
      ExpressionAttributeValues: {
        ':newId': newCampaignId,
        ':pendingProofStatus': 'PENDING_PROOF_REQUEST',
        ':waitingForProofProofStatus': 'WAITING_FOR_PROOF',
        ':proofAvailableStatus': 'PROOF_AVAILABLE',
        ':submittedStatus': 'SUBMITTED',
        ':emptyObj': {},
      },
      ConditionExpression:
        'attribute_exists(id) AND templateStatus in (:pendingProofStatus, :waitingForProofProofStatus, :submittedStatus, :proofAvailableStatus)',
      ReturnValues: 'ALL_NEW',
      ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
    };

    const res = await ddb.send(new UpdateCommand(updateInput));

    console.log(`updated ${id}`);

    const template = z
      .intersection(
        $TemplateDtoSchema,
        z.object({
          templateType: z.literal('LETTER'),
          clientId: z.string(),
          personalisationParameters: z.array(z.string()),
          createdBy: z.string(),
        })
      )
      .parse(res.Attributes);

    const proofRequest = {
      campaignId: newCampaignId,
      language: template.language,
      letterType: template.letterType,
      pdfVersionId: template.files.pdfTemplate.currentVersion,
      personalisationParameters: template.personalisationParameters,
      supplier,
      templateId: id,
      templateName: template.name,
      testDataVersionId: template.files.testDataCsv?.currentVersion,
      user: { userId: template.createdBy, clientId: template.clientId },
    };

    await sqs.send(
      new SendMessageCommand({
        QueueUrl: `https://sqs.eu-west-2.amazonaws.com/${acct}/nhs-notify-${environment}-app-sftp-upload-queue`,
        MessageBody: JSON.stringify(proofRequest),
      })
    );

    console.log(`requested proof for ${id}`);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
