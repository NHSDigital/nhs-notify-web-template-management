
# this is not used for anything, the lambda shared module requires an SNS topic
resource "aws_sns_topic" "main" {
  name = "${local.csi}-sns"

  kms_master_key_id = var.kms_key_arn
}
