output "dns_zone" {
  value = {
    id          = aws_route53_zone.main.id
    name        = aws_route53_zone.main.name
    nameservers = aws_route53_zone.main.name_servers
  }
}

output "github_pat_ssm_param_name" {
  value = aws_ssm_parameter.github_pat.name
}

output "s3_buckets" {
  value = {
    access_logs = {
      arn    = module.s3bucket_access_logs.arn
      bucket = module.s3bucket_access_logs.bucket
      id     = module.s3bucket_access_logs.id
    }
    artefacts = {
      arn    = module.s3bucket_artefacts.arn
      bucket = module.s3bucket_artefacts.bucket
      id     = module.s3bucket_artefacts.id
    }
    artefacts_us_east_1 = {
      arn    = module.s3bucket_artefacts_us_east_1.arn
      bucket = module.s3bucket_artefacts_us_east_1.bucket
      id     = module.s3bucket_artefacts_us_east_1.id
    }
    backup_reports = {
      arn    = module.s3bucket_backup_reports.arn
      bucket = module.s3bucket_backup_reports.bucket
      id     = module.s3bucket_backup_reports.id
    }
    quarantine = {
      arn    = module.s3bucket_quarantine.arn
      bucket = module.s3bucket_quarantine.bucket
      id     = module.s3bucket_quarantine.id
    }
  }
}

output "vpc_subnets" {
  value = {
    public  = module.vpc.public_subnets
    private = module.vpc.private_subnets
  }
}

output "vpc_nat_ips" {
  value = module.vpc.nat_public_ips
}

output "log_subscription_role_arn" {
  value = module.obs_datasource.log_subscription_role_arn
}

output "ses_testing_config" {
  value = try({
    bucket_name   = module.ses_testing.0.bucket_name
    iam_role_arn  = module.ses_testing.0.iam_role_arn
    rule_set_name = module.ses_testing.0.rule_set_name
  }, null)
}
