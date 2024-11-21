output "output_path" {
  value = data.archive_file.zip.output_path
}

output "base64sha256" {
  value = data.archive_file.zip.output_base64sha256
}
