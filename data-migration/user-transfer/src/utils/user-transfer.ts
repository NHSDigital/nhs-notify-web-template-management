import {
  UserTransferPlan,
  UserTransferPlanItem,
  UserTransferPlanItemResult,
  Template,
  UserData,
} from './types';
import { migrateOwnership } from './ddb-utils';
import { print } from './log-utils';
import { transferFileToClient, deleteFile, getFileHead } from './s3-utils';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

export class UserTransfer {
  public static async plan(
    users: UserData[],
    ddb: { tableName: string; templates: Template[] },
    s3: { bucketName: string; files: string[] }
  ): Promise<UserTransferPlan> {
    const templatesToMigrate: UserTransferPlanItem[] = [];
    const templateIdsWithNoOwner = [];

    for (const template of ddb.templates) {
      const user = users.find((r) => r.userId === template.owner);

      if (!user) {
        // Note: We've already filtered out CLIENT# at the DB level
        templateIdsWithNoOwner.push(template.id);
        continue;
      }

      const files = s3.files.filter((fileName) =>
        fileName.includes(template.id)
      );

      templatesToMigrate.push({
        templateId: template.id,
        status: 'migrate',
        stage: 'initial',
        ddb: {
          owner: {
            from: template.owner,
            to: user.clientId,
          },
        },
        s3: {
          files: files.map((file) => ({
            from: file,
            to: file.replace(template.owner, user.clientId),
          })),
        },
      });
    }

    return {
      total: ddb.templates.length,
      tableName: ddb.tableName,
      bucketName: s3.bucketName,
      migrate: {
        count: templatesToMigrate.length,
        plans: templatesToMigrate.filter((r) => r.s3.files.length > 0),
      },
      orphaned: {
        count: templateIdsWithNoOwner.length,
        templateIds: templateIdsWithNoOwner,
      },
    };
  }

  public static async apply(
    migration: UserTransferPlanItem,
    template: Record<string, AttributeValue>,
    config: { bucketName: string; tableName: string; dryRun: boolean }
  ): Promise<UserTransferPlanItemResult> {
    const copyPromises = migration.s3.files.map(async (file) => {
      if (config.dryRun) {
        await getFileHead(config.bucketName, file.from);
        print(`[DRY RUN] S3: transfer ${file.from} to ${file.to}`);
      } else {
        await transferFileToClient(
          config.bucketName,
          file.from,
          file.to,
          migration.ddb.owner.to
        );
      }
    });

    const copyResult = await UserTransfer.processPromises(copyPromises);

    if (!copyResult.success) {
      print(`Skipping: [s3:copy]: ${migration.templateId} copy failed`);

      return {
        ...copyResult,
        stage: 's3:copy',
      };
    }

    try {
      if (config.dryRun) {
        print(
          `[DRY RUN] DynamoDB: template ${template.id.S} found and will transferred from ${migration.ddb.owner.from} to CLIENT#${migration.ddb.owner.to}`
        );
        print(
          `[DRY RUN] DynamoDB: template ${template.id.S} with owner ${migration.ddb.owner.from} will be deleted`
        );
      } else {
        await migrateOwnership(
          config.tableName,
          template,
          migration.ddb.owner.from,
          migration.ddb.owner.to
        );
      }
    } catch (error) {
      print(
        `Failed: [ddb:transfer]: ${migration.templateId} DynamoDB transaction failed`
      );

      return {
        success: false,
        stage: 'ddb:transfer',
        reasons: [
          `Transaction failed moving template across`,
          JSON.stringify(error),
        ],
      };
    }

    const deletePromises = migration.s3.files.map(async (file) => {
      if (config.dryRun) {
        print(`[DRY RUN] S3: will delete ${file.from}`);
      } else {
        await deleteFile(config.bucketName, file.from);
      }
    });

    const deleteResult = await UserTransfer.processPromises(deletePromises);

    if (!deleteResult.success) {
      print(`Partial: [s3:delete]: ${migration.templateId} delete failed`);

      return {
        ...deleteResult,
        stage: 's3:delete',
      };
    }

    return {
      success: true,
      stage: 'finished',
    };
  }

  private static async processPromises(promises: Promise<unknown>[]) {
    const result = await Promise.allSettled(promises);

    const rejected = result.filter((r) => r.status === 'rejected');

    if (rejected.length > 0) {
      return {
        success: false,
        reasons: [
          `Failed processing ${rejected.length} / ${promises.length}`,
          ...rejected.map((r) => r.reason),
        ],
      };
    }

    return {
      success: true,
    };
  }
}
