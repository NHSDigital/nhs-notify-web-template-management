resource "aws_cloudformation_stack" "sender_id" {
  name          = "${local.csi}-sender-id"

  template_body = <<EOF
AWSTemplateFormatVersion: '2010-09-09'
Description: Register UK SMS Sender ID

Resources:
  Sender:
    Type: AWS::SMSVOICE::SenderId
    Properties:
      IsoCountryCode: GB
      SenderId: ${var.sender_id}
  ConfigurationSet:
    Type: AWS::SMSVOICE::ConfigurationSet
    Properties:
      ConfigurationSetName: ${local.csi}-sms
      DefaultSenderId: ${var.sender_id}
      EventDestinations:
        - EventDestinationName: Cloudwatch
          Enabled: true
          MatchingEventTypes:
            - ALL
          CloudWatchLogsDestination:
            IamRoleArn: ${aws_iam_role.smsvoice.arn}
            LogGroupArn: ${aws_cloudwatch_log_group.smsvoice_events.arn}
EOF
}