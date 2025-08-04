locals {
  event_bus_arn = "arn:aws:events:eu-west-2:${var.observability_account_id}:event-bus/nhs-main-acct-alerts-bus"

  # VPC Subnet Maths (Equally devise a number of subnets across the availble AZs from a provided supernet)
  required_bits_public  = ceil(log(length(data.aws_availability_zones.available.names), 2))
  required_bits_private = ceil(log(length(data.aws_availability_zones.available.names), 2))

  public_subnet_cidrs = [
    for az_index, az in data.aws_availability_zones.available.names :
    cidrsubnet(var.vpc_cidr, max(var.vpc_subnet_cidr_bits.public, local.required_bits_public), az_index)
  ]

  private_subnet_cidrs = [
    for az_index, az in data.aws_availability_zones.available.names :
    cidrsubnet(var.vpc_cidr, max(var.vpc_subnet_cidr_bits.private, local.required_bits_private), az_index + length(data.aws_availability_zones.available.names))
  ]

  mock_letter_supplier_name     = "WTMMOCK"
  use_sftp_letter_supplier_mock = lookup(var.letter_suppliers, local.mock_letter_supplier_name, null) != null
}
