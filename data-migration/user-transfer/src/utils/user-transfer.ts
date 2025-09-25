import {
  UserTransferPlan,
  UserTransferPlanItem,
  UserTransferPlanItemResult,
  Template,
  UserData,
} from './types';
import { getTemplate, migrateOwnership } from './ddb-utils';
import { print } from './log-utils';
import { transferFileToClient, deleteFile, getFileHead } from './s3-utils';

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
        plans: templatesToMigrate,
      },
      orphaned: {
        count: templateIdsWithNoOwner.length,
        templateIds: templateIdsWithNoOwner,
      },
    };
  }

  public static async apply(
    item: UserTransferPlanItem,
    config: { bucketName: string; tableName: string; dryRun: boolean }
  ): Promise<UserTransferPlanItemResult> {
    const copyPromises = item.s3.files.map(async (file) => {
      if (config.dryRun) {
        await getFileHead(config.bucketName, file.from);
        print(`[DRY RUN] S3: transfer ${file.from} to ${file.to}`);
      } else {
        await transferFileToClient(
          config.bucketName,
          file.from,
          file.to,
          item.ddb.owner.to
        );
      }
    });

    const copyResult = await UserTransfer.processPromises(copyPromises);

    if (!copyResult.success) {
      print(`Skipping: [s3:copy]: ${item.templateId} copy failed`);

      return {
        ...copyResult,
        stage: 's3:copy',
      };
    }

    try {
      if (config.dryRun) {
        const template = await getTemplate(
          config.tableName,
          item.ddb.owner.from,
          item.templateId
        );

        if (!template) {
          throw new Error(`No template found for ${item.templateId}`);
        }

        print(
          `[DRY RUN] DynamoDB: template ${template.id.S} found and will transferred from ${item.ddb.owner.from} to CLIENT#${item.ddb.owner.to}`
        );
        print(
          `[DRY RUN] DynamoDB: template ${template.id.S} with owner ${item.ddb.owner.from} will be deleted`
        );
      } else {
        await migrateOwnership(
          config.tableName,
          item.templateId,
          item.ddb.owner.from,
          item.ddb.owner.to
        );
      }
    } catch (error) {
      print(
        `Failed: [ddb:transfer]: ${item.templateId} DynamoDB transaction failed`
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

    const deletePromises = item.s3.files.map(async (file) => {
      if (config.dryRun) {
        print(`[DRY RUN] S3: will delete ${file.from}`);
      } else {
        await deleteFile(config.bucketName, file.from);
      }
    });

    const deleteResult = await UserTransfer.processPromises(deletePromises);

    if (!deleteResult.success) {
      print(`Partial: [s3:delete]: ${item.templateId} delete failed`);

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
