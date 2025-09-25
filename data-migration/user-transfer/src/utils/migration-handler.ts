import { UserData } from './cognito-utils';
import {
  MigrationPlan,
  MigrationPlanItem,
  MigrationPlanItemResult,
  Template,
} from './constants';
import { migrateOwnership } from './ddb-utils';
import { print } from './log';
import { copyObjectsV2, deleteObjectsV2 } from './s3-utils';

export class MigrationHandler {
  public static async plan(
    users: UserData[],
    ddb: { tableName: string; templates: Template[] },
    s3: { bucketName: string; files: string[] }
  ): Promise<MigrationPlan> {
    const templatesToMigrate: MigrationPlanItem[] = [];
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
      run: 0,
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
    item: MigrationPlanItem,
    config: { bucketName: string; tableName: string; dryRun: boolean }
  ): Promise<MigrationPlanItemResult> {
    const copyPromises = item.s3.files.map((file) =>
      copyObjectsV2(
        config.bucketName,
        file.from,
        file.to,
        item.ddb.owner.to,
        config.dryRun
      )
    );

    const copyResult = await MigrationHandler.processPromises(copyPromises);

    if (!copyResult.success) {
      print(`Skipping: [s3:copy]: ${item.templateId} copy failed`);

      return {
        ...copyResult,
        stage: 's3:copy',
      };
    }

    try {
      await migrateOwnership(
        config.tableName,
        item.templateId,
        item.ddb.owner.from,
        item.ddb.owner.to,
        config.dryRun
      );
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

    const deletePromises = item.s3.files.map((file) =>
      deleteObjectsV2(config.bucketName, file.from, config.dryRun)
    );

    const deleteResult = await MigrationHandler.processPromises(deletePromises);

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
