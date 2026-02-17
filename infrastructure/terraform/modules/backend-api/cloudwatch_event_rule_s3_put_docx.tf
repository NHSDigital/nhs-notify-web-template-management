resource "aws_cloudwatch_event_rule" "s3_put_docx" {
  name        = "${local.csi}-s3-put-docx"
  description = "Matches s3 PutObject event for new docx template in internal"

  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["Object Created"]
    detail = {
      bucket = {
        name = [module.s3bucket_internal.id]
      }
      object = {
        key = [{ prefix = "docx-template/" }]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "s3_put_docx" {
  rule = aws_cloudwatch_event_rule.s3_put_docx.name
  arn  = module.lambda_forward_initial_render_request.function_arn
}
