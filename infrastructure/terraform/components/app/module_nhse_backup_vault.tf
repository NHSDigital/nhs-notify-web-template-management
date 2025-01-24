module "nhse_backup_vault" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/aws-backup-source?ref=v1.0.6"
  count = var.destination_vault_arn != null ? 1:0

  project_name     = local.csi
  environment_name = var.environment

  backup_copy_vault_account_id = data.aws_arn.destination_vault_arn[0].account
  backup_copy_vault_arn        = data.aws_arn.destination_vault_arn[0].arn

  reports_bucket                     = local.acct.s3_buckets["backup_reports"]["bucket"]
  notifications_target_email_address = var.backup_report_recipient

  bootstrap_kms_key_arn = module.kms.key_id
  terraform_role_arn    = local.bootstrap.iam_github_deploy_role["arn"]

  backup_plan_config = {
                        "compliance_resource_types": [
                          "S3"
                        ],
                        "rules": [
                          {
                            "copy_action": {
                              "delete_after": var.retention_period
                            },
                            "lifecycle": {
                              "delete_after": var.retention_period
                            },
                            "name": "${local.csi}-backup-rule",
                            "schedule": var.backup_schedule_cron
                          }
                        ],
                        "selection_tag": "NHSE-Enable-Backup"
                      }

  # Note here that we need to explicitly disable DynamoDB backups in the source account.
  # The default config in the module enables backups for all resource types.
  backup_plan_config_dynamodb = {
                                  "compliance_resource_types": [
                                    "DynamoDB"
                                  ],
                                  "rules": [
                                    {
                                      "copy_action": {
                                        "delete_after": var.retention_period
                                      },
                                      "lifecycle": {
                                        "delete_after": var.retention_period
                                      },
                                      "name": "${local.csi}-backup-rule",
                                      "schedule": var.backup_schedule_cron
                                    }
                                  ],
                                  "enable": true,
                                  "selection_tag": "NHSE-Enable-Backup"
                                }
}

data "aws_arn" "destination_vault_arn" {
  count = var.destination_vault_arn != null ? 1:0

  arn = var.destination_vault_arn
}
