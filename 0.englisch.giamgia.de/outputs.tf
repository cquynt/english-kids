output "record_fqdn" {
  description = "FQDN of the created/updated record."
  value       = cloudflare_record.app.hostname
}

output "record_id" {
  description = "Cloudflare record ID."
  value       = cloudflare_record.app.id
}

output "s3_bucket_name" {
  description = "S3 bucket that stores the static website."
  value       = aws_s3_bucket.site.bucket
}

output "s3_website_endpoint" {
  description = "S3 website endpoint used as DNS target."
  value       = aws_s3_bucket_website_configuration.site.website_endpoint
}

output "uploaded_object_count" {
  description = "Number of build artifacts uploaded by Terraform."
  value       = length(aws_s3_object.static)
}
