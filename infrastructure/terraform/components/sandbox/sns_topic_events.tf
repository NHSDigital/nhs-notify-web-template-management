
# this is not used for anything other than to keep the eventpub module happy
resource "aws_sns_topic" "events" {
  name = "${local.csi}-events-sns"

  kms_master_key_id = module.kms.key_id
}
