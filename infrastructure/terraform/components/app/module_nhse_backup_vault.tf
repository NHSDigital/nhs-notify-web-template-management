module "nhse_backup_vault" {
  # source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/aws-backup-source?ref=v1.0.6"
  source = "/Users/aiden.vaines/Clients/NHS/notify/nhs-notify-shared-modules/infrastructure/modules/aws-backup-source"
  count = var.destination_vault_arn != null ? 1:0

  project_name     = local.csi
  environment_name = var.environment

  backup_copy_vault_account_id = data.aws_arn.destination_vault_arn[0].account
  backup_copy_vault_arn        = data.aws_arn.destination_vault_arn[0].arn

  reports_bucket                     = local.acct.s3_buckets["backup_reports"]["bucket"]
  notifications_target_email_address = var.backup_report_recipient
  notification_kms_key               = module.kms.key_id

  management_ci_role_arn = local.bootstrap.iam_github_deploy_role["arn"]

  backup_plan_config_dynamodb = {
                                  "compliance_resource_types": [
                                    "DynamoDB"
                                  ],
                                  "rules": [
                                    {
                                      "name": "${local.csi}-backup-rule",
                                      "schedule": var.backup_schedule_cron,
                                      "copy_action": {
                                        "delete_after": var.retention_period
                                      },
                                      "lifecycle": {
                                        "delete_after": var.retention_period
                                      }
                                    }
                                  ],
                                  "enable": true,
                                  "selection_tag": "NHSE-Enable-Dynamo-Backup"
                                }
}

data "aws_arn" "destination_vault_arn" {
  count = var.destination_vault_arn != null ? 1:0

  arn = var.destination_vault_arn
}
